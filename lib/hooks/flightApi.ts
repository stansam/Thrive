/**
 * Flight API Service
 * Frontend service for interacting with flight booking APIs
 * Uses centralized apiClient for auth and error handling
 */

import { AxiosError } from 'axios';
import apiClient from '../api-client';
import { APIResponse, PaginatedResponse } from '../types/dashboard';

// Types (Keep existing interfaces)
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
    returnDate?: string;
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

class FlightApiService {
    // Helper to normalize errors from apiClient
    private handleError(error: any): Promise<never> {
        // apiClient already unwraps response errors somewhat, but we might want to map to FlightApiError
        const message = error.message || 'An error occurred';
        const status = error.status || (error.response ? error.response.status : undefined);
        const code = error.code || 'UNKNOWN';
        const details = error.details || error.data;

        return Promise.reject(new FlightApiError(message, status, code, details));
    }

    // ==================== SEARCH ENDPOINTS ====================

    async searchFlights(params: FlightSearchParams): Promise<APIResponse<any>> {
        try {
            // apiClient returns response.data directly
            return await apiClient.post('/flights/search', params);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async searchMultiCity(params: MultiCitySearchParams): Promise<APIResponse<any>> {
        try {
            return await apiClient.post('/flights/search/multi-city', params);
        } catch (error) {
            return this.handleError(error);
        }
    }

    // ==================== PRICING ENDPOINTS ====================

    async confirmPrice(
        flightOffers: any[],
        include?: string[]
    ): Promise<APIResponse<any>> {
        try {
            return await apiClient.post('/flights/price', {
                flightOffers,
                include,
            });
        } catch (error) {
            return this.handleError(error);
        }
    }

    // ==================== BOOKING ENDPOINTS ====================

    async createBooking(bookingData: BookingRequest): Promise<APIResponse<any>> {
        try {
            return await apiClient.post('/flights/book', bookingData);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async confirmBooking(
        bookingId: string,
        paymentIntentId: string
    ): Promise<APIResponse<any>> {
        try {
            return await apiClient.post('/flights/book/confirm', {
                bookingId,
                paymentIntentId,
            });
        } catch (error) {
            return this.handleError(error);
        }
    }

    // ==================== BOOKING MANAGEMENT ====================

    async getUserBookings(
        page: number = 1,
        perPage: number = 20,
        status?: string
    ): Promise<PaginatedResponse<any>> {
        try {
            const params: any = { page, per_page: perPage };
            if (status) params.status = status;

            return await apiClient.get('/flights/bookings', { params });
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getBookingDetails(bookingId: string): Promise<APIResponse<any>> {
        try {
            return await apiClient.get(`/flights/bookings/${bookingId}`);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async cancelBooking(bookingId: string): Promise<APIResponse<any>> {
        try {
            return await apiClient.post(`/flights/bookings/${bookingId}/cancel`);
        } catch (error) {
            return this.handleError(error);
        }
    }
}

export const flightApi = new FlightApiService();
export default flightApi;