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
        duration: string;
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
    total_price?: number;
    created_at: string;
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
    destination: string;
    duration: string;
    starting_price: number;
    is_active: boolean;
    featured_image?: string;
    description?: string;
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
