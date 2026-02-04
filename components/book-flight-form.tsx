'use client'

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Plane, Building, Briefcase, Armchair } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { bookFlightSchema, BookFlightSchema } from "@/lib/schemas"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

export function BookFlightForm({ className }: { className?: string }) {
    const router = useRouter()

    const form = useForm<BookFlightSchema>({
        resolver: zodResolver(bookFlightSchema),
        defaultValues: {
            tripType: "round-trip",
            adults: 1,
            children: 0,
            cabinClass: "ECONOMY",
            departureDate: new Date(),
        }
    })

    const { watch, setValue, control, handleSubmit } = form
    const tripType = watch("tripType")
    const adults = watch("adults")
    const children = watch("children")

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
        const code = location.iataCode;

        if (type === 'from') {
            setFromValue(displayValue);
            setValue("from", code); // Set form value
            setShowFromDropdown(false);
        } else {
            setToValue(displayValue);
            setValue("to", code); // Set form value
            setShowToDropdown(false);
        }
    }

    const onSubmit = (data: BookFlightSchema) => {
        const params = new URLSearchParams();
        params.append('origin', data.from);
        params.append('destination', data.to);
        params.append('departureDate', data.departureDate.toISOString().split('T')[0]);

        if (data.tripType === 'round-trip' && data.returnDate) {
            params.append('returnDate', data.returnDate.toISOString().split('T')[0]);
        }
        params.append('adults', data.adults.toString());
        if (data.children > 0) {
            params.append('children', data.children.toString());
        }
        params.append('travelClass', data.cabinClass);

        router.push(`/flights/results?${params.toString()}`);
    }

    return (
        <Card className={cn("w-[400px] p-6 bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-2xl", className)}>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4 text-center">Book Your Flight</h2>

                    {/* Trip Type */}
                    <div className="flex justify-center mb-4">
                        <FormField
                            control={control}
                            name="tripType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="round-trip" id="round-trip" className="border-white text-white" />
                                                <Label htmlFor="round-trip" className="text-white">Round Trip</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="one-way" id="one-way" className="border-white text-white" />
                                                <Label htmlFor="one-way" className="text-white">One Way</Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Row 1: From / To */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                            <Label htmlFor="from" className="text-xs text-neutral-400">From</Label>
                            {/* Hidden input to register the field with RHF */}
                            <input type="hidden" {...form.register("from")} />
                            
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
                            {form.formState.errors.from && (
                                <span className="text-xs text-red-400">{form.formState.errors.from.message}</span>
                            )}
                            
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
                             {/* Hidden input to register the field with RHF */}
                             <input type="hidden" {...form.register("to")} />

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
                            {form.formState.errors.to && (
                                <span className="text-xs text-red-400">{form.formState.errors.to.message}</span>
                            )}

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
                                        <button 
                                            type="button"
                                            onClick={() => setValue("adults", Math.max(1, adults - 1))} 
                                            className="text-neutral-400 hover:text-white"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="text-sm font-medium w-3 text-center">{adults}</span>
                                        <button 
                                            type="button"
                                            onClick={() => setValue("adults", adults + 1)} 
                                            className="text-neutral-400 hover:text-white"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>
                                <div className="w-[1px] h-6 bg-white/10"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-neutral-500">Children</span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => setValue("children", Math.max(0, children - 1))} 
                                            className="text-neutral-400 hover:text-white"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="text-sm font-medium w-3 text-center">{children}</span>
                                        <button 
                                            type="button"
                                            onClick={() => setValue("children", children + 1)} 
                                            className="text-neutral-400 hover:text-white"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={control}
                            name="departureDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col space-y-2">
                                    <FormLabel className="text-xs text-neutral-400">Departure</FormLabel>
                                    <DatePicker 
                                        date={field.value} 
                                        setDate={field.onChange} 
                                        className="bg-black/50 border-white/10 text-white w-full" 
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {tripType === 'round-trip' && (
                            <FormField
                                control={control}
                                name="returnDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col space-y-2 col-span-2">
                                        <FormLabel className="text-xs text-neutral-400">Return</FormLabel>
                                        <DatePicker 
                                            date={field.value} 
                                            setDate={field.onChange} 
                                            className="bg-black/50 border-white/10 text-white w-full" 
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>

                    {/* Cabin Class */}
                    <div className="flex flex-col space-y-2 mt-2">
                        <FormField
                            control={control}
                            name="cabinClass"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-neutral-400">Cabin Class</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-black/50 border-white/10 text-white h-9">
                                                <SelectValue placeholder="Select cabin class" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-neutral-900 text-white border-white/10">
                                            <SelectItem value="ECONOMY">Economy</SelectItem>
                                            <SelectItem value="PREMIUM_ECONOMY">Premium Economy</SelectItem>
                                            <SelectItem value="BUSINESS">Business</SelectItem>
                                            <SelectItem value="FIRST">First Class</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200 mt-2">
                        <Search className="mr-2 h-4 w-4" /> Search Flights
                    </Button>
                </form>
            </Form>
        </Card>
    )
}
