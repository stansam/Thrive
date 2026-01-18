import { Check, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminBookingTimelineProps {
    status: string;
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

export function AdminBookingTimeline({ status }: AdminBookingTimelineProps) {
    // Simplified logic mapping from status string to step index
    // This mirrors the client logic but could be expanded for Admin overrides
    let currentStepIndex = 0;

    switch (status) {
        case "Quote Requested": currentStepIndex = 0; break;
        case "Quote Prepared":
        case "Awaiting Service Fee": currentStepIndex = 1; break;
        case "Processing Tickets": currentStepIndex = 3; break;
        case "Awaiting Airline Payment": currentStepIndex = 4; break;
        case "Airline Payment Confirmed": currentStepIndex = 5; break;
        case "Ticketing in Progress": currentStepIndex = 6; break;
        case "Tickets Issued":
        case "Booking Confirmed": currentStepIndex = 7; break;
        default: currentStepIndex = 0;
    }

    return (
        <div className="w-full bg-card border rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Booking Lifecycle</h3>
            <div className="relative flex justify-between">
                {/* Line */}
                <div className="absolute top-3 left-0 w-full h-0.5 bg-muted -z-0" />
                <div
                    className="absolute top-3 left-0 h-0.5 bg-primary transition-all duration-500 -z-0"
                    style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                        <div key={idx} className="flex flex-col items-center gap-2 group relative cursor-pointer">
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center border-2 bg-background z-10 transition-colors",
                                isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                    isCurrent ? "border-primary text-primary" :
                                        "border-muted text-muted-foreground group-hover:border-primary/50"
                            )}>
                                {isCompleted ? <Check className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                            </div>

                            <span className={cn(
                                "text-[10px] text-center font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute top-7 w-24 bg-popover text-popover-foreground p-1 rounded shadow-sm border",
                                isCurrent && "opacity-100 text-primary font-bold"
                            )}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 flex justify-between text-sm">
                <div className="text-muted-foreground">
                    Current Stage: <span className="font-medium text-foreground">{STEPS[currentStepIndex]}</span>
                </div>
                {/* Admin controls could go here like "Advance Step" */}
            </div>
        </div>
    );
}
