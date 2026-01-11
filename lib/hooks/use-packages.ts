import useSWR from 'swr';
import apiClient from '@/lib/api-client';
import { Package } from '@/lib/types/package';

export interface FeaturedPackagesResponse {
    success: boolean;
    data: Package[];
    message: string;
}

export function useFeaturedPackages(limit: number = 10) {
    const { data, error, isLoading } = useSWR<FeaturedPackagesResponse>(
        [`/packages/featured`, limit],
        () => apiClient.get<any, FeaturedPackagesResponse>(`/packages/featured?limit=${limit}`)
    );

    return {
        packages: data?.data || [],
        isLoading,
        isError: error,
    };
}
