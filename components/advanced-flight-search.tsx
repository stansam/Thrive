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
    Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DataTableFilter, { FilterOption } from '@/components/ui/data-table-filter';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { DatePicker } from '@/components/ui/date-picker';

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


export function AdvancedFlightSearch({ className }: { className?: string }) {
    // Core State
    const [origin, setOrigin] = React.useState('');
    const [destination, setDestination] = React.useState('');
    const [departureDate, setDepartureDate] = React.useState<Date | undefined>(new Date());
    const [returnDate, setReturnDate] = React.useState<Date | undefined>();
    const [travelers, setTravelers] = React.useState(1);

    // Advanced State
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [selectedCabin, setSelectedCabin] = React.useState<string[]>([]);
    const [selectedStops, setSelectedStops] = React.useState<string[]>([]);
    const [maxPrice, setMaxPrice] = React.useState('');
    const [includedAirlines, setIncludedAirlines] = React.useState('');

    // Dropdown Mock Data
    const airports = [
        'San Francisco (SFO)',
        'New York (JFK)',
        'London (LHR)',
        'Tokyo (HND)',
        'Dubai (DXB)',
        'Paris (CDG)',
        'Singapore (SIN)',
    ];

    const [showOriginDropdown, setShowOriginDropdown] = React.useState(false)
    const [showDestDropdown, setShowDestDropdown] = React.useState(false)


    return (
        <div className={cn("w-full max-w-5xl mx-auto p-1", className)}>
            {/* Main Search Bar Container */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                    {/* Origin */}
                    <div className="md:col-span-3 relative group">
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
                                {airports.filter(a => a.toLowerCase().includes(origin.toLowerCase())).map((airport) => (
                                    <div
                                        key={airport}
                                        className="p-2.5 text-sm text-neutral-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                                        onClick={() => {
                                            setOrigin(airport)
                                            setShowOriginDropdown(false)
                                        }}
                                    >
                                        {airport}
                                    </div>
                                ))}
                                {airports.filter(a => a.toLowerCase().includes(origin.toLowerCase())).length === 0 && (
                                    <div className="p-3 text-xs text-neutral-500 text-center">No airports found</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Destination */}
                    <div className="md:col-span-3 relative group">
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
                                {airports.filter(a => a.toLowerCase().includes(destination.toLowerCase())).map((airport) => (
                                    <div
                                        key={airport}
                                        className="p-2.5 text-sm text-neutral-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                                        onClick={() => {
                                            setDestination(airport)
                                            setShowDestDropdown(false)
                                        }}
                                    >
                                        {airport}
                                    </div>
                                ))}
                                {airports.filter(a => a.toLowerCase().includes(destination.toLowerCase())).length === 0 && (
                                    <div className="p-3 text-xs text-neutral-500 text-center">No airports found</div>
                                )}
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
                    <div className="md:col-span-2 relative group">
                        <Label className="text-xs text-neutral-400 ml-1 mb-1.5 block">Return</Label>
                        <div className="relative">
                            <DatePicker
                                date={returnDate}
                                setDate={setReturnDate}
                                placeholder="One Way"
                                className="bg-neutral-900/50 border-white/10 text-white h-10"
                            />
                        </div>
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

                        <Button className="h-10 w-12 shrink-0 bg-white text-black hover:bg-neutral-200">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Expand/Collapse Toggle */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Only show these if NOT expanded to keep UI clean, or maybe show always if we want quick access? 
                     Let's show a summary here if filters are active */}
                        {(selectedCabin.length > 0 || selectedStops.length > 0 || maxPrice) && !isExpanded && (
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
                    {/* Filter: Cabin */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-neutral-500">Cabin Class</Label>
                        <DataTableFilter
                            label="Any Cabin"
                            options={CabinOptions}
                            selectedValues={selectedCabin}
                            onChange={setSelectedCabin}
                            isMultiSelect={true}
                            className="w-full justify-between bg-neutral-900/30 border-white/5 hover:bg-neutral-900/50"
                        />
                    </div>

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
