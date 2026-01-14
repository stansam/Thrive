/**
 * Admin API Client
 * Specialized client for Admin Dashboard operations using the shared Axios instance configuration
 */

import axios, { AxiosError } from 'axios';
import { tokenManager } from './auth/token-manager';

// Create a dedicated axios instance for admin to allow for specific interceptors if needed later
// For now, it mirrors the main client but we can add admin-specific error handling or headers here
const adminClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor - add auth token
adminClient.interceptors.request.use(
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

// Response interceptor
adminClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error: AxiosError) => {
        // Here we could add specific handling for 403 Forbidden (Admin only)
        if (error.response?.status === 403) {
            console.error('Admin access denied');
            // Potential redirect or global toast could happen here
        }
        return Promise.reject(error.response?.data || error);
    }
);

export default adminClient;
