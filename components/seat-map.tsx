'use client';

import React, { useState, useEffect } from 'react';
import { FlightOffer } from '@/lib/types/flight';
import { flightService } from '@/services/flight-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Armchair } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SeatMapProps {
    flightOffer: FlightOffer;
    travelers: any[];
    onSeatsSelected: (selections: { [travelerId: string]: string }) => void;
    onSkip?: () => void;
}

interface Seat {
    number: string;
    cabin: string;
    status: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED';
    characteristics?: string[];
    price?: { amount: string; currency: string };
    coordinates?: { x: number; y: number };
}

interface Deck {
    deckType: string; // 'MAIN', 'UPPER', etc.
    seats: Seat[];
    width: number;
    length: number;
    warnings?: any[]; // Exit row warnings etc
}

export function SeatMap({ flightOffer, travelers, onSeatsSelected, onSkip }: SeatMapProps) {
    const [loading, setLoading] = useState(true);
    const [seatMaps, setSeatMaps] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<{ [segmentAndTraveler: string]: string }>({});
    // Key: `${segmentIndex}-${travelerIndex}`, Value: SeatNumber
    // Note: To simplify for MVP, we might just do picking 1 seat per traveler per segment?
    // Actually per requirement: "flight booking flow completed thanks to POST method... choose his seat"

    // Complex seat selection logic:
    // We usually need to select seats for EACH segment for EACH traveler.

    const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0);
    const [currentTravelerIdx, setCurrentTravelerIdx] = useState(0);

    useEffect(() => {
        const fetchSeatMap = async () => {
            try {
                const response = await flightService.getSeatMap(flightOffer);
                if (response.success) {
                    setSeatMaps(response.data);
                } else {
                    setError('Could not load seat map.');
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
        if (seat.status !== 'AVAILABLE') return;

        const key = `${currentSegmentIdx}-${currentTravelerIdx}`;

        // Toggle if already selected
        if (selectedSeats[key] === seat.number) {
            const newSeats = { ...selectedSeats };
            delete newSeats[key];
            setSelectedSeats(newSeats);
            updateParent(newSeats);
        } else {
            // Select
            const newSeats = { ...selectedSeats, [key]: seat.number };
            setSelectedSeats(newSeats);
            updateParent(newSeats);
        }
    };

    const updateParent = (selections: any) => {
        // Transform internal key `${seg}-${trav}` to props format if needed.
        // Requirements say "Capture selected seat numbers per traveler".
        // We'll pass the raw map for now or simplify.
        // Let's create a simplified map: travelerId -> "1A, 2B" (comma joined if multi-segment)
        // or just pass the rich object.

        const simplified: { [travelerId: string]: string } = {};
        travelers.forEach((t, tIdx) => {
            const seats = [];
            for (let sIdx = 0; sIdx < (flightOffer.itineraries[0]?.segments.length || 0); sIdx++) {
                // Check if return trip? Itineraries > 1
                // Amadeus SeatMap usually returns seatmaps for all segments in order.
                // We need to map `seatMaps` array index to itineraries/segments.
            }
            // For MVP, simply passing the internal state up might be confusing.
            // Let's just pass the map { travelerIndex: "12A" } for single segment or handle multi-segment later.

            // Actually, let's just pass a string summary for the traveler
            const travelerSeats = Object.entries(selections)
                .filter(([k]) => k.endsWith(`-${tIdx}`))
                .map(([_, val]) => val)
                .join(', ');

            if (travelerSeats) {
                simplified[t.id || tIdx.toString()] = travelerSeats;
            }
        });

        onSeatsSelected(simplified);
    };

    const currentSeatMap = seatMaps[currentSegmentIdx];

    // Auto-advance traveler logic could go here

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-sky-500" /></div>;
    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-sky-500" /></div>;

    // EDGE CASE: If error or no seat map data, allow user to skip
    if (error || !seatMaps.length) {
        return (
            <Card className="bg-neutral-900 border-neutral-800 text-white">
                <CardHeader>
                    <CardTitle className="text-amber-500 flex items-center gap-2">
                        <Armchair className="h-5 w-5" />
                        Seat Selection Unavailable
                    </CardTitle>
                    <CardDescription className="text-neutral-400">
                        We couldn't retrieve the seat map for this flight. This happens occasionally with certain airlines or last-minute bookings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-neutral-300">
                        Don't worry! You can still proceed with your booking request.
                        Our team will secure the best available seats for you, or you can request specific preferences (Window/Aisle) in the next steps.
                    </p>
                    <div className="flex justify-end pt-4">
                        {/* If parent doesn't provide onSkip, we can't do much but show message. 
                             However, based on BookingWizard logic, we might need a button here 
                             Use a placeholder button if handler not provided? */}
                        {onSkip ? (
                            <Button onClick={onSkip} className="bg-sky-600 hover:bg-sky-700 text-white">
                                Continue without Seats
                            </Button>
                        ) : (
                            <div className="text-xs text-neutral-500">Please go back or contact support if this persists.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Helper to render grid
    // Amadeus SeatMap response structure is complex (decks, wings, etc).
    // We will do a generic visualizer based on rows/columns if possible, or just a list if strictly text.
    // "SeatMap Display API that allows you to get information to display airplane cabin plan"
    // The response has `decks` with `seats` having `coordinates` (x,y) usually.

    return (
        <Card className="bg-neutral-900 border-neutral-800 text-white">
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <span>Select Seats</span>
                    <span className="text-sm font-normal text-neutral-400">
                        {flightOffer.itineraries[0].segments[currentSegmentIdx]?.departure?.iataCode} -&gt; {flightOffer.itineraries[0].segments[currentSegmentIdx]?.arrival?.iataCode}
                    </span>
                </CardTitle>
                <CardDescription>
                    Select a seat for <strong>{travelers[currentTravelerIdx]?.firstName || `Traveler ${currentTravelerIdx + 1}`}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Segment Selector */}
                {seatMaps.length > 1 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {seatMaps.map((_, idx) => {
                            const seg = flightOffer.itineraries.flat().flatMap(it => it.segments)[idx];
                            return (
                                <Button
                                    key={idx}
                                    variant={currentSegmentIdx === idx ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentSegmentIdx(idx)}
                                    className={currentSegmentIdx === idx ? "bg-sky-600 hover:bg-sky-700" : "border-neutral-700 text-neutral-300"}
                                >
                                    {seg?.departure?.iataCode}-{seg?.arrival?.iataCode}
                                </Button>
                            );
                        })}
                    </div>
                )}

                {/* Traveler Selector */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {travelers.map((t, idx) => (
                        <Button
                            key={idx}
                            variant={currentTravelerIdx === idx ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentTravelerIdx(idx)}
                            className={currentTravelerIdx === idx ? "bg-white text-black" : "text-neutral-400 hover:text-white"}
                        >
                            {t.firstName || `Traveler ${idx + 1}`}
                            {selectedSeats[`${currentSegmentIdx}-${idx}`] && (
                                <span className="ml-2 bg-green-500/20 text-green-500 text-xs px-1 rounded">
                                    {selectedSeats[`${currentSegmentIdx}-${idx}`]}
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                <ScrollArea className="h-[400px] w-full rounded-md border border-neutral-800 bg-neutral-950/50 p-4">
                    <div className="flex flex-col items-center gap-2 relative">
                        {/* Simple Grid Renderer based on "number" (Row/Letter) or coordinates if valid */}
                        {/* Fallback to simple list if coordinates missing */}
                        {renderDeck(currentSeatMap?.decks?.[0], selectedSeats, currentSegmentIdx, currentTravelerIdx, handleSeatClick)}
                    </div>
                </ScrollArea>

                <div className="mt-4 flex gap-4 text-xs text-neutral-400 justify-center">
                    <div className="flex items-center gap-1"><div className="w-4 h-4 bg-neutral-800 border border-neutral-600 rounded" /> Available</div>
                    <div className="flex items-center gap-1"><div className="w-4 h-4 bg-sky-600 rounded" /> Selected</div>
                    <div className="flex items-center gap-1"><div className="w-4 h-4 bg-neutral-800 opacity-30 cursor-not-allowed" /> Occupied</div>
                </div>

            </CardContent>
        </Card>
    );
}

function renderDeck(deck: any, selectedSeats: any, segIdx: number, travIdx: number, onSelect: any) {
    if (!deck) return <div className="text-neutral-500">No deck info</div>;

    // Sort seats by coordinates if available, else by number logic
    // Coordinates: x (column), y (row) usually. 
    // If coordinates missing, we can't easily draw a map without parsing "12A".

    // Let's group by Row (Y coordinate)
    const rows: { [y: number]: Seat[] } = {};
    deck.seats.forEach((seat: Seat) => {
        const y = seat.coordinates?.y || parseInt(seat.number) || 0; // Fallback paring
        if (!rows[y]) rows[y] = [];
        rows[y].push(seat);
    });

    return Object.entries(rows).sort(([a], [b]) => Number(a) - Number(b)).map(([y, seats]) => (
        <div key={y} className="flex gap-2 mb-2 items-center">
            {/* Row Number Label (approx) */}
            <div className="w-6 text-center text-xs text-neutral-600">{y}</div>

            {/* Render Seats in this row, sorted by X */}
            {seats
                .sort((a, b) => (a.coordinates?.x || 0) - (b.coordinates?.x || 0))
                .map(seat => {
                    const isSelected = selectedSeats[`${segIdx}-${travIdx}`] === seat.number;
                    const isOccupied = seat.status === 'OCCUPIED' || seat.status === 'BLOCKED';
                    const isOtherTraveler = Object.entries(selectedSeats).some(([k, v]) => k.startsWith(`${segIdx}-`) && k !== `${segIdx}-${travIdx}` && v === seat.number);

                    return (
                        <TooltipProvider key={seat.number}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        disabled={isOccupied || isOtherTraveler}
                                        onClick={() => onSelect(seat)}
                                        className={`
                                            w-8 h-8 rounded-t-lg rounded-b-md flex items-center justify-center text-[10px] font-bold transition-all
                                            ${isSelected ? 'bg-sky-600 text-white shadow-[0_0_10px_rgba(2,132,199,0.5)]' : ''}
                                            ${isOccupied ? 'bg-neutral-800/30 text-neutral-700 cursor-not-allowed' : ''}
                                            ${!isSelected && !isOccupied && !isOtherTraveler ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700' : ''}
                                            ${isOtherTraveler ? 'bg-purple-900/50 text-purple-400 cursor-not-allowed border border-purple-800' : ''}
                                        `}
                                    >
                                        {seat.number.replace(/\d+/g, '')}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black border-neutral-800 text-white text-xs">
                                    <p>Seat {seat.number}</p>
                                    <p>{seat.cabin}</p>
                                    {seat.price && <p>{seat.price.amount} {seat.price.currency}</p>}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
        </div>
    ));
}
