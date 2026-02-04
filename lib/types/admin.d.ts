// Admin Dashboard Type Definitions

export interface AdminStats {
    totalUsers: number;
    newUsersThisMonth: number;
    usersByRole: Record<string, number>;
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    totalRevenue: number;
    monthRevenue: number;
    pendingQuotes: number;
    totalQuotes: number;
    activePackages: number;
    unreadContacts: number;
}

export interface AdminUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: string;
    subscription_tier: string;
    is_active: boolean;
    email_verified: boolean;
    created_at: string;
    total_bookings?: number;
    total_spent?: number;
}

export interface AdminBooking {
    id: string;
    booking_reference: string;
    booking_type: string;
    status: string;
    origin?: string;
    destination?: string;
    departure_date?: string;
    return_date?: string;
    total_price: number;
    base_price?: number;
    service_fee?: number;
    taxes?: number;
    discount?: number;
    airline?: string;
    flight_number?: string;
    airline_confirmation?: string; // PNR
    ticket_numbers?: string[];
    special_requests?: string;
    notes?: string;
    created_at: string;
    customer?: {
        id: string;
        fullName: string;
        email: string;
    };
    // Detailed fields depending on booking type
    package?: {
        id: string;
        name: string;
        duration_days: number;
        duration_nights: number;
    };
    passengers?: any[];
    payments?: AdminPayment[];
}

export interface AdminQuote {
    id: string;
    quote_reference: string;
    origin: string;
    destination: string;
    trip_type: string;
    status: string;
    quoted_price?: number;
    service_fee?: number;
    total_price?: number;
    agent_notes?: string;
    quote_details?: any; // JSON object
    created_at: string;
    flexible_dates?: string;
    num_adults?: number;
    num_children?: number;
    additional_details?: string;
    user?: {
        id: string;
        fullName: string;
        email: string;
    };
}

export interface AdminPackage {
    id: string;
    name: string;
    slug: string;
    destination_city: string;
    destination_country: string;
    duration_days: number;
    duration_nights: number;
    starting_price: number;
    price_per_person: number;
    is_active: boolean;
    is_featured: boolean;
    description?: string; // mapped from full_description or short_description? Backend has both. Let's assume full_description for now or optional.
    full_description?: string;
    short_description?: string;
    highlights?: string[];
    inclusions?: string[];
    exclusions?: string[];
    hotel_name?: string;
    hotel_rating?: number;
    room_type?: string;
    featured_image?: string;
    meta_title?: string;
    meta_description?: string;
}

export interface AdminPayment {
    id: string;
    payment_reference: string;
    amount: number;
    currency: string;
    status: string;
    payment_method?: string;
    created_at: string;
    user?: {
        id: string;
        fullName: string;
        email: string;
    };
    booking?: {
        id: string;
        reference: string;
    };
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: string;
    priority: string;
    admin_notes?: string;
    created_at: string;
    user_id?: string;
    assigned_to?: string;
}

export interface Pagination {
    page: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
}
