"use client";

import * as React from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { MapPin, CalendarDays, Coffee, Moon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Day {
    day: number;
    title: string;
    description: string;
}

interface PackageItineraryProps {
    itinerary: Day[];
}

export function PackageItinerary({ itinerary }: PackageItineraryProps) {
    if (!itinerary || itinerary.length === 0) {
        return <div className="text-neutral-400 italic">No itinerary details available yet.</div>;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
                <CalendarDays className="w-6 h-6 text-emerald-500" />
                Day-by-Day Itinerary
            </h3>

            <Accordion type="single" collapsible className="w-full space-y-4">
                {itinerary.map((item, index) => (
                    <AccordionItem
                        key={index}
                        value={`day-${item.day}`}
                        className="bg-neutral-900/50 border border-white/5 rounded-xl px-4 overflow-hidden"
                    >
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-4 text-left">
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none shrink-0 h-8 w-16 flex justify-center text-sm font-bold">
                                    Day {item.day}
                                </Badge>
                                <span className="font-semibold text-lg text-white/90">{item.title}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6">
                            <div className="pl-20 pr-4 text-neutral-300 leading-relaxed space-y-4">
                                <p>{item.description}</p>
                                {/* Future: Can add structured meal/activity icons here if data supported it */}
                                {/* Sample structured data visualization */}
                                {/* <div className="flex gap-4 pt-2 text-sm text-neutral-500">
                                    <div className="flex items-center gap-1"><Coffee className="w-4 h-4" /> Breakfast Included</div>
                                    <div className="flex items-center gap-1"><Moon className="w-4 h-4" /> Hotel Stay</div>
                                </div> */}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
