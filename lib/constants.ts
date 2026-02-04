import { Package } from "@/lib/types/package";

export const FALLBACK_PACKAGES: Partial<Package>[] = [
    {
        id: "dubai-luxury",
        name: "Dubai Luxury Escape",
        duration_days: 5,
        duration_nights: 4,
        starting_price: 1899,
        highlights: ["Yacht Cruise", "Desert Safari", "Burj Khalifa"],
        inclusions: ["Hotel", "Breakfast daily", "Airport transfers", "Tours & activities", "Professional guide"],
        exclusions: ["Flights (can be added)", "Travel insurance"],
        featured_image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1080&auto=format&fit=crop",
        slug: "dubai-luxury-escape"
    },
    {
        id: "japan-cherry-blossom",
        name: "Japan Cherry Blossom",
        duration_days: 10,
        duration_nights: 9,
        starting_price: 3499,
        highlights: ["Tokyo", "Kyoto", "Mt. Fuji", "Osaka"],
        inclusions: ["4-Star Hotels", "Bullet Train Pass", "Guided Tours", "Breakfast daily", "Cultural ceremonies"],
        exclusions: ["International Flights", "Personal expenses"],
        featured_image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1080&auto=format&fit=crop",
        slug: "japan-cherry-blossom"
    },
    {
        id: "amalfi-coast",
        name: "Amalfi Coast Dream",
        duration_days: 7,
        duration_nights: 6,
        starting_price: 2299,
        highlights: ["Positano", "Capri Boat Tour", "Pompeii"],
        inclusions: ["Boutique Hotels", "Private Transfers", "Boat Tours", "Wine Tasting", "Breakfast daily"],
        exclusions: ["Flights", "City Taxes"],
        featured_image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1080&auto=format&fit=crop",
        slug: "amalfi-coast-dream"
    },
    {
        id: "bali-wellness",
        name: "Bali Wellness Retreat",
        duration_days: 8,
        duration_nights: 7,
        starting_price: 1499,
        highlights: ["Ubud Yoga", "Nusa Penida", "Rice Terraces"],
        inclusions: ["Villa Accommodation", "Daily Spa Treatment", "Meals", "Airport Transfers", "Yoga Classes"],
        exclusions: ["Flights", "Alcoholic beverages"],
        featured_image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1080&auto=format&fit=crop",
        slug: "bali-wellness-retreat"
    }
];
