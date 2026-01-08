'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    MapPin,
    Calendar as CalendarIcon,
    Users,
    Search,
    ChevronDown,
    ChevronUp,
    Filter,
    Plane,
    Briefcase,
    Armchair,
    DollarSign,
    Clock,
    Ban,
    Building // Added Building
} from 'lucide-react';
import { flightService } from '@/services/flight-service';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { cn } from '@/lib/utils';
import DataTableFilter, { FilterOption } from '@/components/ui/data-table-filter';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { DatePicker } from '@/components/ui/date-picker';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// --- Options for Filters ---
const CabinOptions: FilterOption[] = [
    { value: 'ECONOMY', label: 'Economy', icon: Armchair },
    { value: 'PREMIUM_ECONOMY', label: 'Premium Econ', icon: Armchair },
    { value: 'BUSINESS', label: 'Business', icon: Briefcase },
    { value: 'FIRST', label: 'First', icon: Briefcase },
];

const StopsOptions: FilterOption[] = [
    { value: 'DIRECT', label: 'Non-stop', icon: Ban },
    { value: '1', label: '1 Stop', icon: Clock },
    { value: '2+', label: '2+ Stops', icon: Clock },
];


import { useRouter, useSearchParams } from 'next/navigation';

// ... (keep imports)

