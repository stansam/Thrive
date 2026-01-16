"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import axios from "axios";
import Navbar from "@/components/ui/navbar";
import FooterSection from "@/components/ui/footer-section";
import { Loader2, AlertCircle, Check, X, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { PackageHero } from "@/components/blocks/package-hero";
import { PackageItinerary } from "@/components/blocks/package-itinerary";
import { BookingWizard } from "@/components/blocks/booking-wizard";
import { StickyBookBar } from "@/components/blocks/sticky-book-bar";

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function TripDetailsPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [isBookingOpen, setIsBookingOpen] = React.useState(false);

    // Fetch Package Data
    const { data: result, error, isLoading } = useSWR(
        slug ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/packages/slug/${slug}` : null,
        fetcher
    );
    const pkg = result?.data;

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    <p className="text-neutral-400 animate-pulse">Curating your experience...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !pkg) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 p-4 text-center">
                <div className="bg-red-500/10 p-4 rounded-full">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Trip Not Found</h1>
                    <p className="text-neutral-400 max-w-md">
                        We couldn't locate the package you're looking for. It may have been removed or is temporarily unavailable.
                    </p>
                </div>
                <Button asChild variant="outline" className="border-white/20 hover:bg-white/10">
                    <a href="/trips/results">Explore Other Trips</a>
                </Button>
            </div>
        );
    }

    // Prep images for carousel (Featured + Gallery)
    const allImages = [
        pkg.featured_image,
        ...(pkg.gallery_images || [])
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 selection:bg-emerald-500/30">
            <Navbar />

            <main className="pb-24 lg:pb-0">
                {/* 1. Hero Section */}
                <PackageHero
                    title={pkg.name}
                    images={allImages}
                    durationDays={pkg.duration_days}
                    durationNights={pkg.duration_nights}
                    startingPrice={pkg.starting_price}
                    packageId={pkg.id}
                />

                {/* 2. Main Content Container */}
                <div className="container mx-auto px-4 py-8 lg:py-16">
                    <div className="flex flex-col lg:flex-row gap-12 xl:gap-24 relative">

                        {/* LEFT COLUMN: Content */}
                        <div className="flex-1 min-w-0 space-y-12">

                            {/* Overview Section (Scroll Anchor) */}
                            <section id="overview" className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold text-white">Overview</h2>
                                    <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
                                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                                            <MapPin className="w-4 h-4 text-emerald-500" />
                                            {pkg.destination_city}, {pkg.destination_country}
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                                            <Globe className="w-4 h-4 text-emerald-500" />
                                            {pkg.trip_type || "International Tour"}
                                        </div>
                                    </div>
                                    <p className="text-lg text-neutral-300 leading-relaxed whitespace-pre-line">
                                        {pkg.full_description || pkg.short_description}
                                    </p>
                                </div>

                                {/* Highlights */}
                                {pkg.highlights && pkg.highlights.length > 0 && (
                                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 md:p-8">
                                        <h3 className="text-lg font-bold mb-6 text-emerald-400 uppercase tracking-widest text-sm">Trip Highlights</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {pkg.highlights.map((highlight: string, idx: number) => (
                                                <div key={idx} className="flex items-start gap-3">
                                                    <div className="mt-1 h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                        <Check className="h-3 w-3 text-emerald-500" />
                                                    </div>
                                                    <span className="text-neutral-200">{highlight}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>

                            <Separator className="bg-white/10" />

                            {/* Itinerary Section */}
                            <section id="itinerary">
                                <PackageItinerary itinerary={pkg.itinerary} />
                            </section>

                            <Separator className="bg-white/10" />

                            {/* Inclusions Tabs */}
                            <section id="inclusions">
                                <h2 className="text-2xl font-bold mb-6">What's Included</h2>
                                <Tabs defaultValue="included" className="w-full">
                                    <TabsList className="bg-neutral-900 border border-white/10 w-full justify-start h-auto p-1">
                                        <TabsTrigger value="included" className="flex-1 md:flex-none px-6 py-2.5 text-white data-[state=active]:bg-emerald-600">Included</TabsTrigger>
                                        <TabsTrigger value="excluded" className="flex-1 md:flex-none px-6 py-2.5 text-white data-[state=active]:bg-red-900/50 data-[state=active]:text-red-100">Not Included</TabsTrigger>
                                    </TabsList>
                                    <div className="mt-6 bg-neutral-900/30 rounded-xl p-6 border border-white/5">
                                        <TabsContent value="included" className="mt-0">
                                            <ul className="grid md:grid-cols-2 gap-4">
                                                {pkg.inclusions?.map((item: string, idx: number) => (
                                                    <li key={idx} className="flex gap-3 text-neutral-300">
                                                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </TabsContent>
                                        <TabsContent value="excluded" className="mt-0">
                                            <ul className="grid md:grid-cols-2 gap-4">
                                                {pkg.exclusions?.map((item: string, idx: number) => (
                                                    <li key={idx} className="flex gap-3 text-neutral-300">
                                                        <X className="w-5 h-5 text-red-500 shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </section>

                            {/* Gallery Grid (If more than 1 image) */}
                            {allImages.length > 1 && (
                                <section id="gallery" className="space-y-6 pt-8">
                                    <h2 className="text-2xl font-bold">Gallery</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {allImages.map((img, idx) => (
                                            <div key={idx} className="aspect-square relative rounded-xl overflow-hidden group cursor-zoom-in">
                                                <img
                                                    src={img}
                                                    alt={`Gallery ${idx + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                        </div>

                        {/* RIGHT COLUMN: Sticky Sidebar */}
                        <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 hidden lg:block">
                            <div className="sticky top-24 space-y-6">
                                {/* Booking Card */}
                                <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl shadow-emerald-900/10 overflow-hidden relative">
                                    {/* Decorative gradient blob */}
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

                                    <div className="mb-6">
                                        <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider mb-2">Package Price</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-white">${pkg.starting_price.toLocaleString()}</span>
                                            <span className="text-neutral-500">/ person</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8 bg-black/20 p-4 rounded-xl">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-400">Duration</span>
                                            <span className="font-medium text-white">{pkg.duration_days} Days</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-400">Accommodation</span>
                                            <span className="font-medium text-white max-w-[180px] truncate text-right">
                                                {pkg.hotel_name || `${pkg.hotel_rating || 4}-Star Hotel`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-400">Availability</span>
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                Dates Available
                                            </Badge>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setIsBookingOpen(true)}
                                        className="w-full h-14 text-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow-lg shadow-emerald-900/20 mb-4"
                                    >
                                        Request Availability
                                    </Button>

                                    <p className="text-xs text-center text-neutral-500">
                                        *No payment required now. Our concierge will confirm your dates first.
                                    </p>
                                </div>

                                {/* Quick Links Card */}
                                <div className="bg-neutral-900 border border-white/5 rounded-xl p-6 hidden xl:block">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Navigation</h4>
                                    <nav className="flex flex-col space-y-2">
                                        <a href="#overview" className="text-neutral-400 hover:text-emerald-400 transition-colors text-sm py-1">Overview & Highlights</a>
                                        <a href="#itinerary" className="text-neutral-400 hover:text-emerald-400 transition-colors text-sm py-1">Day-by-Day Itinerary</a>
                                        <a href="#inclusions" className="text-neutral-400 hover:text-emerald-400 transition-colors text-sm py-1">Inclusions & Exclusions</a>
                                        <a href="#gallery" className="text-neutral-400 hover:text-emerald-400 transition-colors text-sm py-1">Photo Gallery</a>
                                    </nav>
                                </div>
                            </div>
                        </aside>

                    </div>
                </div>

                {/* Mobile Sticky CTA */}
                <StickyBookBar pkg={pkg} />

                {/* Booking Wizard */}
                <BookingWizard
                    pkg={pkg}
                    open={isBookingOpen}
                    onOpenChange={setIsBookingOpen}
                />

            </main>

            <FooterSection />
        </div>
    );
}
