import useSWR from 'swr';
import adminClient from '../admin-api-client';
import { useAuth } from '../auth-context';

// Fetcher function using adminClient, matching use-admin-api.ts pattern
async function fetcher(url: string) {
    const result: any = await adminClient.get(url);
    // The APIResponse wrapper format is { success: boolean, data: any, message: string }
    return result?.data || result;
}

export function useAdminFlight(reference: string | null) {
    const { isAuthenticated, loading } = useAuth();

    // Only fetch if reference exists AND we are authenticated and done loading.
    // This prevents race conditions where the token is not yet in the tokenManager.
    const shouldFetch = reference && !loading && isAuthenticated;

    const { data, error, isLoading, mutate } = useSWR(
        shouldFetch ? `/admin/flights/${reference}` : null,
        fetcher,
        {
            shouldRetryOnError: false,
            revalidateOnFocus: false
        }
    );

    return {
        booking: data,
        // We are loading if auth is loading OR if SWR is fetching (and we decided to fetch)
        isLoading: loading || (!!shouldFetch && isLoading),
        isError: error,
        error,
        refresh: mutate,
    };
}
