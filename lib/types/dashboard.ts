/**
 * TypeScript type definitions for Dashboard API responses
 */

// ============================================================================
// User & Profile Types
// ============================================================================

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    passportNumber?: string;
    passportExpiry?: string;
    nationality?: string;
    preferredAirline?: string;
    frequentFlyerNumbers?: Record<string, string>;
    dietaryPreferences?: string;
    specialAssistance?: string;
    companyName?: string;
    companyTaxId?: string;
    billingAddress?: string;
    subscriptionTier: 'none' | 'bronze' | 'silver' | 'gold';
    referralCode: string;
    referralCredits: number;
    emailVerified: boolean;
    isActive: boolean;
    createdAt: string;
}

export interface ProfileUpdateData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    passportNumber?: string;
    passportExpiry?: string;
    nationality?: string;
    preferredAirline?: string;
    frequentFlyerNumbers?: Record<string, string>;
    dietaryPreferences?: string;
    specialAssistance?: string;
    billingAddress?: string;
}

// ============================================================================
// Dashboard Summary Types
// ============================================================================

export interface DashboardStats {
    totalBookings: number;
    confirmedBookings: number;
    totalSpent: number;
    upcomingBookings: number;
    activeTrips: number;
    unreadNotifications: number;
}

export interface ChartDataPoint {
    name: string;
    total: number;
}

export interface RecentBooking {
    id: string;
    booking_reference: string;
    booking_type: string;
    status: string;
    destination: string;
    departure_date: string;
    total_price: number;
}

export interface DashboardSummary {
    stats: DashboardStats;
    recentBookings: RecentBooking[];
    chartData: ChartDataPoint[];
    subscriptionTier: string;
    hasActiveSubscription: boolean;
}

// ============================================================================
// Booking Types
// ============================================================================

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
export type BookingType = 'flight' | 'package' | 'hotel' | 'custom';
export type TripType = 'one_way' | 'round_trip' | 'multi_city';
export type TravelClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface Passenger {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    passportNumber?: string;
    nationality?: string;
    passengerType: 'adult' | 'child' | 'infant';
}

export interface Payment {
    id: string;
    payment_reference: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    cardLast4?: string;
    cardBrand?: string;
    payment_metadata?: any;
    failure_reason?: string;
    paid_at?: string;
    created_at: string;
}

export interface Booking {
    id: string;
    bookingReference: string;
    bookingType: BookingType;
    status: BookingStatus;
    tripType?: TripType;
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    airline?: string;
    flightNumber?: string;
    travelClass?: TravelClass;
    numAdults: number;
    numChildren: number;
    numInfants: number;
    basePrice: number;
    serviceFee: number;
    taxes: number;
    discount: number;
    totalPrice: number;
    paymentStatus: string;
    passengers?: Passenger[];
    payments?: Payment[];
    package?: PackageInfo;
    createdAt: string;
    updatedAt: string;
    timeline?: {
        requestedAt?: string;
        reviewedAt?: string;
        invoicedAt?: string;
        paidAt?: string;
        ticketedAt?: string;
    };
    updates?: {
        id: string;
        type: string;
        title: string;
        message: string;
        is_read: boolean;
        created_at: string;
    }[];
    documents?: {
        invoiceUrl?: string;
        ticketUrl?: string;
    };
}

export interface BookingFilters {
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    perPage?: number;
}

export interface PaymentFilters {
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    perPage?: number;
}

export interface ExtendedPayment extends Payment {
    description?: string;
    booking_reference?: string;
    booking_type?: string;
}

export interface PaymentsResponse {
    payments: ExtendedPayment[];
    pagination: PaginationInfo;
}

export interface PaginationInfo {
    page: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
    hasNext?: boolean;
    hasPrev?: boolean;
}

export interface BookingsResponse {
    bookings: Booking[];
    pagination: PaginationInfo;
}

// ============================================================================
// Package & Trip Types
// ============================================================================

export interface PackageInfo {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    destination: string;
    duration: string;
    hotelName: string;
    hotelRating: number;
    roomType?: string;
    featuredImage?: string;
    galleryImages?: string[];
    highlights?: string[];
    inclusions?: string[];
    exclusions?: string[];
    itinerary?: any[];
}

export interface Trip {
    id: string;
    bookingReference: string;
    status: BookingStatus;
    departureDate: string;
    returnDate?: string;
    totalPrice: number;
    package: PackageInfo;
    passengers?: Passenger[];
    createdAt: string;
}

export interface TripsResponse {
    trips: Trip[];
    pagination: PaginationInfo;
}

// ============================================================================
// Subscription Types
// ============================================================================

export interface SubscriptionTier {
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    maxBookings: number;
    benefits: string[];
}

export interface CurrentSubscription {
    tier: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    bookingsUsed: number;
    bookingsRemaining: number;
}

export interface SubscriptionsResponse {
    currentSubscription: CurrentSubscription;
    availableTiers: {
        bronze: SubscriptionTier;
        silver: SubscriptionTier;
        gold: SubscriptionTier;
    };
}

export interface SubscriptionUpgradeData {
    tier: 'bronze' | 'silver' | 'gold';
    paymentMethodId?: string;
}

// ============================================================================
// Contact & Support Types
// ============================================================================

export type ContactCategory = 'general' | 'booking' | 'payment' | 'technical' | 'feedback';

export interface ContactFormData {
    category: ContactCategory;
    subject: string;
    message: string;
    bookingReference?: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
    id: string;
    // type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    // readAt?: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    pagination: PaginationInfo;
}

export interface UserSettings {
    emailNotifications: boolean;
    marketingEmails: boolean;
    smsNotifications: boolean;
    profileVisibility: boolean;
    dataSharing: boolean;
}

export interface SettingsUpdateData {
    emailNotifications?: boolean;
    marketingEmails?: boolean;
    smsNotifications?: boolean;
    profileVisibility?: boolean;
    dataSharing?: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface APIResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string>;
}

export interface APIError {
    success: false;
    message: string;
    errors?: Record<string, string>;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}
