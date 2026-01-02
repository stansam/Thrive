/**
 * API Client for Dashboard endpoints
 * Handles authentication, error handling, and request/response formatting
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import type { APIResponse, APIError } from './types/dashboard';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
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
    (error: AxiosError<APIError>) => {
        // Handle different error scenarios
        if (error.response) {
            const { status, data } = error.response;

            // Token expired or invalid - redirect to login
            if (status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/sign-in?redirect=' + encodeURIComponent(window.location.pathname);
                }
            }

            // Return error data
            return Promise.reject(data || { success: false, message: 'An error occurred' });
        } else if (error.request) {
            // Request made but no response received
            return Promise.reject({
                success: false,
                message: 'Network error. Please check your connection.',
            });
        } else {
            // Something else happened
            return Promise.reject({
                success: false,
                message: error.message || 'An unexpected error occurred',
            });
        }
    }
);

// ============================================================================
// Dashboard API Methods
// ============================================================================

export const dashboardAPI = {
    // Dashboard Summary
    getSummary: () => {
        return apiClient.get<any, APIResponse>('/api/client/dashboard/summary');
    },

    // Profile Management
    getProfile: () => {
        return apiClient.get<any, APIResponse>('/api/client/dashboard/profile');
    },

    updateProfile: (data: any) => {
        return apiClient.put<any, APIResponse>('/api/client/dashboard/profile', data);
    },

    // Subscriptions
    getSubscriptions: () => {
        return apiClient.get<any, APIResponse>('/api/client/dashboard/subscriptions');
    },

    upgradeSubscription: (data: { tier: string; paymentMethodId?: string }) => {
        return apiClient.post<any, APIResponse>('/api/client/dashboard/subscriptions/upgrade', data);
    },

    // Bookings
    getBookings: (params?: any) => {
        return apiClient.get<any, APIResponse>('/api/client/dashboard/bookings', { params });
    },

    getBookingDetails: (bookingId: string) => {
        return apiClient.get<any, APIResponse>(`/api/client/dashboard/bookings/${bookingId}`);
    },

    cancelBooking: (bookingId: string, data: { reason: string; requestRefund?: boolean }) => {
        return apiClient.post<any, APIResponse>(`/api/client/dashboard/bookings/${bookingId}/cancel`, data);
    },

    // Trips
    getTrips: (params?: any) => {
        return apiClient.get<any, APIResponse>('/api/client/dashboard/trips', { params });
    },

    getTripDetails: (tripId: string) => {
        return apiClient.get<any, APIResponse>(`/api/client/dashboard/trips/${tripId}`);
    },

    // Contact
    submitContact: (data: any) => {
        return apiClient.post<any, APIResponse>('/api/client/dashboard/contact', data);
    },

    // Notifications
    getNotifications: (params?: any) => {
        return apiClient.get<any, APIResponse>('/api/client/dashboard/notifications', { params });
    },

    markNotificationRead: (notificationId: string) => {
        return apiClient.put<any, APIResponse>(`/api/client/dashboard/notifications/${notificationId}/read`);
    },
};

export default apiClient;
