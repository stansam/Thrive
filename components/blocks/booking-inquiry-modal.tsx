"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Users, CheckCircle2, Loader2, Plane } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface BookingInquiryModalProps {
    pkg: {
        id: string;
        name: string;
        starting_price: number;
    };
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function BookingInquiryModal({ pkg, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: BookingInquiryModalProps) {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date>();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const { toast } = useToast();

    // Handle controlled vs uncontrolled state
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : open;
    const onOpenChange = isControlled ? setControlledOpen : setOpen;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            toast({
                title: "Inquiry Sent!",
                description: "Our concierge team will contact you shortly.",
            });
        }, 1500);
    };

    const resetForm = () => {
        setIsSuccess(false);
        setDate(undefined);
        if (onOpenChange) onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px] bg-neutral-900 border-neutral-800 text-white">
                {!isSuccess ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Request Availability</DialogTitle>
                            <DialogDescription className="text-neutral-400">
                                Interested in <strong>{pkg.name}</strong>? Fill out the form below and our concierge team will confirm dates and pricing for you.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" placeholder="Jane" required className="bg-black/50 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" placeholder="Doe" required className="bg-black/50 border-white/10" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="jane@example.com" required className="bg-black/50 border-white/10" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="block">Preferred Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal bg-black/50 border-white/10 hover:bg-white/5 hover:text-white",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-neutral-900 border-neutral-800" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                                disabled={(date) => date < new Date()}
                                                className="bg-neutral-900 text-white"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="guests">Travelers</Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                                        <Input id="guests" type="number" min="1" defaultValue="2" className="pl-9 bg-black/50 border-white/10" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Special Requests / Questions</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="I'm interested in..."
                                    className="bg-black/50 border-white/10 min-h-[100px]"
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Plane className="mr-2 h-4 w-4" /> Request Booking Info
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>

                            <p className="text-xs text-center text-neutral-500">
                                *No payment required today. We will confirm availability first.
                            </p>
                        </form>
                    </>
                ) : (
                    <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">Request Received!</h3>
                            <p className="text-neutral-400 max-w-xs mx-auto">
                                Thank you for your interest in <strong>{pkg.name}</strong>. One of our travel experts will reach out to you within 24 hours.
                            </p>
                        </div>
                        <Button onClick={resetForm} variant="outline" className="border-white/20 text-white hover:bg-white/10 mt-6">
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
