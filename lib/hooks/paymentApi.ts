/**
 * Payment API Service
 * Frontend service for payment processing with Stripe integration
 */

import axios, { AxiosInstance } from 'axios';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export interface PaymentIntentRequest {
    bookingId: string;
    amount: number;
    currency: string;
}

export interface PaymentConfirmRequest {
    paymentIntentId: string;
    bookingId: string;
}

export interface RefundRequest {
    paymentId: string;
    amount?: number;
    reason?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

class PaymentApiService {
    private client: AxiosInstance;
    private stripe: Promise<Stripe | null>;

    constructor() {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });

        this.stripe = stripePromise;

        // Add auth token to requests
        this.client.interceptors.request.use((config) => {
            const token = this.getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    private getAuthToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }

    /**
     * Create a payment intent
     */
    async createPaymentIntent(
        request: PaymentIntentRequest
    ): Promise<ApiResponse<{ clientSecret: string; paymentIntentId: string }>> {
        try {
            const response = await this.client.post('/payments/create-intent', request);
            return response.data;
        } catch (error: any) {
            console.error('Create payment intent error:', error);
            throw new Error(
                error.response?.data?.message || 'Failed to create payment intent'
            );
        }
    }

    /**
     * Confirm a payment
     */
    async confirmPayment(request: PaymentConfirmRequest): Promise<ApiResponse<any>> {
        try {
            const response = await this.client.post('/payments/confirm', request);
            return response.data;
        } catch (error: any) {
            console.error('Confirm payment error:', error);
            throw new Error(error.response?.data?.message || 'Failed to confirm payment');
        }
    }

    /**
     * Process a refund
     */
    async processRefund(request: RefundRequest): Promise<ApiResponse<any>> {
        try {
            const response = await this.client.post('/payments/refund', request);
            return response.data;
        } catch (error: any) {
            console.error('Process refund error:', error);
            throw new Error(error.response?.data?.message || 'Failed to process refund');
        }
    }

    /**
     * Get payment status
     */
    async getPaymentStatus(paymentId: string): Promise<ApiResponse<any>> {
        try {
            const response = await this.client.get(`/payments/status/${paymentId}`);
            return response.data;
        } catch (error: any) {
            console.error('Get payment status error:', error);
            throw new Error(
                error.response?.data?.message || 'Failed to get payment status'
            );
        }
    }

    /**
     * Get booking payments
     */
    async getBookingPayments(bookingId: string): Promise<ApiResponse<any[]>> {
        try {
            const response = await this.client.get(`/payments/booking/${bookingId}`);
            return response.data;
        } catch (error: any) {
            console.error('Get booking payments error:', error);
            throw new Error(
                error.response?.data?.message || 'Failed to get booking payments'
            );
        }
    }

    /**
     * Process payment with Stripe Elements
     * 
     * This is a complete payment flow that handles:
     * 1. Creating payment intent
     * 2. Confirming payment with Stripe
     * 3. Confirming payment with backend
     */
    async processPaymentWithElements(
        elements: StripeElements,
        bookingId: string,
        amount: number,
        currency: string = 'usd'
    ): Promise<{ success: boolean; message: string; data?: any }> {
        try {
            const stripe = await this.stripe;
            if (!stripe) {
                throw new Error('Stripe is not initialized');
            }

            // Step 1: Create payment intent
            const intentResponse = await this.createPaymentIntent({
                bookingId,
                amount,
                currency,
            });

            if (!intentResponse.success || !intentResponse.data?.clientSecret) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret, paymentIntentId } = intentResponse.data;

            // Step 2: Confirm payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/bookings/${bookingId}/confirmation`,
                },
                redirect: 'if_required',
            });

            if (stripeError) {
                throw new Error(stripeError.message || 'Payment failed');
            }

            if (paymentIntent.status !== 'succeeded') {
                throw new Error('Payment was not successful');
            }

            // Step 3: Confirm payment with backend
            const confirmResponse = await this.confirmPayment({
                paymentIntentId,
                bookingId,
            });

            if (!confirmResponse.success) {
                throw new Error(confirmResponse.message || 'Failed to confirm payment');
            }

            return {
                success: true,
                message: 'Payment processed successfully',
                data: confirmResponse.data,
            };
        } catch (error: any) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                message: error.message || 'Payment processing failed',
            };
        }
    }

    /**
     * Handle payment with payment method (for saved cards)
     */
    async processPaymentWithMethod(
        paymentMethodId: string,
        bookingId: string,
        amount: number,
        currency: string = 'usd'
    ): Promise<{ success: boolean; message: string; data?: any }> {
        try {
            const stripe = await this.stripe;
            if (!stripe) {
                throw new Error('Stripe is not initialized');
            }

            // Create payment intent
            const intentResponse = await this.createPaymentIntent({
                bookingId,
                amount,
                currency,
            });

            if (!intentResponse.success || !intentResponse.data?.clientSecret) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret, paymentIntentId } = intentResponse.data;

            // Confirm payment with payment method
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: paymentMethodId,
            });

            if (error) {
                throw new Error(error.message || 'Payment failed');
            }

            if (paymentIntent.status !== 'succeeded') {
                throw new Error('Payment was not successful');
            }

            // Confirm with backend
            const confirmResponse = await this.confirmPayment({
                paymentIntentId,
                bookingId,
            });

            if (!confirmResponse.success) {
                throw new Error(confirmResponse.message || 'Failed to confirm payment');
            }

            return {
                success: true,
                message: 'Payment processed successfully',
                data: confirmResponse.data,
            };
        } catch (error: any) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                message: error.message || 'Payment processing failed',
            };
        }
    }

    /**
     * Get Stripe instance
     */
    async getStripe(): Promise<Stripe | null> {
        return this.stripe;
    }
}

// Export singleton instance
export const paymentApi = new PaymentApiService();

// Export default
export default paymentApi;