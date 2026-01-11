'use client'

import * as React from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import axios from "axios"
import Navbar from "@/components/ui/navbar"
import FooterSection from "@/components/ui/footer-section"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Star, Check, X, Loader2 } from "lucide-react"
import Link from "next/link"

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export default function TripDetailsPage() {
    const params = useParams()
    const slug = params?.slug as string

    const { data: result, error, isLoading } = useSWR(slug ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/packages/slug/${slug}` : null, fetcher)
    const pkg = result?.data

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    <p className="text-neutral-400">Loading trip details...</p>
                </div>
            </div>
        )
    }

    if (error || !pkg) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <div className="text-xl">Trip not found</div>
                <Button asChild variant="outline" className="border-white/20">
                    <Link href="/trips/results">Back to Search</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black font-sans text-white">
            <Navbar />

            <main>
                {/* Hero Section */}
                <div className="relative h-[60vh] w-full overflow-hidden">
                    <img
                        src={pkg.featured_image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                        alt={pkg.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                        <div className="container mx-auto">
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 mb-4 border-none text-white">{pkg.destination_country}</Badge>
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-4xl leading-tight">{pkg.name}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-neutral-200">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-emerald-400" />
                                    {pkg.destination_city}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-emerald-400" />
                                    {pkg.duration_days} Days / {pkg.duration_nights} Nights
                                </div>
                                {pkg.hotel_rating && (
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        {pkg.hotel_rating} Star Hotel
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-12">
                    {/* Left Content */}
                    <div className="flex-1">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="bg-neutral-900 border border-white/10 mb-8 w-full justify-start h-auto p-1 overflow-x-auto">
                                <TabsTrigger value="overview" className="px-6 py-3 text-white data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Overview</TabsTrigger>
                                <TabsTrigger value="itinerary" className="px-6 py-3 text-white data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Itinerary</TabsTrigger>
                                <TabsTrigger value="inclusions" className="px-6 py-3 text-white data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Inclusions</TabsTrigger>
                                <TabsTrigger value="gallery" className="px-6 py-3 text-white data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Gallery</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <p className="text-lg text-neutral-300 leading-relaxed">
                                    {pkg.full_description || pkg.short_description}
                                </p>

                                {pkg.highlights && pkg.highlights.length > 0 && (
                                    <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/5">
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" /> Highlights
                                        </h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {pkg.highlights.map((highlight: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-neutral-300">
                                                    <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                                    <span>{highlight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="itinerary" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {pkg.itinerary && pkg.itinerary.map((day: any, idx: number) => (
                                    <div key={idx} className="border-l-2 border-emerald-500/30 pl-6 pb-8 relative last:pb-0">
                                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-emerald-500" />
                                        <h4 className="font-bold text-lg mb-2">Day {day.day}: {day.title}</h4>
                                        <p className="text-neutral-400">{day.description}</p>
                                    </div>
                                ))}
                                {!pkg.itinerary && <p className="text-neutral-400">Itinerary details coming soon.</p>}
                            </TabsContent>

                            <TabsContent value="inclusions" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-lg font-bold mb-4 text-emerald-400">Included</h3>
                                        <ul className="space-y-2">
                                            {pkg.inclusions && pkg.inclusions.map((item: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                                    <span className="text-neutral-300">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-4 text-red-400">Not Included</h3>
                                        <ul className="space-y-2">
                                            {pkg.exclusions && pkg.exclusions.map((item: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <X className="h-5 w-5 text-red-500 shrink-0" />
                                                    <span className="text-neutral-300">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="gallery" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {pkg.gallery_images && pkg.gallery_images.map((img: string, idx: number) => (
                                        <div key={idx} className="aspect-square rounded-lg overflow-hidden relative group">
                                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        </div>
                                    ))}
                                    {(!pkg.gallery_images || pkg.gallery_images.length === 0) && (
                                        <p className="col-span-3 text-neutral-400 text-center py-8">No gallery images available.</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Sidebar - Sticky Booking Card */}
                    <div className="w-full lg:w-96 flex-shrink-0">
                        <div className="sticky top-24 bg-neutral-900 border border-emerald-500/20 rounded-2xl p-6 shadow-2xl shadow-emerald-900/10">
                            <div className="mb-6">
                                <p className="text-sm text-neutral-400 mb-1">Starting from</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white">${pkg.starting_price}</span>
                                    <span className="text-neutral-400">/ person</span>
                                </div>
                            </div>

                            <Separator className="bg-white/10 mb-6" />

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Duration</span>
                                    <span className="font-medium">{pkg.duration_days} Days</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Accomodation</span>
                                    <span className="font-medium text-right max-w-[150px] truncate">{pkg.hotel_name || 'Included'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Availability</span>
                                    <span className="text-emerald-400 font-medium">In Stock</span>
                                </div>
                            </div>

                            <Button className="w-full h-12 text-lg font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/25 mb-4">
                                Book This Trip
                            </Button>

                            <p className="text-xs text-center text-neutral-500">
                                *Prices are subject to change based on dates and availability.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <FooterSection />
        </div>
    )
}
