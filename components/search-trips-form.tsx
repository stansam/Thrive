'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { SearchAutocomplete } from "./search-autocomplete"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SearchTripsForm({ className }: { className?: string }) {
    const router = useRouter()
    const [duration, setDuration] = React.useState("any")
    const [budget, setBudget] = React.useState("any")

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (duration !== "any") {
            const [min, max] = duration.split('-')
            if (min) params.append('min_days', min)
            if (max) params.append('max_days', max)
        }

        // Simple budget mapping
        if (budget === 'budget') params.append('max_price', '1000')
        if (budget === 'moderate') {
            params.append('min_price', '1000')
            params.append('max_price', '3000')
        }
        if (budget === 'luxury') params.append('min_price', '3000')

        router.push(`/trips/results?${params.toString()}`)
    }

    return (
        <Card className={cn("w-[90vw] max-w-[450px] p-6 bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-2xl", className)}>
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Search Your Next Trip</h2>
                    <p className="text-sm text-neutral-400">Discover curated packages and exclusive deals.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-300 uppercase tracking-wider">Destination / Package</Label>
                        <SearchAutocomplete />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-neutral-300 uppercase tracking-wider">Duration</Label>
                            <Select value={duration} onValueChange={setDuration}>
                                <SelectTrigger className="bg-black/50 border-white/10 text-white">
                                    <SelectValue placeholder="Any Duration" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                    <SelectItem value="any">Any Duration</SelectItem>
                                    <SelectItem value="1-5">Short Break (1-5 days)</SelectItem>
                                    <SelectItem value="6-10">Standard (6-10 days)</SelectItem>
                                    <SelectItem value="11-20">Extended (11+ days)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-neutral-300 uppercase tracking-wider">Budget</Label>
                            <Select value={budget} onValueChange={setBudget}>
                                <SelectTrigger className="bg-black/50 border-white/10 text-white">
                                    <SelectValue placeholder="Any Budget" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                    <SelectItem value="any">Any Budget</SelectItem>
                                    <SelectItem value="budget">Budget (&lt;$1k)</SelectItem>
                                    <SelectItem value="moderate">Moderate ($1k-$3k)</SelectItem>
                                    <SelectItem value="luxury">Luxury ($3k+)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Label className="text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2 block">Travel Style</Label>
                        <RadioGroup defaultValue="all" className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="r-all" className="border-white text-emerald-500" />
                                <Label htmlFor="r-all" className="text-sm text-neutral-300">All</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="international" id="r-int" className="border-white text-emerald-500" />
                                <Label htmlFor="r-int" className="text-sm text-neutral-300">International</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="domestic" id="r-dom" className="border-white text-emerald-500" />
                                <Label htmlFor="r-dom" className="text-sm text-neutral-300">Domestic</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <Button
                    onClick={handleSearch}
                    className="w-full bg-white text-black hover:bg-neutral-200 font-semibold h-11 transition-all duration-300"
                >
                    Explore Packages
                </Button>
            </div>
        </Card>
    )
}
