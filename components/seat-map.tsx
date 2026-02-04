'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FlightOffer } from '@/lib/types/flight';
import { flightService } from '@/services/flight-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Armchair, AlertCircle, Info, User, Check, X, Utensils, Coffee, Bath } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// ----------------------------------------------------------------------
// TYPES & INTERFACES (Mapped to Amadeus API)
// ----------------------------------------------------------------------

interface SeatMapProps {
    flightOffer: FlightOffer;
    travelers: any[];
    onSeatsSelected: (selections: { [travelerId: string]: string }) => void;
    onSkip?: () => void;
}

interface Price {
    amount: string;
    currency: string;
    taxes?: { amount: string; code: string }[];
    total: string;
}

interface TravelerPricing {
    travelerId: string;
    seatAvailabilityStatus: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED';
    price?: Price;
}

interface Coordinates {
    x: number;
    y: number;
}

interface Seat {
    number: string;
    cabin: string;
    characteristicsCodes?: string[];
    coordinates: Coordinates;
    travelerPricing: TravelerPricing[];
}

interface Facility {
    code: 'LA' | 'G' | string; // LA = Lavatory, G = Galley
    column: string;
    row: string;
    position: 'FRONT' | 'REAR' | 'MIDDLE';
    coordinates: Coordinates;
}

interface DeckConfiguration {
    width: number;
    length: number;
    startSeatRow: number;
    endSeatRow: number;
    startWingsRow?: number;
    endWingsRow?: number;
    startWingsX?: number;
    endWingsX?: number;
    exitRowsX?: number[];
}

interface SeatMapResponse {
    carrierCode: string;
    number: string;
    decks: {
        deckType: string;
        deckConfiguration: DeckConfiguration;
        seats: Seat[];
        facilities?: Facility[];
    }[];
}

interface ProcessedDeck {
    rows: number[];    // Sorted X coordinates
    columns: number[]; // Sorted Y coordinates
    grid: Record<number, Record<number, GridItem>>; // grid[y][x]
    rowMap: Record<number, string>; // y -> Column Letter (A, B, C)
    seatRowMap: Record<number, string>; // x -> Row Number (1, 2, 3)
    config: DeckConfiguration;
}

type GridItem = 
    | { type: 'seat'; data: Seat } 
    | { type: 'facility'; data: Facility } 
    | null;


// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export function SeatMap({ flightOffer, travelers, onSeatsSelected, onSkip }: SeatMapProps) {
    const [loading, setLoading] = useState(true);
    const [seatMaps, setSeatMaps] = useState<SeatMapResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<{ [segmentAndTraveler: string]: string }>({});
    
    // Selection State
    const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0);
    const [currentTravelerIdx, setCurrentTravelerIdx] = useState(0);

    // Responsive State
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchSeatMap = async () => {
            try {
                const response = await flightService.getSeatMap(flightOffer);
                if (response.success && response.data && response.data.length > 0) {
                    setSeatMaps(response.data);
                } else {
                     if (!response.data || response.data.length === 0) {
                         setError('No seat map data available.');
                     }
                }
            } catch (e) {
                console.error(e);
                setError('Failed to fetch cabin layout.');
            } finally {
                setLoading(false);
            }
        };

        fetchSeatMap();
    }, [flightOffer]);

    const handleSeatClick = (seat: Seat) => {
        const travelerId = travelers[currentTravelerIdx]?.id || (currentTravelerIdx + 1).toString();
        
        // Find pricing for THIS traveler
        const pricing = seat.travelerPricing.find(p => p.travelerId === travelerId);
        
        // If not available for this specific traveler, ignore
        if (!pricing || pricing.seatAvailabilityStatus !== 'AVAILABLE') return;

        const key = `${currentSegmentIdx}-${currentTravelerIdx}`;
        
        // Deselect logic
        if (selectedSeats[key] === seat.number) {
            const newSeats = { ...selectedSeats };
            delete newSeats[key];
            setSelectedSeats(newSeats);
            updateParent(newSeats);
            return;
        }

        // Check if taken by another traveler in current session
        const isTakenByOther = Object.entries(selectedSeats).some(
            ([k, v]) => k.startsWith(`${currentSegmentIdx}-`) && k !== key && v === seat.number
        );
        if (isTakenByOther) return; 

        // Select
        const newSeats = { ...selectedSeats, [key]: seat.number };
        setSelectedSeats(newSeats);
        updateParent(newSeats);
        
        // Auto-advance to next traveler if available and not last
        if (currentTravelerIdx < travelers.length - 1) {
            // Optional: only auto-advance if next traveler hasn't selected yet?
             // setCurrentTravelerIdx(curr => curr + 1);
        }
    };

    const updateParent = (selections: any) => {
        const simplified: { [travelerId: string]: string } = {};
        travelers.forEach((t, tIdx) => {
            const seats = Object.entries(selections)
                .filter(([k]) => k.endsWith(`-${tIdx}`))
                .map(([_, val]) => val)
                .join(', ');

            if (seats) {
                simplified[t.id || (tIdx + 1).toString()] = seats;
            }
        });
        onSeatsSelected(simplified);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 bg-neutral-900/50 rounded-xl border border-neutral-800">
            <Loader2 className="animate-spin h-8 w-8 text-sky-500 mb-4" />
            <p className="text-neutral-400 text-sm">Loading cabin layout...</p>
        </div>
    );

    if (error || !seatMaps.length) {
        return (
            <Card className="bg-neutral-900 border-neutral-800 text-white">
                <CardHeader>
                    <CardTitle className="text-amber-500 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Seat Selection Unavailable
                    </CardTitle>
                    <CardDescription className="text-neutral-400">
                        {error || "We couldn't retrieve the seat map for this flight."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-neutral-300 mb-6">
                        You can skip seat selection for now. We will request the best available seats for you automatically.
                    </p>
                    {onSkip && (
                        <Button onClick={onSkip} className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white">
                            Skip Seat Selection
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }

    const currentSeatMap = seatMaps[currentSegmentIdx];
    const deck = currentSeatMap?.decks?.[0];

    return (
        <Card className="bg-neutral-950 border-neutral-800 text-white overflow-hidden shadow-2xl">
            <CardHeader className="pb-4 bg-neutral-900/50 border-b border-neutral-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <CardTitle className="text-xl font-light tracking-wide text-white">Select Seats</CardTitle>
                        <CardDescription className="text-neutral-400 mt-1 flex items-center gap-2">
                           <span className="font-semibold text-sky-400">{currentSeatMap.carrierCode} {currentSeatMap.number}</span> 
                           <span className="text-neutral-600">•</span>
                           {flightOffer.itineraries[0].segments[currentSegmentIdx]?.departure?.iataCode} <span className="text-neutral-600">→</span> {flightOffer.itineraries[0].segments[currentSegmentIdx]?.arrival?.iataCode}
                           <span className="text-neutral-600">•</span>
                           {currentSeatMap.decks[0].deckType} Deck
                        </CardDescription>
                    </div>
                    
                    {/* Traveler Selector */}
                     <div className="flex gap-2 overflow-x-auto pb-2 max-w-full no-scrollbar">
                        {travelers.map((t, idx) => {
                            const isSelected = currentTravelerIdx === idx;
                            const seatAssigned = selectedSeats[`${currentSegmentIdx}-${idx}`];
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentTravelerIdx(idx)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border relative overflow-hidden group",
                                        isSelected 
                                            ? "bg-sky-600 border-sky-500 text-white shadow-[0_0_20px_rgba(2,132,199,0.3)]" 
                                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                                        isSelected ? "bg-white text-sky-600" : "bg-neutral-800 text-neutral-500 group-hover:bg-neutral-700"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex flex-col items-start leading-none gap-0.5">
                                        <span className={cn("text-xs uppercase tracking-wider", isSelected ? "text-white" : "text-neutral-500")}>
                                            {t.firstName || `Traveler ${idx + 1}`}
                                        </span>
                                        {seatAssigned ? (
                                            <span className="text-[10px] text-sky-200 font-bold flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Seat {seatAssigned}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] opacity-70">Select a seat</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-0">
                {/* Visual Legend */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 py-4 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase tracking-wider bg-neutral-950/80 backdrop-blur-md sticky top-0 z-20 shadow-md">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-[4px] bg-neutral-800 border border-neutral-700" /> Available</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-[4px] bg-sky-600 border border-sky-500 shadow-[0_0_10px_rgba(2,132,199,0.5)]" /> Selected</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-[4px] bg-neutral-900 border border-neutral-800 opacity-50 slash-pattern cursor-not-allowed" /> Occupied</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-[4px] bg-indigo-900/30 border border-indigo-500/50" /> Premium</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-[4px] flex items-center justify-center bg-neutral-800 text-neutral-500"><X className="w-3 h-3" /></div> Exit Row</div>
                </div>

                <div className="bg-black min-h-[400px] relative overflow-hidden flex flex-col">
                    {/* Fuselage Background Decoration */}
                    <div className="absolute inset-x-0 top-0 h-full w-[90%] mx-auto border-x border-neutral-900/50 pointer-events-none rounded-[100px] opacity-20" />

                    {!deck ? (
                         <div className="flex justify-center items-center h-64 text-neutral-500">No deck configuration found.</div>
                    ) : (
                        isMobile ? (
                            <MobileSeatMap 
                                deck={deck} 
                                selectedSeats={selectedSeats}
                                currentSegmentIdx={currentSegmentIdx}
                                currentTravelerIdx={currentTravelerIdx}
                                travelers={travelers}
                                onSelect={handleSeatClick}
                            />
                        ) : (
                            <DesktopSeatMap 
                                deck={deck} 
                                selectedSeats={selectedSeats}
                                currentSegmentIdx={currentSegmentIdx}
                                currentTravelerIdx={currentTravelerIdx}
                                travelers={travelers}
                                onSelect={handleSeatClick}
                            />
                        )
                    )}
                </div>

                 {/* Footer / Actions */}
                 <div className="p-4 border-t border-neutral-800 flex justify-between items-center bg-neutral-900">
                    {onSkip && (
                        <Button variant="ghost" size="sm" onClick={onSkip} className="text-neutral-400 hover:text-white hover:bg-neutral-800">
                            Skip Seat Selection
                        </Button>
                    )}
                    <div className="text-xs text-neutral-500 hidden sm:block">
                        * Prices vary per traveler based on loyalty status and ticket class.
                    </div>
                 </div>
            </CardContent>
        </Card>
    );
}

// ----------------------------------------------------------------------
// DATA PROCESSING UTILS
// ----------------------------------------------------------------------

function processDeckData(deck: any): ProcessedDeck {
    const grid: Record<number, Record<number, GridItem>> = {};
    const xSet = new Set<number>();
    const ySet = new Set<number>();
    const rowMap: Record<number, string> = {};
    const seatRowMap: Record<number, string> = {};
    
    // Safety check
    if (!deck?.seats) return { rows: [], columns: [], grid: {}, rowMap: {}, seatRowMap: {}, config: deck?.deckConfiguration || {} };

    // 1. Process Seats
    deck.seats.forEach((seat: Seat) => {
        const x = seat.coordinates?.x ?? 0;
        const y = seat.coordinates?.y ?? 0;

        xSet.add(x);
        ySet.add(y);

        if (!grid[y]) grid[y] = {};
        grid[y][x] = { type: 'seat', data: seat };

        // Infer mappings
        const match = seat.number.match(/(\d+)([A-Z]+)/);
        if (match) {
            seatRowMap[x] = match[1]; 
            rowMap[y] = match[2];     
        }
    });

    // 2. Process Facilities (Lavatories, Galleys)
    if (deck.facilities) {
        deck.facilities.forEach((fac: Facility) => {
            const x = fac.coordinates?.x ?? 0;
            const y = fac.coordinates?.y ?? 0;
            
            xSet.add(x);
            ySet.add(y);

            if (!grid[y]) grid[y] = {};
            // Facilities overwrite whitespace but usually don't overlap seats in valid data
            if (!grid[y][x]) {
                grid[y][x] = { type: 'facility', data: fac };
            }
        });
    }

    // Fill gaps in rowMap/seatRowMap if needed (interpolating)
    // For now, reliance on data is safer.

    return {
        rows: Array.from(xSet).sort((a, b) => a - b),
        columns: Array.from(ySet).sort((a, b) => a - b),
        grid,
        rowMap,
        seatRowMap,
        config: deck.deckConfiguration
    };
}


// ----------------------------------------------------------------------
// DESKTOP VIEW
// ----------------------------------------------------------------------

function DesktopSeatMap({ deck, selectedSeats, currentSegmentIdx, currentTravelerIdx, travelers, onSelect }: any) {
    const { rows: xIndices, columns: yIndices, grid, rowMap, seatRowMap, config } = useMemo(() => processDeckData(deck), [deck]);
    
    return (
        <div className="w-full overflow-x-auto pb-6">
            <div className="p-8 flex justify-center min-w-max">
            <div className="bg-neutral-900/30 p-8 rounded-[40px] border border-neutral-800/50 relative">
                
                {/* Cockpit / Front Indicator */}
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-neutral-700 text-xs font-mono tracking-[0.5em] uppercase">
                    Front
                </div>

                 {/* Wing Indicators */}
                 {config.startWingsX && config.endWingsX && (
                    <>
                        <div 
                            className="absolute top-0 -left-6 bottom-0 w-1 bg-neutral-800/30 rounded-full"
                            style={{
                                top: `${(yIndices.findIndex((y) => y === 0) / yIndices.length) * 100}%` // Approx
                            }}
                        />
                        {/* A simplified visual approach for wings: 
                            Just highlight the background of rows that are "Over Wing" 
                        */}
                    </>
                 )}

                <div className="flex flex-col gap-3">
                    {yIndices.map((y) => (
                        <div key={y} className="flex items-center gap-3">
                            {/* Row Header (Letter) */}
                            <div className="w-8 h-8 flex items-center justify-center text-sm font-bold text-neutral-600">
                                {rowMap[y] || ''}
                            </div>

                            {/* Grid Items */}
                            <div className="flex gap-2">
                                {xIndices.map((x) => {
                                    const item = grid[y]?.[x];
                                    
                                    // Check for Exit Row
                                    const isExitRow = config.exitRowsX?.includes(x);
                                    
                                    // Render Spacer or Item
                                    if (!item) {
                                        return (
                                            <div key={`${y}-${x}`} className={cn("w-9 h-9 flex items-center justify-center relative", isExitRow ? "mx-4" : "")}>
                                                 {isExitRow && <span className="text-[8px] text-neutral-700 font-mono rotate-90 absolute">EXIT</span>}
                                            </div>
                                        );
                                    }

                                    if (item.type === 'facility') {
                                        return (
                                            <FacilityIcon key={`fac-${x}-${y}`} facility={item.data} isExitRow={!!isExitRow} />
                                        );
                                    }

                                    // Seat
                                    const seat = item.data;
                                    const travelerId = travelers[currentTravelerIdx]?.id || (currentTravelerIdx + 1).toString();
                                    const pricing = seat.travelerPricing?.find((p: any) => p.travelerId === travelerId);
                                    const isAvailable = pricing?.seatAvailabilityStatus === 'AVAILABLE';
                                    
                                    // Check blocked/occupied status from API for visual consistency
                                    const isOccupied = !isAvailable; // strictly based on current traveler view

                                    return (
                                        <div key={seat.number} className={cn(isExitRow ? "mr-4 relative" : "")}>
                                            {isExitRow && (
                                                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 flex justify-center">
                                                     <div className="w-0.5 h-2 bg-neutral-800" />
                                                </div>
                                            )}
                                            <SeatButton 
                                                seat={seat}
                                                travelerId={travelerId}
                                                pricing={pricing}
                                                isSelected={selectedSeats[`${currentSegmentIdx}-${currentTravelerIdx}`] === seat.number}
                                                isOccupied={isOccupied}
                                                isTakenByOther={Object.entries(selectedSeats).some(
                                                    ([k, v]) => k.startsWith(`${currentSegmentIdx}-`) && k !== `${currentSegmentIdx}-${currentTravelerIdx}` && v === seat.number
                                                )}
                                                onClick={() => onSelect(seat)}
                                                label={seatRowMap[x]} 
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                     {/* X-Axis Labels (Row Numbers) */}
                     <div className="flex items-center gap-3 mt-2 border-t border-neutral-800/50 pt-2">
                        <div className="w-8" /> 
                        <div className="flex gap-2">
                             {xIndices.map((x) => (
                                 <div key={x} className={cn(
                                     "w-9 text-center text-[9px] text-neutral-600 font-mono",
                                     config.exitRowsX?.includes(x) ? "mr-4" : ""
                                 )}>
                                     {seatRowMap[x]}
                                 </div>
                             ))}
                        </div>
                     </div>
                </div>
            </div>
            </div>
        </div>
    );
}


// ----------------------------------------------------------------------
// MOBILE VIEW
// ----------------------------------------------------------------------

function MobileSeatMap({ deck, selectedSeats, currentSegmentIdx, currentTravelerIdx, travelers, onSelect }: any) {
    const { rows: xIndices, columns: yIndices, grid, rowMap, config } = useMemo(() => processDeckData(deck), [deck]);

    const groups = useMemo(() => {
        if (yIndices.length <= 4) return [{ id: "all", label: "All Seats", indices: yIndices }];
        
        const mid = Math.ceil(yIndices.length / 2);
        const left = yIndices.slice(0, mid);
        const right = yIndices.slice(mid);
        
        const labelLeft = `${rowMap[left[0]] || ''}-${rowMap[left[left.length-1]] || ''}`;
        const labelRight = `${rowMap[right[0]] || ''}-${rowMap[right[right.length-1]] || ''}`;

        return [
            { id: "left", label: `Zone ${labelLeft}`, indices: left },
            { id: "right", label: `Zone ${labelRight}`, indices: right }
        ];
    }, [yIndices, rowMap]);

    return (
        <div className="p-4 w-full">
             <Tabs defaultValue={groups[0].id || "left"} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-neutral-900 border border-neutral-800 h-10 p-1">
                    {groups.map(g => (
                        <TabsTrigger key={g.id} value={g.id || "left"} className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-xs text-neutral-400">
                            {g.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {groups.map(group => (
                    <TabsContent key={group.id} value={group.id || "left"} className="mt-0 space-y-3">
                         <div className="flex flex-col gap-3 pb-20">
                             {xIndices.map((x) => {
                                 const hasItems = group.indices.some(y => grid[y]?.[x]);
                                 if (!hasItems) return null;

                                 const isExitRow = config.exitRowsX?.includes(x);

                                 return (
                                     <div key={x} className={cn(
                                         "flex items-center justify-between p-3 rounded-xl border transition-colors",
                                         isExitRow ? "bg-red-900/10 border-red-900/20" : "bg-neutral-900/40 border-neutral-800/50"
                                     )}>
                                         <div className="flex flex-col items-center justify-center w-8 mr-2 gap-1">
                                             <span className="text-sm font-mono text-neutral-500 font-bold">
                                                  {group.indices.map(y => {
                                                      const item = grid[y]?.[x];
                                                      return item?.type === 'seat' ? item.data.number.match(/\d+/)?.[0] : null
                                                  }).find(s => s) || x}
                                             </span>
                                             {isExitRow && <span className="text-[8px] text-red-500 uppercase font-bold">Exit</span>}
                                         </div>
                                         
                                         <div className="flex gap-3">
                                             {group.indices.map(y => {
                                                 const item = grid[y]?.[x];
                                                 if (!item) return <div key={`${y}-${x}`} className="w-10 h-10" />;
                                                 
                                                 if (item.type === 'facility') {
                                                     return <FacilityIcon key={`fac-${x}-${y}`} facility={item.data} mobile />;
                                                 }

                                                 const seat = item.data;
                                                 const travelerId = travelers[currentTravelerIdx]?.id || (currentTravelerIdx + 1).toString();
                                                 const pricing = seat.travelerPricing?.find((p: any) => p.travelerId === travelerId);
                                                 // Don't show isOccupied on mobile if we can just disable? 
                                                 // Actually disabling is cleaner.
                                                 const isAvailable = pricing?.seatAvailabilityStatus === 'AVAILABLE';

                                                 return (
                                                     <SeatButton 
                                                         key={seat.number}
                                                         seat={seat}
                                                         travelerId={travelerId}
                                                         pricing={pricing}
                                                         isSelected={selectedSeats[`${currentSegmentIdx}-${currentTravelerIdx}`] === seat.number}
                                                         isOccupied={!isAvailable}
                                                         isTakenByOther={Object.entries(selectedSeats).some(
                                                            ([k, v]) => k.startsWith(`${currentSegmentIdx}-`) && k !== `${currentSegmentIdx}-${currentTravelerIdx}` && v === seat.number
                                                         )}
                                                         onClick={() => onSelect(seat)}
                                                         label={rowMap[y]}
                                                         mobile
                                                     />
                                                 );
                                             })}
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}


// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

function FacilityIcon({ facility, isExitRow, mobile }: { facility: Facility, isExitRow?: boolean, mobile?: boolean }) {
    const Icon = facility.code === 'LA' ? Bath : 
                 facility.code === 'G' ? Coffee : 
                 Info;

    return (
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <div className={cn(
                        "flex items-center justify-center rounded-md bg-neutral-800/30 border border-neutral-700/50 text-neutral-600",
                        mobile ? "w-10 h-10" : "w-9 h-9",
                        isExitRow ? "mr-4" : ""
                    )}>
                        <Icon className="w-4 h-4 opacity-70" />
                    </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-neutral-800 text-xs">
                    {facility.code === 'LA' ? 'Lavatory' : facility.code === 'G' ? 'Galley' : 'Facility'}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

interface SeatButtonProps {
    seat: Seat;
    travelerId: string;
    pricing: any;
    isSelected: boolean;
    isOccupied: boolean;
    isTakenByOther: boolean;
    onClick: () => void;
    label?: string;
    mobile?: boolean;
}

function SeatButton({ seat, travelerId, pricing, isSelected, isOccupied, isTakenByOther, onClick, label, mobile }: SeatButtonProps) {
    const isPremium = seat.characteristicsCodes?.includes('1A_AQC_PREMIUM_SEAT'); 

    // Classes
    const baseClasses = cn(
        "flex items-center justify-center transition-all duration-300 relative group",
        mobile ? "w-10 h-10 rounded-lg text-sm" : "w-9 h-9 rounded-[6px] text-[10px]",
        // Selected
        isSelected && "bg-sky-600 text-white shadow-[0_4px_12px_rgba(2,132,199,0.4)] border-sky-500 z-10 scale-105",
        // Occupied
        isOccupied && "bg-neutral-800/20 text-neutral-800 cursor-not-allowed border-transparent opacity-60",
        // Available (Default)
        !isSelected && !isOccupied && !isTakenByOther && "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-500 hover:text-white hover:bg-neutral-750 hover:shadow-lg",
        // Premium Available
        !isSelected && !isOccupied && isPremium && "border-indigo-500/30 bg-indigo-900/10 text-indigo-300 hover:bg-indigo-900/20 hover:border-indigo-400 hover:text-white",
        // Taken by other
        isTakenByOther && "bg-purple-900/20 border border-purple-900/50 text-purple-700 cursor-not-allowed opacity-70"
    );

    const content = (
        <>
            <span className={cn("font-medium relative z-10", isOccupied && "slash-pattern opacity-10")}>{label || seat.number}</span>    
            {isSelected && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full shadow-sm animate-in zoom-in" />}
            {isPremium && !isSelected && !isOccupied && (
                <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-indigo-400 rounded-full opacity-50" />
            )}
        </>
    );
    
    // Details Component (Shared for Tooltip and Sheet)
    const SeatDetails = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                    <h4 className="text-xl font-bold flex items-center gap-2">
                        Seat {seat.number} 
                        {isPremium && <Badge variant="secondary" className="bg-indigo-900/50 text-indigo-300 border-indigo-500/30 text-[10px]">Premium</Badge>}
                    </h4>
                    <p className="text-neutral-400 text-sm capitalize">{seat.cabin?.toLowerCase().replace('_',' ')} Class</p>
                </div>
                <div className="text-right">
                    {pricing?.price && parseFloat(pricing.price.base) > 0 ? (
                        <div className="flex flex-col items-end">
                            <span className="text-lg font-bold text-green-400">{pricing.price.total} {pricing.price.currency}</span>
                            <span className="text-[10px] text-neutral-500">Includes taxes</span>
                        </div>
                    ) : (
                        <Badge variant="outline" className="border-green-800 text-green-400 bg-green-900/10">Free</Badge>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <h5 className="text-sm font-semibold text-neutral-300">Features</h5>
                <div className="flex flex-wrap gap-2">
                    {seat.characteristicsCodes?.map(c => (
                        <Badge key={c} variant="outline" className="bg-neutral-800 border-neutral-700 text-neutral-400 text-[10px] font-normal">
                            {c}
                        </Badge>
                    ))}
                    {!seat.characteristicsCodes?.length && <span className="text-neutral-600 text-xs italic">Standard seat features</span>}
                </div>
            </div>

            {isOccupied && (
                <div className="flex items-center gap-2 p-3 bg-red-900/10 border border-red-900/20 rounded-lg text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    This seat is unavailable for the selected traveler.
                </div>
            )}
        </div>
    );

    // On mobile, use Sheet (Drawer). On Desktop, use Tooltip.
    if (mobile) {
        return (
            <Sheet>
                <SheetTrigger asChild>
                    <button disabled={isOccupied || isTakenByOther} className={baseClasses} onClick={(e) => {
                        if(isOccupied || isTakenByOther) return; 
                        // If we are strictly selecting, we might not want to open sheet if just clicking?
                        // Actually, tap to select, long press for details?
                        // Or tap opens detail + select button? 
                        // Plan said "clicking a seat opens a Drawer".
                        // So we should NOT call onSelect directly in onClick here if we want Drawer first.
                        // BUT standard UX: Tap to select. Maybe details button in Drawer?
                        // Let's make tap select immediately, but offer small info button?
                        // No, simpler: Tap selects. Long press or separate 'info' mode?
                        // Let's stick to "Top opens Sheet with 'Select' button" for better UX on pricing check.
                    }}>
                        {content}
                    </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="dark bg-neutral-950 border-neutral-800 text-white rounded-t-[20px]">
                    <SheetHeader className="mb-6">
                        <SheetTitle>Seat Details</SheetTitle>
                    </SheetHeader>
                    <SeatDetails />
                    <SheetFooter className="mt-8">
                        <Button 
                            className={cn("w-full h-12 text-base", isSelected ? "bg-red-600 hover:bg-red-700" : "bg-sky-600 hover:bg-sky-700")}
                            disabled={isOccupied || isTakenByOther}
                            onClick={() => onClick()}
                        >
                            {isSelected ? "Deselect Seat" : "Select Seat"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={onClick}
                        disabled={isOccupied || isTakenByOther}
                        className={baseClasses}
                    >
                         {content}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-neutral-950/95 backdrop-blur-xl border-neutral-800 text-white min-w-[250px] p-5 shadow-2xl rounded-xl">
                    <SeatDetails />
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

