"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { BookingInquiryModal } from "./booking-inquiry-modal";
import { cn } from "@/lib/utils";

interface StickyBookBarProps {
    pkg: {
        id: string;
        name: string;
        starting_price: number;
    };
    className?: string;
}

export function StickyBookBar({ pkg, className }: StickyBookBarProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <div className={cn(
                "fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-white/10 p-4 lg:hidden safe-area-bottom",
                className
            )}>
                <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
                    <div className="flex flex-col">
                        <span className="text-xs text-neutral-400 uppercase tracking-wider">Starting From</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-white">${pkg.starting_price.toLocaleString()}</span>
                            <span className="text-xs text-neutral-400">/ person</span>
                        </div>
                    </div>

                    <Button
                        onClick={() => setOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 shadow-lg shadow-emerald-900/50"
                    >
                        Check Availability
                    </Button>
                </div>
            </div>

            <BookingInquiryModal
                pkg={pkg}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    );
}
