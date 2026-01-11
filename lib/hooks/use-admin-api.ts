/**
 * Admin API Hooks
 * Custom React hooks for all admin API calls
 * Uses centralized apiClient for auth and consistency
 */

import useSWR from 'swr';
import { useState } from 'react';
import apiClient from '../api-client';

// Fetcher function using apiClient
// Url acts as the key AND the path
// apiClient base url is set to backend root.
// If keys are passed as absolute paths starting with http... apiClient (axios) handles it? 
// Actually axios baseURL is prepended ONLY if url is relative.
// Existing code had `${API_BASE}/admin/dashboard` as the key.
// But we want to use apiClient.
// If we pass a relative URL '/admin/dashboard', apiClient will prepend the base.
// That is cleaner.
async function fetcher(url: string) {
    // apiClient returns the data directly.
    // If the response shape is { success, data } we might need to unwrap.
    // However, apiClient interceptor currently returns `response.data`.
    // The previous fetcher did `data.data || data`.
    // Let's assume apiClient returns the JSON body.
    // If Flask returns { data: ... }, we return that.

    // NOTE: apiClient response interceptor: `return response.data;`
    // So the result IS the JSON object.
    const result: any = await apiClient.get(url);
    return result.data || result;
}

// Generic mutation function
async function mutateData(url: string, method: string, data?: any) {
    const result: any = await apiClient.request({
        url,
        method,
        data
    });
    return result.data || result;
}

// Helper to make SWR keys relative
// Assuming API_BASE matches apiClient's base
// We will just use relative paths for keys.

// ===== Dashboard =====

export function useAdminDashboard() {
    const { data, error, isLoading, mutate } = useSWR(
        '/admin/dashboard',
        fetcher
    );

    return {
        dashboard: data,
        isLoading,
        isError: error,
        error,
        refresh: mutate,
    };
}

// ===== Users Management =====

export function useUsers(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const { data, error, isLoading, mutate } = useSWR(
        `/admin/users${queryString ? `?${queryString}` : ''}`,
        fetcher
    );

    return {
        users: data?.users || [],
        pagination: data?.pagination,
        isLoading,
        isError: error,
        error,
        refresh: mutate,
    };
}

export function useUser(userId: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        userId ? `/admin/users/${userId}` : null,
        fetcher
    );

    return {
        user: data?.user,
        isLoading,
        isError: error,
        error,
        refresh: mutate,
    };
}

export function useUpdateUser() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateUser = async (userId: string, userData: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await mutateData(`/admin/users/${userId}`, 'PATCH', userData);
            setIsLoading(false);
            return result;
        } catch (err: any) {
            setError(err);
            setIsLoading(false);
            throw err;
        }
    };

    return { updateUser, isLoading, error };
}

// ===== Bookings Management =====

export function useBookings(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const { data, error, isLoading, mutate } = useSWR(
        `/admin/bookings${queryString ? `?${queryString}` : ''}`,
        fetcher
    );

    return {
        bookings: data?.bookings || [],
        pagination: data?.pagination,
        isLoading,
        isError: error,
        error,
        refresh: mutate,
    };
}

export function useBooking(bookingId: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        bookingId ? `/admin/bookings/${bookingId}` : null,
        fetcher
    );

    return {
        booking: data?.booking,
        isLoading,
        isError: error,
        error,
        refresh: mutate,
    };
}

export function useUpdateBooking() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateBooking = async (bookingId: string, bookingData: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await mutateData(`/admin/bookings/${bookingId}`, 'PATCH', bookingData);
            setIsLoading(false);
            return result;
        } catch (err: any) {
            setError(err);
            setIsLoading(false);
            throw err;
        }
    };

    return { updateBooking, isLoading, error };
}

export function useCancelBooking() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const cancelBooking = async (bookingId: string, reason: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await mutateData(`/admin/bookings/${bookingId}/cancel`, 'POST', { reason });
            setIsLoading(false);
            return result;
        } catch (err: any) {
            setError(err);
            setIsLoading(false);
            throw err;
        }
    };

    return { cancelBooking, isLoading, error };
}

// ===== Quotes, Packages, Payments, Contacts =====

export function useQuotes(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const { data, error, isLoading, mutate } = useSWR(
        `/admin/quotes${queryString ? `?${queryString}` : ''}`,
        fetcher
    );

    return {
        quotes: data?.quotes || [],
        pagination: data?.pagination,
        isLoading,
        isError: error,
        error,
        refresh: mutate,
    };
}

export function usePackages(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const { data, error, isLoading, mutate } = useSWR(
        `/admin/packages${queryString ? `?${queryString}` : ''}`,
        fetcher
    );

    return {
        packages: data?.packages || [],
        pagination: data?.pagination,
        isLoading,
        isError: error,
        error,
        refresh: mutate,
    };
}

export function usePayments(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const { data, error, isLoading, mutate } = useSWR(
        `/admin/payments${queryString ? `?${queryString}` : ''}`,
        fetcher
    );

    return {
        payments: data?.payments || [],
        pagination: data?.pagination,
        isLoading,
        isError: error,
        error,
        refresh: mutate,
    };
}

export function useContactMessages(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const { data, error, isLoading, mutate } = useSWR(
        `/admin/contacts${queryString ? `?${queryString}` : ''}`,
        fetcher
    );

    return {
        contacts: data?.contacts || [],
        pagination: data?.pagination,
        isLoading,
        isError: error,
        error,
        refresh: mutate,
    };
}

export function useUpdateContactMessage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateContact = async (contactId: string, data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await mutateData(`/admin/contacts/${contactId}`, 'PATCH', data);
            setIsLoading(false);
            return result;
        } catch (err: any) {
            setError(err);
            setIsLoading(false);
            throw err;
        }
    };

    return { updateContact, isLoading, error };
}

export function useDeleteContactMessage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const deleteContact = async (contactId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await mutateData(`/admin/contacts/${contactId}`, 'DELETE');
            setIsLoading(false);
            return result;
        } catch (err: any) {
            setError(err);
            setIsLoading(false);
            throw err;
        }
    };

    return { deleteContact, isLoading, error };
}

export function useUpdateQuote() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateQuote = async (quoteId: string, data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await mutateData(`/admin/quotes/${quoteId}`, 'PATCH', data);
            setIsLoading(false);
            return result;
        } catch (err: any) {
            setError(err);
            setIsLoading(false);
            throw err;
        }
    };

    return { updateQuote, isLoading, error };
}

export function useCreatePackage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createPackage = async (data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await mutateData(`/admin/packages`, 'POST', data);
            setIsLoading(false);
            return result;
        } catch (err: any) {
            setError(err);
            setIsLoading(false);
            throw err;
        }
    };

    return { createPackage, isLoading, error };
}

export function useUpdatePackage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updatePackage = async (packageId: string, data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await mutateData(`/admin/packages/${packageId}`, 'PATCH', data);
            setIsLoading(false);
            return result;
        } catch (err: any) {
            setError(err);
            setIsLoading(false);
            throw err;
        }
    };

    return { updatePackage, isLoading, error };
}

export function useRefundPayment() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refundPayment = async (paymentId: string, amount: number, reason: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await mutateData(`/admin/payments/${paymentId}/refund`, 'POST', { amount, reason });
            setIsLoading(false);
            return result;
        } catch (err: any) {
            setError(err);
            setIsLoading(false);
            throw err;
        }
    };

    return { refundPayment, isLoading, error };
}
