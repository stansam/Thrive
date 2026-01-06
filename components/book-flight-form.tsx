'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { MapPin, Minus, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DatePicker } from "@/components/ui/date-picker"
import { flightService } from "@/services/flight-service"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { Plane, Building } from "lucide-react"

export function BookFlightForm({ className }: { className?: string }) {
    const router = useRouter()
    const [adults, setAdults] = React.useState(1)
    const [children, setChildren] = React.useState(0)
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    const [showFromDropdown, setShowFromDropdown] = React.useState(false)
    const [showToDropdown, setShowToDropdown] = React.useState(false)
    const [fromValue, setFromValue] = React.useState("")
    const [toValue, setToValue] = React.useState("")

    const [fromResults, setFromResults] = React.useState<any[]>([])
    const [toResults, setToResults] = React.useState<any[]>([])
    const [isSearchingFrom, setIsSearchingFrom] = React.useState(false)
    const [isSearchingTo, setIsSearchingTo] = React.useState(false)

    // Debounced search terms
    const debouncedFromValue = useDebounce(fromValue, 300)
    const debouncedToValue = useDebounce(toValue, 300)

    // Effect for Origin Search
    React.useEffect(() => {
        const searchOrigin = async () => {
            // Only search if length >= 2 and it's not a selected code (heuristic: contains ' (')
            // Actually, we want to allow re-searching even if it looks like a code, unless it's the exact same string. 
            // But simpler: if < 2 chars, clear results.
            if (debouncedFromValue.length < 2) {
                setFromResults([])
                return
            }

            setIsSearchingFrom(true)
            try {
                const response = await flightService.searchLocations(debouncedFromValue)
                if (response.success) {
                    setFromResults(response.data)
                }
            } catch (error) {
                console.error("Failed to search origin:", error)
                setFromResults([])
            } finally {
                setIsSearchingFrom(false)
            }
        }

        // Only search if the value doesn't look like a final selection "City (CODE)" 
        // to avoid re-triggering on selection. 
        // A simple check is if we just selected it, we might want to skip search.
        // For now, let's just search. The API is fast.
        searchOrigin()
    }, [debouncedFromValue])

    // Effect for Destination Search
    React.useEffect(() => {
        const searchDestination = async () => {
            if (debouncedToValue.length < 2) {
                setToResults([])
                return
            }

            setIsSearchingTo(true)
            try {
                const response = await flightService.searchLocations(debouncedToValue)
                if (response.success) {
                    setToResults(response.data)
                }
            } catch (error) {
                console.error("Failed to search destination:", error)
                setToResults([])
            } finally {
                setIsSearchingTo(false)
            }
        }
        searchDestination()
    }, [debouncedToValue])

    const extractCode = (str: string) => {
        const match = str.match(/\(([^)]+)\)/);
        return match ? match[1] : str;
    }

    const handleSelectLocation = (location: any, type: 'from' | 'to') => {
        const displayValue = `${location.name} (${location.iataCode})`;
        if (type === 'from') {
            setFromValue(displayValue);
            setShowFromDropdown(false);
        } else {
            setToValue(displayValue);
            setShowToDropdown(false);
        }
    }

    const handleSearch = () => {
        const origin = extractCode(fromValue);
        const destination = extractCode(toValue);

        if (!origin || !destination) {
            // In a real app, show error
            return;
        }

        const params = new URLSearchParams();
        params.append('origin', origin);
        params.append('destination', destination);
        if (date) {
            params.append('departureDate', date.toISOString().split('T')[0]);
        }
        params.append('adults', adults.toString());
        if (children > 0) {
            params.append('children', children.toString());
        }

        router.push(`/flights/results?${params.toString()}`);
    }

    return (
        <Card className={cn("w-[400px] p-6 bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-2xl", className)}>
            <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-center">Book Your Flight</h2>

                {/* Row 1: From / To */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                        <Label htmlFor="from" className="text-xs text-neutral-400">From</Label>
                        <div className="relative">
                            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
                            <Input
                                id="from"
                                placeholder="Origin"
                                className="pl-8 bg-black/50 border-white/10 focus:border-white/30"
                                value={fromValue}
                                onChange={(e) => {
                                    setFromValue(e.target.value)
                                    setShowFromDropdown(true)
                                }}
                                onFocus={() => setShowFromDropdown(true)}
                                onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
                            />
                        </div>
                        {showFromDropdown && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-neutral-900 border border-white/10 rounded-md z-50 overflow-hidden max-h-60 overflow-y-auto">
                                {isSearchingFrom ? (
                                    <div className="p-3 text-sm text-neutral-400 text-center">Searching...</div>
                                ) : fromResults.length > 0 ? (
                                    fromResults.map((location, idx) => (
                                        <div
                                            key={`${location.iataCode}-${idx}`}
                                            className="p-2 text-sm hover:bg-white/10 cursor-pointer flex items-center gap-2"
                                            onClick={() => handleSelectLocation(location, 'from')}
                                        >
                                            {location.type === 'CITY' ? (
                                                <Building className="h-4 w-4 text-neutral-400" />
                                            ) : (
                                                <Plane className="h-4 w-4 text-neutral-400" />
                                            )}
                                            <div>
                                                <span className="font-medium">{location.name}</span>
                                                <span className="text-neutral-400 ml-1">
                                                    ({location.iataCode})
                                                </span>
                                                <div className="text-xs text-neutral-500">
                                                    {location.city !== location.name ? `${location.city}, ` : ''}{location.country}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : debouncedFromValue.length >= 2 ? (
                                    <div className="p-3 text-sm text-neutral-400 text-center">No results found</div>
                                ) : null}
                            </div>
                        )}
                    </div>

                    <div className="relative group">
                        <Label htmlFor="to" className="text-xs text-neutral-400">To</Label>
                        <div className="relative">
                            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
                            <Input
                                id="to"
                                placeholder="Destination"
                                className="pl-8 bg-black/50 border-white/10 focus:border-white/30"
                                value={toValue}
                                onChange={(e) => {
                                    setToValue(e.target.value)
                                    setShowToDropdown(true)
                                }}
                                onFocus={() => setShowToDropdown(true)}
                                onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
                            />
                        </div>
                        {showToDropdown && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-neutral-900 border border-white/10 rounded-md z-50 overflow-hidden max-h-60 overflow-y-auto">
                                {isSearchingTo ? (
                                    <div className="p-3 text-sm text-neutral-400 text-center">Searching...</div>
                                ) : toResults.length > 0 ? (
                                    toResults.map((location, idx) => (
                                        <div
                                            key={`${location.iataCode}-${idx}`}
                                            className="p-2 text-sm hover:bg-white/10 cursor-pointer flex items-center gap-2"
                                            onClick={() => handleSelectLocation(location, 'to')}
                                        >
                                            {location.type === 'CITY' ? (
                                                <Building className="h-4 w-4 text-neutral-400" />
                                            ) : (
                                                <Plane className="h-4 w-4 text-neutral-400" />
                                            )}
                                            <div>
                                                <span className="font-medium">{location.name}</span>
                                                <span className="text-neutral-400 ml-1">
                                                    ({location.iataCode})
                                                </span>
                                                <div className="text-xs text-neutral-500">
                                                    {location.city !== location.name ? `${location.city}, ` : ''}{location.country}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : debouncedToValue.length >= 2 ? (
                                    <div className="p-3 text-sm text-neutral-400 text-center">No results found</div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>

                {/* Row 2: Passengers & Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                        <Label className="text-xs text-neutral-400">Passengers</Label>
                        <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-md p-1 px-2">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-neutral-500">Adults</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="text-neutral-400 hover:text-white"><Minus size={12} /></button>
                                    <span className="text-sm font-medium w-3 text-center">{adults}</span>
                                    <button onClick={() => setAdults(adults + 1)} className="text-neutral-400 hover:text-white"><Plus size={12} /></button>
                                </div>
                            </div>
                            <div className="w-[1px] h-6 bg-white/10"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-neutral-500">Children</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="text-neutral-400 hover:text-white"><Minus size={12} /></button>
                                    <span className="text-sm font-medium w-3 text-center">{children}</span>
                                    <button onClick={() => setChildren(children + 1)} className="text-neutral-400 hover:text-white"><Plus size={12} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Label className="text-xs text-neutral-400">Departure</Label>
                        <DatePicker date={date} setDate={setDate} className="bg-black/50 border-white/10 text-white" />
                    </div>
                </div>

                <Button className="w-full bg-white text-black hover:bg-neutral-200 mt-2" onClick={handleSearch}>
                    <Search className="mr-2 h-4 w-4" /> Search Flights
                </Button>
            </div>
        </Card>
    )
}
