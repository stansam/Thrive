"use client";

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

export interface TourItem {
    id: string;
    title: string;
    duration: string;
    price: string;
    highlights: string[];
    included: string[];
    excluded: string[];
    image: string;
}

const data: TourItem[] = [
    {
        id: "dubai-luxury",
        title: "Dubai Luxury Escape",
        duration: "5 Days • 4 Nights",
        price: "From $1,899",
        highlights: ["Yacht Cruise", "Desert Safari", "Burj Khalifa"],
        included: ["Hotel", "Breakfast daily", "Airport transfers", "Tours & activities", "Professional guide"],
        excluded: ["Flights (can be added)", "Travel insurance"],
        image:
            "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1080&auto=format&fit=crop",
    },
    {
        id: "japan-cherry-blossom",
        title: "Japan Cherry Blossom",
        duration: "10 Days • 9 Nights",
        price: "From $3,499",
        highlights: ["Tokyo", "Kyoto", "Mt. Fuji", "Osaka"],
        included: ["4-Star Hotels", "Bullet Train Pass", "Guided Tours", "Breakfast daily", "Cultural ceremonies"],
        excluded: ["International Flights", "Personal expenses"],
        image:
            "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1080&auto=format&fit=crop",
    },
    {
        id: "amalfi-coast",
        title: "Amalfi Coast Dream",
        duration: "7 Days • 6 Nights",
        price: "From $2,299",
        highlights: ["Positano", "Capri Boat Tour", "Pompeii"],
        included: ["Boutique Hotels", "Private Transfers", "Boat Tours", "Wine Tasting", "Breakfast daily"],
        excluded: ["Flights", "City Taxes"],
        image:
            "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1080&auto=format&fit=crop",
    },
    {
        id: "bali-wellness",
        title: "Bali Wellness Retreat",
        duration: "8 Days • 7 Nights",
        price: "From $1,499",
        highlights: ["Ubud Yoga", "Nusa Penida", "Rice Terraces"],
        included: ["Villa Accommodation", "Daily Spa Treatment", "Meals", "Airport Transfers", "Yoga Classes"],
        excluded: ["Flights", "Alcoholic beverages"],
        image:
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1080&auto=format&fit=crop",
    }
];

export function FeaturedTours() {
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

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
                        {data.map((item) => (
                            <CarouselItem
                                key={item.id}
                                className="max-w-[340px] pl-[20px] lg:max-w-[400px]"
                            >
                                <div className="group relative h-full min-h-[32rem] max-w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
                                    <div className="absolute inset-0 h-1/2 overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-neutral-900 to-transparent pointer-events-none" />
                                    </div>

                                    <div className="absolute inset-0 pt-[45%] flex flex-col p-6 h-full pointer-events-none">
                                        <div className="relative z-10 flex flex-col h-full justify-between pointer-events-auto">
                                            <div>
                                                <div className="mb-2 text-xs font-bold text-white uppercase tracking-wider bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full w-fit">
                                                    {item.duration}
                                                </div>
                                                <h3 className="text-2xl font-bold mb-1 leading-tight">{item.title}</h3>
                                                <div className="text-xl font-semibold text-white mb-4">{item.price}</div>

                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {item.highlights.map((highlight, idx) => (
                                                        <span key={idx} className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-white/10 text-white/90">
                                                            {highlight}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="space-y-4 text-sm">
                                                    <div>
                                                        <h4 className="font-semibold mb-2 text-white/90">What’s Included</h4>
                                                        <ul className="grid grid-cols-1 gap-1">
                                                            {item.included.slice(0, 3).map((inc, i) => (
                                                                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                                                                    <Check className="size-3 text-green-500" /> {inc}
                                                                </li>
                                                            ))}
                                                            {item.included.length > 3 && (
                                                                <li className="text-xs text-muted-foreground pl-5">+ {item.included.length - 3} more</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold mb-2 text-white/90">What’s Not Included</h4>
                                                        <ul className="grid grid-cols-1 gap-1">
                                                            {item.excluded.map((exc, i) => (
                                                                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                                                                    <X className="size-3 text-red-500" /> {exc}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button className="w-full mt-6 bg-white text-black hover:bg-neutral-200">
                                                View Package
                                                <ArrowRight className="ml-2 size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                <div className="mt-8 flex justify-center gap-2">
                    {data.map((_, index) => (
                        <button
                            key={index}
                            className={`h-2 w-2 rounded-full transition-colors ${currentSlide === index ? "bg-white" : "bg-neutral-700"
                                }`}
                            onClick={() => carouselApi?.scrollTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
