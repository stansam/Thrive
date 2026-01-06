/**
 * Flight API Service
 * Frontend service for interacting with flight booking APIs
 */

import axios, { AxiosError, AxiosInstance } from 'axios';

// Types
export interface FlightSearchParams {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
    nonStop?: boolean;
    maxPrice?: number;
    currency?: string;
    maxResults?: number;
}

export interface MultiCitySegment {
    origin: string;
    destination: string;
    departureDate: string;
}

export interface MultiCitySearchParams {
    segments: MultiCitySegment[];
    adults: number;
    children?: number;
    travelClass?: string;
    maxResults?: number;
}

export interface TravelerInfo {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'UNDISCLOSED';
    email: string;
    phone: {
        countryCode: string;
        number: string;
    };
    nationality?: string;
    documents?: Array<{
        documentType: 'PASSPORT' | 'ID';
        number: string;
        expiryDate: string;
        issuanceCountry: string;
        nationality: string;
    }>;
    travelerType?: 'ADULT' | 'CHILD' | 'INFANT';
    mealPreference?: string;
    specialAssistance?: string;
}

export interface BookingRequest {
    flightOffers: any[];
    travelers: TravelerInfo[];
    paymentMethod: string;
    specialRequests?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    details?: any;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        perPage: number;
        total: number;
        pages: number;
    };
}

// API Error Class
export class FlightApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public errorCode?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'FlightApiError';
    }
}

// API Client Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const API_TIMEOUT = 30000; // 30 seconds

class FlightApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Enable cookies for authentication
        });

        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Add auth token if available
                const token = this.getAuthToken();
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
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError<ApiResponse<any>>) => {
                return this.handleError(error);
            }
        );
    }

    private getAuthToken(): string | null {
        // Get token from localStorage or cookies
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }

    private handleError(error: AxiosError<ApiResponse<any>>): Promise<never> {
        if (error.response) {
            // Server responded with error
            const { data, status } = error.response;

            return Promise.reject(
                new FlightApiError(
                    data?.message || 'An error occurred',
                    status,
                    data?.error,
                    data?.details
                )
            );
        } else if (error.request) {
            // Request made but no response
            return Promise.reject(
                new FlightApiError(
                    'No response from server. Please check your connection.',
                    undefined,
                    'NETWORK_ERROR'
                )
            );
        } else {
            // Error setting up request
            return Promise.reject(
                new FlightApiError(
                    error.message || 'An unexpected error occurred',
                    undefined,
                    'REQUEST_ERROR'
                )
            );
        }
    }

    // ==================== SEARCH ENDPOINTS ====================

    /**
     * Search for flight offers
     */
    async searchFlights(params: FlightSearchParams): Promise<ApiResponse<any>> {
        try {
            const response = await this.client.post<ApiResponse<any>>(
                '/flights/search',
                params
            );
            return response.data;
        } catch (error) {
            if (error instanceof FlightApiError) {
                throw error;
            }
            throw new FlightApiError('Failed to search flights');
        }
    }

    /**
     * Search for multi-city flight offers
     */
    async searchMultiCity(params: MultiCitySearchParams): Promise<ApiResponse<any>> {
        try {
            const response = await this.client.post<ApiResponse<any>>(
                '/flights/search/multi-city',
                params
            );
            return response.data;
        } catch (error) {
            if (error instanceof FlightApiError) {
                throw error;
            }
            throw new FlightApiError('Failed to search multi-city flights');
        }
    }

    // ==================== PRICING ENDPOINTS ====================

    /**
     * Confirm flight offer price
     */
    async confirmPrice(
        flightOffers: any[],
        include?: string[]
    ): Promise<ApiResponse<any>> {
        try {
            const response = await this.client.post<ApiResponse<any>>(
                '/flights/price',
                {
                    flightOffers,
                    include,
                }
            );
            return response.data;
        } catch (error) {
            if (error instanceof FlightApiError) {
                throw error;
            }
            throw new FlightApiError('Failed to confirm price');
        }
    }

    // ==================== BOOKING ENDPOINTS ====================

    /**
     * Create a new booking
     */
    async createBooking(bookingData: BookingRequest): Promise<ApiResponse<any>> {
        try {
            const response = await this.client.post<ApiResponse<any>>(
                '/flights/book',
                bookingData
            );
            return response.data;
        } catch (error) {
            if (error instanceof FlightApiError) {
                throw error;
            }
            throw new FlightApiError('Failed to create booking');
        }
    }

    /**
     * Confirm booking with payment
     */
    async confirmBooking(
        bookingId: string,
        paymentIntentId: string
    ): Promise<ApiResponse<any>> {
        try {
            const response = await this.client.post<ApiResponse<any>>(
                '/flights/book/confirm',
                {
                    bookingId,
                    paymentIntentId,
                }
            );
            return response.data;
        } catch (error) {
            if (error instanceof FlightApiError) {
                throw error;
            }
            throw new FlightApiError('Failed to confirm booking');
        }
    }

    // ==================== BOOKING MANAGEMENT ====================

    /**
     * Get user's bookings
     */
    async getUserBookings(
        page: number = 1,
        perPage: number = 20,
        status?: string
    ): Promise<PaginatedResponse<any>> {
        try {
            const params: any = { page, per_page: perPage };
            if (status) params.status = status;

            const response = await this.client.get<PaginatedResponse<any>>(
                '/flights/bookings',
                { params }
            );
            return response.data;
        } catch (error) {
            if (error instanceof FlightApiError) {
                throw error;
            }
            throw new FlightApiError('Failed to fetch bookings');
        }
    }

    /**
     * Get booking details
     */
    async getBookingDetails(bookingId: string): Promise<ApiResponse<any>> {
        try {
            const response = await this.client.get<ApiResponse<any>>(
                `/flights/bookings/${bookingId}`
            );
            return response.data;
        } catch (error) {
            if (error instanceof FlightApiError) {
                throw error;
            }
            throw new FlightApiError('Failed to fetch booking details');
        }
    }

    /**
     * Cancel a booking
     */
    async cancelBooking(bookingId: string): Promise<ApiResponse<any>> {
        try {
            const response = await this.client.post<ApiResponse<any>>(
                `/flights/bookings/${bookingId}/cancel`
            );
            return response.data;
        } catch (error) {
            if (error instanceof FlightApiError) {
                throw error;
            }
            throw new FlightApiError('Failed to cancel booking');
        }
    }
}

// Export singleton instance
export const flightApi = new FlightApiService();

// Export default
export default flightApi;