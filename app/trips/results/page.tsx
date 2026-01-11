"use client"
import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import useSWR from "swr"
import axios from "axios"
import { Star, Loader2, Filter } from "lucide-react"
import { Suspense } from "react"
import Navbar from "@/components/ui/navbar"
import FooterSection from "@/components/ui/footer-section"
import { SearchAutocomplete } from "@/components/search-autocomplete"
import { PackageCard } from "@/components/package-card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

const fetcher = (url: string) => axios.get(url).then(res => res.data)

function SearchResultsContent() {
    const searchParams = useSearchParams()
    // const router = useRouter() // Not currently used, but good to have if needed for navigation
    const query = searchParams.get('q') || ''

    // Filters State
    const [priceRange, setPriceRange] = React.useState([0, 5000])
    const [duration, setDuration] = React.useState("any")
    const [rating, setRating] = React.useState<string[]>([])

    // Construct API URL
    const getApiUrl = () => {
        const params = new URLSearchParams()
        if (query) params.append('q', query)

        // Price
        if (priceRange[0] > 0) params.append('min_price', priceRange[0].toString())
        if (priceRange[1] < 5000) params.append('max_price', priceRange[1].toString())

        // Duration
        if (duration !== 'any') {
            const [min, max] = duration.split('-')
            if (min) params.append('min_days', min)
            if (max) params.append('max_days', max)
        }

        // Rating
        if (rating.length > 0) {
            const minRating = Math.min(...rating.map(Number))
            params.append('hotel_rating', minRating.toString())
        }

        return `${process.env.NEXT_PUBLIC_API_BASE_URL}/packages/search?${params.toString()}`
    }

    const { data: result, error, isLoading } = useSWR(getApiUrl(), fetcher)
    const packages = result?.data?.items || []
    const totalCount = result?.data?.total || 0

    // Handle price change
    const handlePriceChange = (value: number[]) => {
        setPriceRange(value)
    }

    const handleRatingChange = (checked: boolean, value: string) => {
        if (checked) {
            setRating([...rating, value])
        } else {
            setRating(rating.filter(r => r !== value))
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 relative">
            {/* Main Content Areas - Results */}
            <div className="flex-1 order-2 lg:order-1">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        {isLoading ? 'Searching...' : `${totalCount} Trips Found`} {query && `for "${query}"`}
                    </h2>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                )}

                {!isLoading && packages.length === 0 && (
                    <div className="text-center py-20 bg-neutral-900/50 rounded-lg border border-neutral-800">
                        <h3 className="text-xl font-medium mb-2">No trips found</h3>
                        <p className="text-neutral-400">Try adjusting your filters or search for something else.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {packages.map((pkg: any) => (
                        <PackageCard key={pkg.id} pkg={pkg} />
                    ))}
                </div>
            </div>

            {/* Right Sidebar - Filters - Fixed on Desktop */}
            <div className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-2">
                <div className="lg:sticky lg:top-24 bg-neutral-900/50 backdrop-blur-md border border-white/10 p-6 rounded-xl space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter className="h-5 w-5 text-emerald-500" />
                        <h3 className="font-bold text-lg">Filters</h3>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <Label>Price Range</Label>
                            <span className="text-emerald-400 font-mono">${priceRange[0]} - ${priceRange[1]}</span>
                        </div>
                        <Slider
                            defaultValue={[0, 5000]}
                            max={10000}
                            step={100}
                            value={priceRange}
                            onValueChange={handlePriceChange}
                            className="py-4"
                        />
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Duration */}
                    <div className="space-y-3">
                        <Label>Duration</Label>
                        <RadioGroup value={duration} onValueChange={setDuration}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="any" id="d-any" className="border-emerald-500 text-emerald-500" />
                                <Label htmlFor="d-any" className="font-normal text-neutral-300">Any</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1-5" id="d-short" className="border-emerald-500 text-emerald-500" />
                                <Label htmlFor="d-short" className="font-normal text-neutral-300">Short (1-5 days)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="6-10" id="d-medium" className="border-emerald-500 text-emerald-500" />
                                <Label htmlFor="d-medium" className="font-normal text-neutral-300">Medium (6-10 days)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="11-20" id="d-long" className="border-emerald-500 text-emerald-500" />
                                <Label htmlFor="d-long" className="font-normal text-neutral-300">Long (11+ days)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Hotel Rating */}
                    <div className="space-y-3">
                        <Label>Hotel Rating</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {[5, 4, 3].map((star) => (
                                <div key={star} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`star-${star}`}
                                        checked={rating.includes(star.toString())}
                                        onCheckedChange={(checked) => handleRatingChange(checked as boolean, star.toString())}
                                        className="border-neutral-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                    />
                                    <Label htmlFor={`star-${star}`} className="font-normal text-neutral-300 flex items-center gap-1">
                                        {star} Stars <span className="flex">{Array(star).fill(0).map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />)}</span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full border-white/20 hover:bg-white hover:text-black mt-4"
                        onClick={() => {
                            setPriceRange([0, 5000])
                            setDuration("any")
                            setRating([])
                        }}
                    >
                        Reset Filters
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function SearchResultsPage() {
    return (
        <div className="min-h-screen bg-black font-sans text-white">
            <Navbar />

            <main className="container mx-auto px-4 py-24 min-h-screen flex flex-col gap-6">

                {/* Top Search Bar */}
                <div className="flex flex-col items-center justify-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold text-center">Find Your Perfect Escape</h1>
                    <div className="w-full max-w-2xl relative">
                        <SearchAutocomplete
                            placeholder="Explore destinations, tours or hotels..."
                            className="bg-neutral-900 border-neutral-800"
                        />
                    </div>
                </div>

                <Suspense fallback={
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                        <span className="ml-2 text-neutral-400">Loading results...</span>
                    </div>
                }>
                    <SearchResultsContent />
                </Suspense>
            </main>

            <FooterSection />
        </div>
    )
}

