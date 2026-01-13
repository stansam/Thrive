/**
 * Custom React hooks for Dashboard API data fetching
 * Uses SWR for caching, revalidation, and optimistic updates
 */

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { dashboardAPI } from '../api-client';
import type {
    DashboardSummary,
    User,
    BookingsResponse,
    Booking,
    TripsResponse,
    Trip,
    SubscriptionsResponse,
    NotificationsResponse,
    BookingFilters,
    ProfileUpdateData,
    ContactFormData,
    SubscriptionUpgradeData,
    PaymentFilters,
    ExtendedPayment,
    PaymentsResponse,
} from '../types/dashboard';

// ============================================================================
// Dashboard Summary Hook
// ============================================================================

export function useDashboardSummary() {
    const { data, error, isLoading, mutate: refresh } = useSWR(
        'dashboard-summary',
        () => dashboardAPI.getSummary(),
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        }
    );

    return {
        summary: data?.data as DashboardSummary | undefined,
        isLoading,
        isError: !!error,
        error,
        refresh,
    };
}

// ============================================================================
// Profile Hooks
// ============================================================================

export function useProfile() {
    const { data, error, isLoading, mutate: refresh } = useSWR(
        'user-profile',
        () => dashboardAPI.getProfile(),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    const updateProfile = async (profileData: ProfileUpdateData) => {
        try {
            const response = await dashboardAPI.updateProfile(profileData);

            // Optimistically update the cache
            await refresh();

            return response;
        } catch (error) {
            throw error;
        }
    };

    return {
        profile: data?.data?.profile as User | undefined,
        isLoading,
        isError: !!error,
        error,
        updateProfile,
        refresh,
    };
}

// ============================================================================
// Payments Hooks
// ============================================================================

export function usePayments(filters: PaymentFilters = {}) {
    const key = ['payments', JSON.stringify(filters)];

    const { data, error, isLoading, mutate: refresh } = useSWR(
        key,
        () => dashboardAPI.getPayments(filters),
        {
            revalidateOnFocus: false,
            keepPreviousData: true,
        }
    );

    return {
        payments: data?.data?.payments as ExtendedPayment[] | undefined,
        pagination: data?.data?.pagination,
        isLoading,
        isError: !!error,
        error,
        refresh,
    };
}

// ============================================================================
// Bookings Hooks
// ============================================================================

export function useBookings(filters: BookingFilters = {}) {
    const key = ['bookings', JSON.stringify(filters)];

    const { data, error, isLoading, mutate: refresh } = useSWR(
        key,
        () => dashboardAPI.getBookings(filters),
        {
            revalidateOnFocus: false,
            keepPreviousData: true,
        }
    );

    return {
        bookings: data?.data?.bookings as Booking[] | undefined,
        pagination: data?.data?.pagination,
        isLoading,
        isError: !!error,
        error,
        refresh,
    };
}

export function useBookingDetails(bookingId: string | null) {
    const { data, error, isLoading, mutate: refresh } = useSWR(
        bookingId ? ['booking-details', bookingId] : null,
        () => bookingId ? dashboardAPI.getBookingDetails(bookingId) : null,
        {
            revalidateOnFocus: false,
        }
    );

    return {
        booking: data?.data?.booking as Booking | undefined,
        isLoading,
        isError: !!error,
        error,
        refresh,
    };
}

export function useCancelBooking() {
    const cancelBooking = async (
        bookingId: string,
        data: { reason: string; requestRefund?: boolean }
    ) => {
        try {
            const response = await dashboardAPI.cancelBooking(bookingId, data);

            // Invalidate bookings cache to refresh the list
            mutate((key) => Array.isArray(key) && key[0] === 'bookings');
            mutate(['booking-details', bookingId]);
            mutate('dashboard-summary');

            return response;
        } catch (error) {
            throw error;
        }
    };

    return { cancelBooking };
}

// ============================================================================
// Trips Hooks
// ============================================================================

export function useTrips(filters: { status?: string; page?: number; perPage?: number } = {}) {
    const key = ['trips', JSON.stringify(filters)];

    const { data, error, isLoading, mutate: refresh } = useSWR(
        key,
        () => dashboardAPI.getTrips(filters),
        {
            revalidateOnFocus: false,
            keepPreviousData: true,
        }
    );

    return {
        trips: data?.data?.trips as Trip[] | undefined,
        pagination: data?.data?.pagination,
        isLoading,
        isError: !!error,
        error,
        refresh,
    };
}

export function useTripDetails(tripId: string | null) {
    const { data, error, isLoading, mutate: refresh } = useSWR(
        tripId ? ['trip-details', tripId] : null,
        () => tripId ? dashboardAPI.getTripDetails(tripId) : null,
        {
            revalidateOnFocus: false,
        }
    );

    return {
        trip: data?.data?.trip as Trip | undefined,
        isLoading,
        isError: !!error,
        error,
        refresh,
    };
}

// ============================================================================
// Subscriptions Hooks
// ============================================================================

export function useSubscriptions() {
    const { data, error, isLoading, mutate: refresh } = useSWR(
        'subscriptions',
        () => dashboardAPI.getSubscriptions(),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    const upgradeSubscription = async (upgradeData: SubscriptionUpgradeData) => {
        try {
            const response = await dashboardAPI.upgradeSubscription(upgradeData);

            // Refresh subscriptions and profile data
            await refresh();
            mutate('user-profile');
            mutate('dashboard-summary');

            return response;
        } catch (error) {
            throw error;
        }
    };

    return {
        subscriptions: data?.data as SubscriptionsResponse | undefined,
        currentSubscription: data?.data?.currentSubscription,
        availableTiers: data?.data?.availableTiers,
        isLoading,
        isError: !!error,
        error,
        refresh,
    };
}

export function useUpgradeSubscription() {
    const [isUpgrading, setIsUpgrading] = useState(false);

    const upgradeSubscription = async (upgradeData: SubscriptionUpgradeData) => {
        setIsUpgrading(true);
        try {
            const response = await dashboardAPI.upgradeSubscription(upgradeData);

            // Refresh subscriptions and profile data
            mutate('subscriptions');
            mutate('user-profile');
            mutate('dashboard-summary');

            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setIsUpgrading(false);
        }
    };

    return { upgradeSubscription, isUpgrading };
}

// ============================================================================
// Contact Hook
// ============================================================================

export function useContactForm() {
    const submitContact = async (formData: ContactFormData) => {
        try {
            const response = await dashboardAPI.submitContact(formData);
            return response;
        } catch (error) {
            throw error;
        }
    };

    return { submitContact };
}

// ============================================================================
// Notifications Hooks
// ============================================================================

export function useNotifications(params: { page?: number; perPage?: number; unreadOnly?: boolean } = {}) {
    const key = ['notifications', JSON.stringify(params)];

    const { data, error, isLoading, mutate: refresh } = useSWR(
        key,
        () => dashboardAPI.getNotifications(params),
        {
            refreshInterval: 30000, // Refresh every 30 seconds
            revalidateOnFocus: true,
        }
    );

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await dashboardAPI.markNotificationRead(notificationId);

            // Refresh notifications
            await refresh();
            mutate('dashboard-summary'); // Update unread count

            return response;
        } catch (error) {
            throw error;
        }
    };

    return {
        notifications: data?.data?.notifications,
        pagination: data?.data?.pagination,
        isLoading,
        isError: !!error,
        error,
        markAsRead,
        refresh,
    };
}

// ============================================================================
// Utility Hook for Global Refresh
// ============================================================================

export function useRefreshDashboard() {
    const refreshAll = () => {
        mutate('dashboard-summary');
        mutate('user-profile');
        mutate((key) => Array.isArray(key) && key[0] === 'bookings');
        mutate((key) => Array.isArray(key) && key[0] === 'trips');
        mutate((key) => Array.isArray(key) && key[0] === 'notifications');
        mutate('subscriptions');
    };

    return { refreshAll };
}
