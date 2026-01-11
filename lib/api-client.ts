/**
 * API Client for Dashboard endpoints
 * Handles authentication, error handling, auto-refresh, and request/response formatting
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import type { APIResponse, APIError } from './types/dashboard';
import { tokenManager } from './auth/token-manager';

// Create axios instance with default config
// Note: This matches the existing configuration but removes manual localStorage handling here
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Flag to prevent multiple refresh calls
let isRefreshing = false;
// Queue for failed requests
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });

    failedQueue = [];
};

// Request interceptor - add auth token from TokenManager
apiClient.interceptors.request.use(
    (config) => {
        const token = tokenManager.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors and extract data
apiClient.interceptors.response.use(
    (response) => {
        // Return the data directly for successful responses
        return response.data;
    },
    async (error: AxiosError<APIError>) => {
        const originalRequest = error.config as any;

        // Extract error data
        let errorData = error.response?.data || { success: false, message: error.message || 'An unexpected error occurred' };

        // Handle 401 Unauthorized (Token Expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call the Next.js Proxy Refresh endpoint
                // We use fetch here to avoid using the same axios instance and causing loops
                const refreshResponse = await fetch('/api/auth/refresh', {
                    method: 'POST',
                });

                const refreshData = await refreshResponse.json();

                if (!refreshResponse.ok) {
                    throw new Error(refreshData.message || 'Refresh failed');
                }

                const { accessToken } = refreshData.data;

                // Update token manager
                tokenManager.setAccessToken(accessToken);

                // Process queue
                processQueue(null, accessToken);

                // Retry original request
                originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
                return apiClient(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                // Clear state on failure
                tokenManager.clearToken();
                // Optionally redirect to login, but AuthContext usually handles the "user is null" state
                if (typeof window !== 'undefined') {
                    window.location.href = '/sign-in'; // Enforce login redirect
                }
                return Promise.reject(errorData);
            } finally {
                isRefreshing = false;
            }
        }

        // Return standardized error rejection
        return Promise.reject(errorData);
    }
);

// ============================================================================
// Dashboard API Methods
// ============================================================================

export const dashboardAPI = {
    // Dashboard Summary
    getSummary: () => {
        return apiClient.get<any, APIResponse>('/client/dashboard/summary');
    },

    // Profile Management
    getProfile: () => {
        return apiClient.get<any, APIResponse>('/client/dashboard/profile');
    },

    updateProfile: (data: any) => {
        return apiClient.put<any, APIResponse>('/client/dashboard/profile', data);
    },

    // Subscriptions
    getSubscriptions: () => {
        return apiClient.get<any, APIResponse>('/client/dashboard/subscriptions');
    },

    upgradeSubscription: (data: { tier: string; paymentMethodId?: string }) => {
        return apiClient.post<any, APIResponse>('/client/dashboard/subscriptions/upgrade', data);
    },

    // Bookings
    getBookings: (params?: any) => {
        return apiClient.get<any, APIResponse>('/client/dashboard/bookings', { params });
    },

    getBookingDetails: (bookingId: string) => {
        return apiClient.get<any, APIResponse>(`/client/dashboard/bookings/${bookingId}`);
    },

    cancelBooking: (bookingId: string, data: { reason: string; requestRefund?: boolean }) => {
        return apiClient.post<any, APIResponse>(`/client/dashboard/bookings/${bookingId}/cancel`, data);
    },

    // Trips
    getTrips: (params?: any) => {
        return apiClient.get<any, APIResponse>('/client/dashboard/trips', { params });
    },

    getTripDetails: (tripId: string) => {
        return apiClient.get<any, APIResponse>(`/client/dashboard/trips/${tripId}`);
    },

    // Contact
    submitContact: (data: any) => {
        return apiClient.post<any, APIResponse>('/client/dashboard/contact', data);
    },

    // Notifications
    getNotifications: (params?: any) => {
        return apiClient.get<any, APIResponse>('/client/dashboard/notifications', { params });
    },

    markNotificationRead: (notificationId: string) => {
        return apiClient.put<any, APIResponse>(`/client/dashboard/notifications/${notificationId}/read`);
    },
};

export default apiClient;
