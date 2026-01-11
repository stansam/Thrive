export interface Package {
    id: string;
    name: string;
    slug: string;
    short_description: string;
    full_description: string;
    destination_city: string;
    destination_country: string;
    duration_days: number;
    duration_nights: number;
    starting_price: number;
    price_per_person: number;
    highlights: string[];
    inclusions: string[];
    exclusions: string[];
    itinerary: any; // Ideally this should be a stronger type
    hotel_name: string | null;
    hotel_rating: number | null;
    hotel_address: string | null;
    hotel_phone: string | null;
    room_type: string | null;
    is_active: boolean;
    available_from: string | null;
    available_until: string | null;
    max_capacity: number | null;
    min_booking: number | null;
    is_featured: boolean;
    marketing_tagline: string | null;
    featured_image: string | null;
    gallery_images: string[] | null;
    meta_title: string | null;
    meta_description: string | null;
    view_count: number;
    booking_count: number;
    created_at: string;
    updated_at: string;
}

export interface PackageFilter {
    q?: string;
    destination_city?: string;
    destination_country?: string;
    min_price?: number;
    max_price?: number;
    min_days?: number;
    max_days?: number;
    hotel_rating?: number;
    is_featured?: boolean;
    available_date?: string;
    sort_by?: 'price' | 'duration' | 'popularity' | 'views' | 'name' | 'created_at' | 'rating';
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
}
