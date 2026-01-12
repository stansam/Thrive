
import useSWR from 'swr';
import { tokenManager } from '../auth/token-manager';

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

export function useFlights(params: any = {}) {
    // Remove undefined/null params
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== '')
    );
    const queryString = new URLSearchParams(cleanParams as any).toString();

    const { data, error, isLoading, mutate } = useSWR(
        `/api/dashboard/flights?${queryString}`,
        fetcher
    );

    return {
        flights: data?.data?.flights || [],
        summary: data?.data?.summary,
        isLoading,
        isError: error,
        mutate
    };
}

export function useFlightDetails(id: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        id ? `/api/dashboard/bookings/${id}` : null,
        fetcher
    );

    return {
        booking: data?.data?.booking,
        isLoading,
        isError: error,
        mutate
    };
}
