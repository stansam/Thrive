
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

export function useExplorePackages(params: any = {}) {
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== '')
    );
    const queryString = new URLSearchParams(cleanParams as any).toString();

    const { data, error, isLoading, mutate } = useSWR(
        `/api/dashboard/packages/explore?${queryString}`,
        fetcher
    );

    return {
        featured: data?.featured || [],
        packages: data?.all_packages || [],
        isLoading,
        isError: error,
        mutate
    };
}

export function useMyPackages(params: any = {}) {
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== '')
    );
    const queryString = new URLSearchParams(cleanParams as any).toString();

    const { data, error, isLoading, mutate } = useSWR(
        `/api/dashboard/packages/my-packages?${queryString}`,
        fetcher
    );

    return {
        booked: data?.booked || [],
        saved: data?.saved || [],
        isLoading,
        isError: error,
        mutate
    };
}

export function usePackageDetails(id: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        id ? `/api/dashboard/bookings/${id}` : null, // Assuming package bookings use same booking endpoint or specific one. api_specs said /bookings/[id] works for both? Let's check api_specs.
        // api_specs: GET /api/dashboard/flights/[id] and /api/dashboard/packages/explore? 
        // Docs say: GET `/api/dashboard/bookings/[id]` for generic details?
        // Implementation Plan said: `/app/api/dashboard/bookings/[id]/route.ts`.
        // So I will use that.
        fetcher
    );

    return {
        booking: data,
        isLoading,
        isError: error,
        mutate
    };
}
