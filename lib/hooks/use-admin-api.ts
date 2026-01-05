/**
 * Admin API Hooks
 * Custom React hooks for all admin API calls
 */

import useSWR from 'swr';
import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Fetcher function with auth token
async function fetcher(url: string) {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const error: any = new Error('An error occurred while fetching the data.');
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }

    const data = await res.json();
    return data.data || data;
}

// Generic mutation function
async function mutate(url: string, method: string, data?: any) {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(url, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
    });

    const responseData = await res.json();

    if (!res.ok) {
        throw new Error(responseData.message || 'Operation failed');
    }

    return responseData.data || responseData;
}

// ===== Dashboard =====

export function useAdminDashboard() {
    const { data, error, isLoading, mutate } = useSWR(
        `${API_BASE}/admin/dashboard`,
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
        `${API_BASE}/admin/users${queryString ? `?${queryString}` : ''}`,
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
        userId ? `${API_BASE}/admin/users/${userId}` : null,
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
            const result = await mutate(`${API_BASE}/admin/users/${userId}`, 'PATCH', userData);
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
        `${API_BASE}/admin/bookings${queryString ? `?${queryString}` : ''}`,
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
        bookingId ? `${API_BASE}/admin/bookings/${bookingId}` : null,
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
            const result = await mutate(`${API_BASE}/admin/bookings/${bookingId}`, 'PATCH', bookingData);
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

// Similarly implement other hooks for quotes, packages, payments, and contacts
// Following the same pattern shown above

export function useQuotes(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const { data, error, isLoading, mutate } = useSWR(
        `${API_BASE}/admin/quotes${queryString ? `?${queryString}` : ''}`,
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
        `${API_BASE}/admin/packages${queryString ? `?${queryString}` : ''}`,
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
        `${API_BASE}/admin/payments${queryString ? `?${queryString}` : ''}`,
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
        `${API_BASE}/admin/contacts${queryString ? `?${queryString}` : ''}`,
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
