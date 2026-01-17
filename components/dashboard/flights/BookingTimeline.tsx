import { cn } from "@/lib/utils";
import { Check, Circle, Clock } from "lucide-react";

interface BookingTimelineProps {
    status: string;
    className?: string;
}

const STEPS = [
    "Booking Requested",
    "Quote Prepared",
    "Service Fee Invoice Sent",
    "Service Fee Paid",
    "Airline Invoice Sent",
    "Airline Payment Confirmed",
    "Ticketing in Progress",
    "Tickets Issued"
];

export function BookingTimeline({ status, className }: BookingTimelineProps) {
    // Determine current step index based on status label coming from backend
    // "Processing Tickets" -> Service Fee Paid (Step 3 completed -> index 3)
    let currentStepIndex = 0;

    switch (status) {
        case "Quote Requested":
            currentStepIndex = 0;
            break;
        case "Quote Prepared":
        case "Awaiting Service Fee":
            currentStepIndex = 1;
            break;
        case "Processing Tickets": // Service Fee Paid
            currentStepIndex = 3;
            break;
        case "Awaiting Airline Payment":
            currentStepIndex = 4;
            break;
        case "Airline Payment Confirmed":
            currentStepIndex = 5;
            break;
        case "Ticketing in Progress":
            currentStepIndex = 6;
            break;
        case "Tickets Issued":
        case "Booking Confirmed": // Fallback if confirmed but not yet ticketed logic matches
            currentStepIndex = 7;
            break;
        case "Cancelled":
            currentStepIndex = -1; // Special handling?
            break;
        default:
            currentStepIndex = 0;
    }

    if (status === "Cancelled") {
        return (
            <div className={cn("w-full py-6", className)}>
                <div className="bg-destructive/10 text-destructive p-4 rounded-md text-center font-semibold">
                    This booking has been cancelled.
                </div>
            </div>
        );
    }

    return (
        <div className={cn("w-full py-6 overflow-x-auto", className)}>
            <div className="min-w-[800px] relative">
                {/* Progress Line */}
                <div className="absolute top-4 left-0 w-full h-1 bg-neutral-100 dark:bg-neutral-800 -z-0" />
                <div
                    className="absolute top-4 left-0 h-1 bg-primary transition-all duration-500 -z-0"
                    style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                />

                <div className="flex justify-between relative z-10">
                    {STEPS.map((step, idx) => {
                        const isCompleted = idx < currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        const isFuture = idx > currentStepIndex;

                        return (
                            <div key={step} className="flex flex-col items-center gap-2 w-24">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 bg-background transition-all",
                                    isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                        isCurrent ? "border-primary bg-background text-primary animate-pulse" :
                                            "border-muted bg-muted/30 text-muted-foreground"
                                )}>
                                    {isCompleted ? <Check className="w-4 h-4" /> :
                                        isCurrent ? <Clock className="w-4 h-4" /> :
                                            <Circle className="w-3 h-3" />}
                                </div>
                                <span className={cn(
                                    "text-[10px] text-center font-medium leading-tight",
                                    isCurrent ? "text-primary" :
                                        isCompleted ? "text-foreground" :
                                            "text-muted-foreground"
                                )}>
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
