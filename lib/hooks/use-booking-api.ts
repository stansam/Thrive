
import useSWR from 'swr';
import { tokenManager } from '../auth/token-manager';

// Fetcher for useSWR
const fetcher = async (url: string) => {
    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        throw error;
    }
    return res.json();
};

export function useBookingDetails(reference: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        reference ? `/api/bookings/${reference}` : null,
        fetcher
    );

    return {
        booking: data?.data?.booking,
        isLoading,
        isError: error,
        mutate
    };
}

export function useBookingApi() {
    const getHeaders = () => {
        const token = tokenManager.getAccessToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };

    const submitBookingRequest = async (data: any) => {
        const res = await fetch('/api/bookings/request', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });

        const json = await res.json();

        if (!res.ok) {
            throw new Error(json.message || 'Failed to submit booking request');
        }

        return json;
    };

    const createPaymentIntent = async (bookingReference: string) => {
        const res = await fetch('/api/payments/create-intent', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ bookingReference }),
        });

        const json = await res.json();

        if (!res.ok) {
            throw new Error(json.message || 'Failed to create payment intent');
        }

        return json;
    };

    const confirmPayment = async (paymentIntentId: string, bookingReference: string) => {
        const res = await fetch('/api/payments/confirm', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ paymentIntentId, bookingReference }),
        });

        const json = await res.json();

        if (!res.ok) {
            throw new Error(json.message || 'Failed to confirm payment');
        }

        return json;
    };

    return {
        submitBookingRequest,
        createPaymentIntent,
        confirmPayment
    };
}
