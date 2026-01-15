'use client'

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Star, ArrowRight } from "lucide-react"
import { WishlistButton } from "@/components/blocks/wishlist-button"

interface PackageCardProps {
    pkg: any
    className?: string
    isSaved?: boolean
}

export function PackageCard({ pkg, className, isSaved = false }: PackageCardProps) {
    // Determine image - use unplash fallback if needed
    const imageUrl = pkg.featured_image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"

    return (
        <Card className="flex flex-col h-full overflow-hidden bg-white/5 border-white/10 text-white hover:border-emerald-500/50 transition-all duration-300">
            <div className="relative h-48 w-full overflow-hidden">
                <img
                    src={imageUrl}
                    alt={pkg.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {pkg.is_featured && (
                    <Badge className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                        Featured
                    </Badge>
                )}
                <div className="absolute top-2 left-2 z-10">
                    <WishlistButton
                        packageId={pkg.id}
                        initialIsSaved={isSaved}
                        className="bg-black/20 hover:bg-black/40 text-white"
                    />
                </div>
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <MapPin className="h-3 w-3" />
                        {pkg.destination_city || 'Unknown City'}, {pkg.destination_country || 'Unknown Country'}
                    </div>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2">{pkg.name}</h3>
                    <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {pkg.hotel_rating || '4.5'}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <p className="text-sm text-neutral-400 line-clamp-3 mb-4">
                    {pkg.short_description}
                </p>

                <div className="flex items-center gap-4 text-xs text-neutral-300">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {pkg.duration_days} Days
                    </div>
                    {/* Add more icons/stats if available */}
                </div>
            </CardContent>

            <CardFooter className="p-4 border-t border-white/10 flex items-center justify-between">
                <div>
                    <p className="text-xs text-neutral-400">Starting from</p>
                    <p className="text-xl font-bold text-white">${pkg.starting_price}</p>
                </div>
                <Button className="bg-white text-black hover:bg-neutral-200" asChild>
                    <Link href={`/trip/${pkg.slug}`}>
                        View Deal <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
