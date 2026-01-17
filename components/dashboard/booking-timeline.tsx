import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, CreditCard, FileText, Send } from "lucide-react";

interface BookingTimelineProps {
    status: string;
    timeline: {
        requestedAt?: string;
        reviewedAt?: string;
        invoicedAt?: string;
        paidAt?: string;
        ticketedAt?: string;
    };
    className?: string;
}

export function BookingTimeline({ status, timeline, className }: BookingTimelineProps) {
    const steps = [
        { id: 'requested', label: 'Requested', icon: Send, date: timeline.requestedAt },
        { id: 'reviewed', label: 'In Review', icon: Clock, date: timeline.reviewedAt },
        { id: 'invoiced', label: 'Invoice Sent', icon: FileText, date: timeline.invoicedAt },
        { id: 'paid', label: 'Paid', icon: CreditCard, date: timeline.paidAt },
        { id: 'ticketed', label: 'Ticketed', icon: CheckCircle2, date: timeline.ticketedAt },
    ];

    // Determine current step index based on status or last available date
    // This logic can be refined based on strict status mapping
    let currentStepIdx = 0;
    const s = status.toLowerCase();

    if (s === 'requested') currentStepIdx = 0;
    else if (s === 'pending_payment' || timeline.invoicedAt) currentStepIdx = 2; // Paid/Invoiced
    else if (s === 'confirmed' || timeline.ticketedAt) currentStepIdx = 4;
    else if (timeline.paidAt) currentStepIdx = 3;

    // Override if status says "cancelled" -> maybe show red? 
    // For now, assume happy path progress logic

    return (
        <div className={cn("w-full py-4", className)}>
            <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-neutral-200 dark:bg-neutral-800 -z-0" />
                <div
                    className="absolute top-5 left-0 h-1 bg-sky-500 transition-all duration-500 -z-0"
                    style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 z-10 bg-background px-2">
                            <div
                                className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                                    isCurrent ? "border-sky-500 bg-sky-500 text-white shadow-lg shadow-sky-500/20" :
                                        isCompleted ? "border-sky-500 bg-background text-sky-500" :
                                            "border-neutral-200 dark:border-neutral-800 bg-background text-neutral-400"
                                )}
                            >
                                <step.icon className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                                <p className={cn(
                                    "text-xs font-semibold",
                                    isCompleted ? "text-foreground" : "text-muted-foreground"
                                )}>
                                    {step.label}
                                </p>
                                {step.date && (
                                    <p className="text-[10px] text-muted-foreground">
                                        {new Date(step.date).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
