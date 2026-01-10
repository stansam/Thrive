import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, ArrowRight, Clock, Calendar } from "lucide-react";

interface FlightSegment {
    id: string;
    departure: {
        iataCode: string;
        at: string; // ISO string
        terminal?: string;
    };
    arrival: {
        iataCode: string;
        at: string; // ISO string
        terminal?: string;
    };
    carrierCode: string;
    number: string;
    aircraft?: {
        code: string;
    };
    duration: string;
    airlineName?: string;
    airlineLogo?: string;
}

interface FlightItineraryProps {
    segments: FlightSegment[];
}

// Helper to parse duration "PT8H40M" -> "8h 40m"
const formatDuration = (ptDuration: string) => {
    // Basic parser for PT format
    if (!ptDuration) return "";
    const hours = ptDuration.match(/(\d+)H/)?.[1] || "0";
    const minutes = ptDuration.match(/(\d+)M/)?.[1] || "0";
    return `${hours}h ${minutes}m`;
};

const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

export function FlightItineraryConfirmation({ segments }: FlightItineraryProps) {
    if (!segments || segments.length === 0) return null;

    return (
        <Card className="bg-neutral-900/50 border-neutral-800 text-white">
            <CardHeader className="pb-3 border-b border-neutral-800">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Plane className="h-4 w-4 text-neutral-400" />
                    Flight Itinerary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {segments.map((segment, index) => (
                    <div key={segment.id} className="relative">
                        {/* Connecting Line */}
                        {index < segments.length - 1 && (
                            <div className="absolute left-[19px] top-10 bottom-[-24px] w-[2px] bg-neutral-800" />
                        )}

                        <div className="flex gap-4">
                            {/* Airline Logo Placeholder */}
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 z-10 border border-neutral-700">
                                {segment.airlineLogo ? (
                                    <img src={segment.airlineLogo} alt="Airline" className="h-6 w-6 object-contain" />
                                ) : (
                                    <Plane className="h-5 w-5 text-black" />
                                )}
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex flex-col md:flex-row gap-4 md:items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{segment.airlineName || segment.carrierCode} {segment.number}</h4>
                                        <p className="text-xs text-neutral-500">Aircraft: {segment.aircraft?.code}</p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">
                                            {formatDuration(segment.duration)}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Departure & Arrival */}
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <div className="flex gap-4 items-start">
                                        <div className="mr-4 w-14 md:w-16 text-right font-mono text-base md:text-lg">{formatTime(segment.departure.at)}</div>
                                        <div className="relative pt-1 flex flex-col gap-1">
                                            <div className="h-3 w-3 rounded-full bg-neutral-600 absolute left-[-22px] md:left-[-23px] top-[6px] md:top-[7px] border-2 border-neutral-900" />
                                            <div className="font-bold flex flex-wrap items-center gap-2">
                                                {segment.departure.iataCode}
                                                <span className="text-xs font-normal text-neutral-400">{formatDate(segment.departure.at)}</span>
                                            </div>
                                            <div className="text-sm text-neutral-400">
                                                {segment.departure.terminal && `Terminal ${segment.departure.terminal}`}
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-neutral-400 shrink-0 hidden md:block" />
                                    <div className="flex gap-4 items-start">
                                        <div className="mr-4 w-14 md:w-16 text-right font-mono text-base md:text-lg">{formatTime(segment.arrival.at)}</div>
                                        <div className="relative pt-1 flex flex-col gap-1">
                                            <div className="h-3 w-3 rounded-full bg-white absolute left-[-22px] md:left-[-23px] top-[6px] md:top-[7px] border-2 border-neutral-900" />
                                            <div className="font-bold flex flex-wrap items-center gap-2">
                                                {segment.arrival.iataCode}
                                                <span className="text-xs font-normal text-neutral-400">{formatDate(segment.arrival.at)}</span>
                                            </div>
                                            <div className="text-sm text-neutral-400">
                                                {segment.arrival.terminal && `Terminal ${segment.arrival.terminal}`}
                                            </div>
                                        </div>
                                    </div>
                                    {/* </div> */}
                                </div>

                                {/* Duration / Flight Time Indicator */}
                                {/* <div className="pl-16 md:pl-20 py-1 text-xs text-neutral-500 flex items-center gap-2">
                                    <Clock className="h-3 w-3" /> Flight time: {formatDuration(segment.duration)}
                                </div> */}

                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
