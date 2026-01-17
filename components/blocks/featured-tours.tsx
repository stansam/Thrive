"use client";


import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useFeaturedPackages } from "@/lib/hooks/use-packages";
import { Package } from "@/lib/types/package";
import { AlertCircle } from "lucide-react";
import { WishlistButton } from "@/components/blocks/wishlist-button";
import { useMyPackages } from "@/lib/hooks/use-packages-api";

// Fallback data if API returns empty or fails
const FALLBACK_PACKAGES: Partial<Package>[] = [
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


export function FeaturedTours() {
    const router = useRouter();
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const { packages: apiPackages, isLoading, isError } = useFeaturedPackages();
    const { saved, isError: isSavedError } = useMyPackages();
    const isPackageSaved = (id: string) => saved?.some((p: any) => p.id === id);

    // Determine packages to display: API data -> Fallback data
    const packages = (apiPackages && apiPackages.length > 0) ? apiPackages : FALLBACK_PACKAGES;

    // Only show fallback if NOT loading and (Error OR Empty API)
    // Actually, if loading, we show loader.
    // If loaded and empty/error, we show fallback. 
    // BUT user asked for "proper error icon and message display incase of backend error".
    // AND "fallback ... when no featured trips are found".

    // Revised Logic:
    // 1. Loading -> Show Loader
    // 2. Error -> Show Error Message (with option to show fallback? No, explicit error requested)
    // 3. Success but Empty -> Show Fallback
    // 4. Success -> Show API Data

    // However, usually fallback is for "Empty OR Error" to keep site pretty.
    // Let's implement:
    // - If Error: Show Error Alert.
    // - If Success + Empty: Show Fallback + Info? Or just Fallback silently?
    // User said: "fallback ... when no featured trips are found" (implies empty list).
    // AND "error icon ... incase of backend error".

    // So:
    const showFallback = !isLoading && !isError && apiPackages.length === 0;
    const displayPackages = showFallback ? FALLBACK_PACKAGES : (apiPackages || []);

    const handleViewPackage = (slug: string) => {
        router.push(`/trip/${slug}`);
    };

    useEffect(() => {
        if (!carouselApi) {
            return;
        }
        const updateSelection = () => {
            setCanScrollPrev(carouselApi.canScrollPrev());
            setCanScrollNext(carouselApi.canScrollNext());
            setCurrentSlide(carouselApi.selectedScrollSnap());
        };
        updateSelection();
        carouselApi.on("select", updateSelection);
        return () => {
            carouselApi.off("select", updateSelection);
        };
    }, [carouselApi]);

    return (
        <section className="py-24 bg-black text-white" id="featured-tours">
            <div className="container mx-auto px-4">
                <div className="mb-8 flex items-end justify-between md:mb-14 lg:mb-16">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl">
                            Featured Travels & Tours
                        </h2>
                        <p className="max-w-lg text-muted-foreground">
                            Discover our hand-picked selection of exclusive travel packages tailored for unforgettable experiences.
                        </p>
                    </div>
                    <div className="hidden shrink-0 gap-2 md:flex">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                                carouselApi?.scrollPrev();
                            }}
                            disabled={!canScrollPrev}
                            className="rounded-full border-neutral-700 bg-black hover:bg-neutral-800 disabled:opacity-50"
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                                carouselApi?.scrollNext();
                            }}
                            disabled={!canScrollNext}
                            className="rounded-full border-neutral-700 bg-black hover:bg-neutral-800 disabled:opacity-50"
                        >
                            <ArrowRight className="size-5" />
                        </Button>
                    </div>
                </div>
            </div>
            <div className="w-full">
                {isLoading && (
                    <div className="flex justify-center items-center h-64 text-neutral-500">
                        Loading featured tours...
                    </div>
                )}

                {isError && (
                    <div className="flex flex-col justify-center items-center h-64 text-red-400 gap-2">
                        <AlertCircle className="h-8 w-8" />
                        <p>Unable to load featured tours at this time.</p>
                        <Button
                            variant="outline"
                            className="mt-4 border-white/20 text-white hover:bg-white/10"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {!isLoading && !isError && (
                    <>
                        {showFallback && (
                            <div className="mb-4 text-center text-sm text-neutral-500 italic">
                                * Displaying ample tours (No featured tours found)
                            </div>
                        )}
                        <Carousel
                            setApi={setCarouselApi}
                            opts={{
                                breakpoints: {
                                    "(max-width: 768px)": {
                                        dragFree: true,
                                    },
                                },
                            }}
                        >
                            <div className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-10 hidden md:block">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => carouselApi?.scrollPrev()}
                                    disabled={!canScrollPrev}
                                    className="rounded-full h-12 w-12 border-neutral-700 bg-black/50 backdrop-blur-sm text-white hover:bg-black hover:text-white disabled:opacity-30"
                                >
                                    <ArrowLeft className="size-6" />
                                </Button>
                            </div>

                            <div className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-10 hidden md:block">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => carouselApi?.scrollNext()}
                                    disabled={!canScrollNext}
                                    className="rounded-full h-12 w-12 border-neutral-700 bg-black/50 backdrop-blur-sm text-white hover:bg-black hover:text-white disabled:opacity-30"
                                >
                                    <ArrowRight className="size-6" />
                                </Button>
                            </div>

                            <CarouselContent className="ml-0 2xl:ml-[max(8rem,calc(50vw-700px))] 2xl:mr-[max(0rem,calc(50vw-700px))]">
                                {packages.map((item) => (
                                    <CarouselItem
                                        key={item.id}
                                        className="max-w-[340px] pl-[20px] lg:max-w-[400px]"
                                    >
                                        <div className="group relative h-full flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
                                            <div className="relative aspect-[4/3] w-full overflow-hidden">
                                                <img
                                                    src={item.featured_image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1080&auto=format&fit=crop"}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-neutral-900 to-transparent pointer-events-none" />
                                                <div className="absolute top-4 left-4">
                                                    <div className="text-xs font-bold text-white uppercase tracking-wider bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                                                        {item.duration_days} Days • {item.duration_nights} Nights
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 right-4">
                                                    {isSavedError ? (
                                                        // <AlertCircle className="w-6 h-6 text-red-500" />
                                                        <div style={{ display: 'none' }}></div>
                                                    ) : (
                                                        <WishlistButton
                                                            packageId={item.id || ''}
                                                            initialIsSaved={isPackageSaved(item.id || '')}
                                                            className="bg-black/20 hover:bg-black/40 text-white"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-1 flex-col justify-between p-6">
                                                <div>
                                                    <h3 className="text-xl font-bold mb-2 leading-tight line-clamp-2">{item.name}</h3>
                                                    <div className="text-lg font-semibold text-white mb-4">From ${(item.starting_price || 0).toLocaleString()}</div>

                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        {(item.highlights || []).slice(0, 3).map((highlight, idx) => (
                                                            <span key={idx} className="max-w-[100px] truncate text-[10px] tracking-wide px-2 py-1 rounded-full bg-white/10 text-white/90">
                                                                {highlight}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <div className="space-y-4 text-sm">
                                                        <div>
                                                            <h4 className="font-semibold mb-2 text-white/90">What’s Included</h4>
                                                            <ul className="grid grid-cols-1 gap-1">
                                                                {(item.inclusions || []).slice(0, 3).map((inc, i) => (
                                                                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                                                                        <Check className="size-3 text-green-500 shrink-0" /> <span className="truncate">{inc}</span>
                                                                    </li>
                                                                ))}
                                                                {(item.inclusions?.length || 0) > 3 && (
                                                                    <li className="text-xs text-muted-foreground pl-5">+ {(item.inclusions?.length || 0) - 3} more</li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => handleViewPackage(item.slug || '')}
                                                    className="w-full mt-6 bg-white text-black hover:bg-neutral-200"
                                                >
                                                    View Package
                                                    <ArrowRight className="ml-2 size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                        <div className="mt-8 flex justify-center gap-2">
                            {packages.map((_, index) => (
                                <button
                                    key={index}
                                    className={`h-2 w-2 rounded-full transition-colors ${currentSlide === index ? "bg-white" : "bg-neutral-700"
                                        }`}
                                    onClick={() => carouselApi?.scrollTo(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section >
    );
};