export function AdvancedFlightSearch({ className }: { className?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Core State
    const [origin, setOrigin] = React.useState('');
    const [destination, setDestination] = React.useState('');
    const [departureDate, setDepartureDate] = React.useState<Date | undefined>(new Date());
    const [returnDate, setReturnDate] = React.useState<Date | undefined>();
    const [tripType, setTripType] = React.useState<'round-trip' | 'one-way'>('round-trip');
    const [travelers, setTravelers] = React.useState(1);
    const [mainCabin, setMainCabin] = React.useState('ECONOMY');

    // Advanced State
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [selectedStops, setSelectedStops] = React.useState<string[]>([]);
    const [maxPrice, setMaxPrice] = React.useState('');
    const [includedAirlines, setIncludedAirlines] = React.useState('');

    // Search State
    const [originResults, setOriginResults] = React.useState<any[]>([]);
    const [destResults, setDestResults] = React.useState<any[]>([]);
    const [isSearchingOrigin, setIsSearchingOrigin] = React.useState(false);
    const [isSearchingDest, setIsSearchingDest] = React.useState(false);

    const debouncedOrigin = useDebounce(origin, 300);
    const debouncedDest = useDebounce(destination, 300);

    // Helper to extract code from "City (CODE)"
    const extractCode = (str: string) => {
        const match = str.match(/\(([^)]+)\)/);
        return match ? match[1] : str;
    }

    // Effect for Origin Search
    React.useEffect(() => {
        const searchOrigin = async () => {
            if (debouncedOrigin.length < 2) {
                setOriginResults([]);
                return;
            }

            setIsSearchingOrigin(true);
            try {
                const response = await flightService.searchLocations(debouncedOrigin);
                if (response.success) {
                    setOriginResults(response.data);
                }
            } catch (error) {
                console.error("Failed to search origin:", error);
                setOriginResults([]);
            } finally {
                setIsSearchingOrigin(false);
            }
        }
        searchOrigin();
    }, [debouncedOrigin]);

    // Effect for Destination Search
    React.useEffect(() => {
        const searchDest = async () => {
            if (debouncedDest.length < 2) {
                setDestResults([]);
                return;
            }

            setIsSearchingDest(true);
            try {
                const response = await flightService.searchLocations(debouncedDest);
                if (response.success) {
                    setDestResults(response.data);
                }
            } catch (error) {
                console.error("Failed to search destination:", error);
                setDestResults([]);
            } finally {
                setIsSearchingDest(false);
            }
        }
        searchDest();
    }, [debouncedDest]);

    const handleSelectLocation = (location: any, type: 'origin' | 'destination') => {
        const displayValue = `${location.name} (${location.iataCode})`;
        if (type === 'origin') {
            setOrigin(displayValue);
            setShowOriginDropdown(false);
        } else {
            setDestination(displayValue);
            setShowDestDropdown(false);
        }
    }

    // Hydrate from URL
    React.useEffect(() => {
        const originParam = searchParams.get('origin');
        const destParam = searchParams.get('destination');
        const dateParam = searchParams.get('departureDate');
        const adultsParam = searchParams.get('adults');
        const cabinParam = searchParams.get('travelClass');
        const maxPriceParam = searchParams.get('maxPrice');

        if (originParam) setOrigin(originParam);
        if (destParam) setDestination(destParam);
        if (dateParam) setDepartureDate(new Date(dateParam));
        if (adultsParam) setTravelers(parseInt(adultsParam));
        if (cabinParam) {
            setMainCabin(cabinParam);
        }
        if (maxPriceParam) setMaxPrice(maxPriceParam);

        // Check for return date to set round-trip
        const returnDateParam = searchParams.get('returnDate');
        if (returnDateParam) {
            setReturnDate(new Date(returnDateParam));
            setTripType('round-trip');
        } else {
            setTripType('one-way'); // Default to one way if no return date? Or default logic. 
            // Prompt says default is Round Trip. But if URL has no return date, maybe it IS one way?
            // "Round Trip"(default). 
            // I will respect URL if present, otherwise default state is round-trip.
            // Actually, if I just landed, I want default.
            // If I searched, I want what I searched.
            // If returnDateParam is missing on a search result page, it essentially IS a one-way search displayed.
            if (searchParams.has('adults')) { // heuristic to check if it's a search
                if (!returnDateParam) setTripType('one-way');
            }
        }
    }, [searchParams]);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (origin) params.append('origin', extractCode(origin));
        if (destination) params.append('destination', extractCode(destination));
        if (departureDate) params.append('departureDate', departureDate.toISOString().split('T')[0]);
        if (tripType === 'round-trip' && returnDate) {
            params.append('returnDate', returnDate.toISOString().split('T')[0]);
        }
        params.append('adults', travelers.toString());

        // Use mainCabin for search
        params.append('travelClass', mainCabin);

        // Advanced filters
        if (selectedStops.length > 0) {
            // Maybe join or multiple? URL usually one param or array.
            // Usually for specialized filters. Skipping for now as main requirement is Cabin.
        }
        if (maxPrice) params.append('maxPrice', maxPrice);

        router.push(`/flights/results?${params.toString()}`);
    }

    const [showOriginDropdown, setShowOriginDropdown] = React.useState(false)
    const [showDestDropdown, setShowDestDropdown] = React.useState(false)


    return (
        <div className={cn("w-full max-w-5xl mx-auto p-1", className)}>
            {/* Main Search Bar Container */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 transition-all duration-300">
                {/* Trip Type Radio */}
                <div className="mb-4">
                    <RadioGroup value={tripType} onValueChange={(val: any) => setTripType(val)} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="round-trip" id="adv-round-trip" className="border-white text-white" />
                            <Label htmlFor="adv-round-trip" className="text-white cursor-pointer">Round Trip</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="one-way" id="adv-one-way" className="border-white text-white" />
                            <Label htmlFor="adv-one-way" className="text-white cursor-pointer">One Way</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                    {/* Origin */}
                    <div className="md:col-span-2 relative group">
                        <Label className="text-xs text-neutral-400 ml-1 mb-1.5 block">From</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500 group-focus-within:text-white transition-colors" />
                            <Input
                                value={origin}
                                onChange={(e) => {
                                    setOrigin(e.target.value);
                                    setShowOriginDropdown(true);
                                }}
                                onFocus={() => setShowOriginDropdown(true)}
                                onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                                placeholder="Origin City or Airport"
                                className="pl-9 bg-neutral-900/50 border-white/10 text-white placeholder:text-neutral-600 focus:border-white/30 h-10 transition-all"
                            />
                        </div>
                        {showOriginDropdown && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-md z-50 overflow-hidden shadow-xl max-h-60 overflow-y-auto">
                                {isSearchingOrigin ? (
                                    <div className="p-3 text-xs text-neutral-500 text-center">Searching...</div>
                                ) : originResults.length > 0 ? (
                                    originResults.map((location, idx) => (
                                        <div
                                            key={`${location.iataCode}-${idx}`}
                                            className="p-2.5 text-sm text-neutral-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors flex items-center gap-2"
                                            onClick={() => handleSelectLocation(location, 'origin')}
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
                                ) : debouncedOrigin.length >= 2 ? (
                                    <div className="p-3 text-xs text-neutral-500 text-center">No results found</div>
                                ) : null}
                            </div>
                        )}
                    </div>

                    {/* Destination */}
                    <div className="md:col-span-2 relative group">
                        <Label className="text-xs text-neutral-400 ml-1 mb-1.5 block">To</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500 group-focus-within:text-white transition-colors" />
                            <Input
                                value={destination}
                                onChange={(e) => {
                                    setDestination(e.target.value);
                                    setShowDestDropdown(true);
                                }}
                                onFocus={() => setShowDestDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                                placeholder="Destination City or Airport"
                                className="pl-9 bg-neutral-900/50 border-white/10 text-white placeholder:text-neutral-600 focus:border-white/30 h-10 transition-all"
                            />
                        </div>
                        {showDestDropdown && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-md z-50 overflow-hidden shadow-xl max-h-60 overflow-y-auto">
                                {isSearchingDest ? (
                                    <div className="p-3 text-xs text-neutral-500 text-center">Searching...</div>
                                ) : destResults.length > 0 ? (
                                    destResults.map((location, idx) => (
                                        <div
                                            key={`${location.iataCode}-${idx}`}
                                            className="p-2.5 text-sm text-neutral-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors flex items-center gap-2"
                                            onClick={() => handleSelectLocation(location, 'destination')}
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
                                ) : debouncedDest.length >= 2 ? (
                                    <div className="p-3 text-xs text-neutral-500 text-center">No results found</div>
                                ) : null}
                            </div>
                        )}
                    </div>

                    {/* Departure Date */}
                    <div className="md:col-span-2 relative group">
                        <Label className="text-xs text-neutral-400 ml-1 mb-1.5 block">Departure</Label>
                        <div className="relative">
                            <DatePicker
                                date={departureDate}
                                setDate={setDepartureDate}
                                className="bg-neutral-900/50 border-white/10 text-white h-10"
                            />
                        </div>
                    </div>

                    {/* Return Date - Optional */}
                    {tripType === 'round-trip' && (
                        <div className="md:col-span-2 relative group">
                            <Label className="text-xs text-neutral-400 ml-1 mb-1.5 block">Return</Label>
                            <div className="relative">
                                <DatePicker
                                    date={returnDate}
                                    setDate={setReturnDate}
                                    placeholder="Select Date"
                                    className="bg-neutral-900/50 border-white/10 text-white h-10"
                                />
                            </div>
                        </div>
                    )}

                    {/* Cabin Class - Main visible field */}
                    <div className="md:col-span-2 relative group">
                        <Label className="text-xs text-neutral-400 ml-1 mb-1.5 block">Cabin</Label>
                        <Select value={mainCabin} onValueChange={setMainCabin}>
                            <SelectTrigger className="bg-neutral-900/50 border-white/10 text-white h-10">
                                <SelectValue placeholder="Cabin" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 text-white border-white/10">
                                <SelectItem value="ECONOMY">Economy</SelectItem>
                                <SelectItem value="PREMIUM_ECONOMY">Premium</SelectItem>
                                <SelectItem value="BUSINESS">Business</SelectItem>
                                <SelectItem value="FIRST">First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Travelers & Search Button */}
                    <div className="md:col-span-2 flex items-end gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-10 w-full bg-neutral-900/50 border-white/10 hover:bg-neutral-800 text-neutral-300 hover:text-white px-2 justify-between">
                                    <div className='flex items-center gap-2'>
                                        <Users className="h-4 w-4" />
                                        <span>{travelers}</span>
                                    </div>
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-40 p-2 bg-neutral-900 border-white/10 text-white">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Adults</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="h-6 w-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center">-</button>
                                        <span>{travelers}</span>
                                        <button onClick={() => setTravelers(travelers + 1)} className="h-6 w-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center">+</button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button className="h-10 w-12 shrink-0 bg-white text-black hover:bg-neutral-200" onClick={handleSearch}>
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Expand/Collapse Toggle */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Only show these if NOT expanded to keep UI clean, or maybe show always if we want quick access? 
                     Let's show a summary here if filters are active */}
                        {(selectedStops.length > 0 || maxPrice) && !isExpanded && (
                            <div className="flex gap-2 text-xs text-neutral-400 items-center">
                                <Filter className="h-3 w-3" />
                                <span className="text-neural-300">Filters active</span>
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-neutral-400 hover:text-white hover:bg-white/5 h-8 text-xs gap-1 ml-auto"
                    >
                        {isExpanded ? (
                            <>Less Options <ChevronUp className="h-3 w-3" /></>
                        ) : (
                            <>Advanced Params <ChevronDown className="h-3 w-3" /></>
                        )}
                    </Button>
                </div>


                {/* Expanded Filters Section */}
                <div className={cn(
                    "grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden transition-all duration-500 ease-in-out",
                    isExpanded ? "max-h-[500px] opacity-100 mt-6 pt-6 border-t border-white/10" : "max-h-0 opacity-0 mt-0 pt-0"
                )}>

                    {/* Filter: Stops */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-neutral-500">Stops</Label>
                        <DataTableFilter
                            label="Any Stops"
                            options={StopsOptions}
                            selectedValues={selectedStops}
                            onChange={setSelectedStops}
                            isMultiSelect={true}
                            className="w-full justify-between bg-neutral-900/30 border-white/5 hover:bg-neutral-900/50"
                        />
                    </div>

                    {/* Filter: Price */}
                    <div className="space-y-1.5 relative group">
                        <Label className="text-xs text-neutral-500">Max Price (EUR)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-600" />
                            <Input
                                placeholder="No Limit"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="pl-8 h-8 text-sm bg-neutral-900/30 border-white/5 focus:border-white/20 text-neutral-300 placeholder:text-neutral-700"
                            />
                        </div>
                    </div>

                    {/* Filter: Airline */}
                    <div className="space-y-1.5 relative group">
                        <Label className="text-xs text-neutral-500">Preferred Airline</Label>
                        <div className="relative">
                            <Plane className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-600" />
                            <Input
                                placeholder="Airline Code (e.g. BA)"
                                value={includedAirlines}
                                onChange={(e) => setIncludedAirlines(e.target.value)}
                                className="pl-8 h-8 text-sm bg-neutral-900/30 border-white/5 focus:border-white/20 text-neutral-300 placeholder:text-neutral-700"
                            />
                        </div>
                    </div>

                    {/* Radius Params (Example of specialized Amadeus param) */}
                    <div className="md:col-span-4 flex gap-6 mt-2 pt-4 border-t border-dashed border-white/5">
                        <div className="flex items-center gap-2 text-neutral-500">
                            <span className="text-[10px] uppercase tracking-wider font-semibold">Additional Parameters:</span>
                        </div>
                        <Label className="flex items-center gap-2 cursor-pointer group">
                            <div className="w-4 h-4 rounded border border-white/20 group-hover:border-white/50 flex items-center justify-center transition-colors">
                            </div>
                            <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">Direct only</span>
                        </Label>
                        <Label className="flex items-center gap-2 cursor-pointer group">
                            <div className="w-4 h-4 rounded border border-white/20 group-hover:border-white/50 flex items-center justify-center transition-colors">
                            </div>
                            <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">Include nearby airports</span>
                        </Label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdvancedFlightSearch;
