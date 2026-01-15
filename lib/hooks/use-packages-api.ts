
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
        featured: data?.data?.featured || [],
        packages: data?.data?.all_packages || [],
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
        booked: data?.data?.booked || [],
        saved: data?.data?.saved || [],
        isLoading,
        isError: error,
        mutate
    };
}


export function usePackageDetails(id: string | null) {
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

export function usePackagesApi() {
    const toggleWishlist = async (packageId: string, isSaved: boolean) => {
        const token = tokenManager.getAccessToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const method = isSaved ? 'POST' : 'DELETE';
        const url = `/api/packages/${packageId}/favorite`;

        const res = await fetch(url, {
            method,
            headers
        });

        if (!res.ok) {
            throw new Error('Failed to update wishlist');
        }

        return res.json();
    };

    return { toggleWishlist };
}
