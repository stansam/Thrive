"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, Loader2, Plane, Users, X } from "lucide-react";
import { useBookingApi } from "@/lib/hooks/use-booking-api";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";

// Stepper Components
const steps = [
    { number: 1, title: "Traveler Info" },
    { number: 2, title: "Trip Details" },
    { number: 3, title: "Review" }
];

const formSchema = z.object({
    firstName: z.string().min(2, "Name required"),
    lastName: z.string().min(2, "Last name required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone required"),
    country: z.string().min(2, "Country required"),

    startDate: z.date(),
    numAdults: z.string().refine((v) => parseInt(v) >= 1, { message: "At least 1 adult" }),
    numChildren: z.string(),
    numInfants: z.string(),
    specialRequests: z.string(),
    addFlights: z.boolean()
});

interface BookingWizardProps {
    pkg: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BookingWizard({ pkg, open, onOpenChange }: BookingWizardProps) {
    const [step, setStep] = React.useState(1);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [bookingRef, setBookingRef] = React.useState("");

    const router = useRouter();
    const { toast } = useToast();

    // Use string type for form handling to avoid RHF/Zod transform conflicts
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            country: "",
            numAdults: "2",
            numChildren: "0",
            numInfants: "0",
            specialRequests: "",
            addFlights: false
        },
    });

    const { submitBookingRequest } = useBookingApi();

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            const payload = {
                packageId: pkg.id,
                ...values,
                numAdults: parseInt(values.numAdults),
                numChildren: parseInt(values.numChildren || "0"),
                numInfants: parseInt(values.numInfants || "0"),
                startDate: values.startDate.toISOString(),
            };

            const response = await submitBookingRequest(payload);

            if (response.data) {
                setBookingRef(response.data.booking.booking_reference);
                setIsSuccess(true);
                toast({
                    title: "Request Received",
                    description: "We have received your booking request.",
                });
            }
        } catch (error: any) {
            console.error("Booking error:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: error.message || "Please check your network connection."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = async () => {
        // Validate fields for current step
        let fieldsToValidate: any[] = [];
        if (step === 1) fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'country'];
        if (step === 2) fieldsToValidate = ['startDate', 'numAdults', 'numChildren'];

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    if (isSuccess) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px] border-emerald-500/20 bg-neutral-950 text-white">
                    <div className="flex flex-col items-center text-center p-6 space-y-6">
                        <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Request Received!</h2>
                            <p className="text-neutral-400">
                                Thank you for choosing Thrive. Your booking reference is <span className="text-emerald-400 font-mono">{bookingRef}</span>.
                            </p>
                        </div>
                        <div className="bg-neutral-900 p-4 rounded-lg w-full text-sm text-neutral-300 border border-white/10">
                            <p>Our concierge team is reviewing your request. You will receive a confirmation email shortly with final details and payment instructions.</p>
                        </div>
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => onOpenChange(false)}
                        >
                            Back to Trip
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] border-white/10 bg-neutral-950 text-white p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="p-6 pb-2 bg-neutral-900/50 border-b border-white/5">
                    <DialogTitle className="flex justify-between items-center">
                        <span>Request Booking</span>
                        <span className="text-sm font-normal text-cyan-400">{pkg.name}</span>
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-4">
                        {steps.map((s, i) => (
                            <div key={s.number} className="flex items-center">
                                <div className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300",
                                    step >= s.number ? "bg-emerald-600 text-white" : "bg-neutral-800 text-neutral-500"
                                )}>
                                    {step > s.number ? <CheckCircle2 className="w-5 h-5" /> : s.number}
                                </div>
                                <span className={cn(
                                    "ml-2 text-sm font-medium hidden sm:block",
                                    step >= s.number ? "text-white" : "text-neutral-600"
                                )}>{s.title}</span>
                                {i < steps.length - 1 && (
                                    <div className={cn("w-8 h-[2px] mx-2", step > s.number ? "bg-emerald-600" : "bg-neutral-800")} />
                                )}
                            </div>
                        ))}
                    </div>
                </DialogHeader>

                <div className="p-6 overflow-y-auto flex-1">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* STEP 1: TRAVELER INFO */}
                            {step === 1 && (
                                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John" className="bg-neutral-900 border-white/10" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Doe" className="bg-neutral-900 border-white/10" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="john@example.com" className="bg-neutral-900 border-white/10" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone (WhatsApp)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+1 234 567 890" className="bg-neutral-900 border-white/10" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="country"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Residence Country</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="USA" className="bg-neutral-900 border-white/10" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: TRIP DETAILS */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Preferred Start Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal bg-neutral-900 border-white/10 hover:bg-neutral-800",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 bg-neutral-900 border-white/10" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => date < new Date()}
                                                            initialFocus
                                                            className="text-white bg-neutral-950"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="numAdults"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Adults</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="1" className="bg-neutral-900 border-white/10" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="numChildren"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Children</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" className="bg-neutral-900 border-white/10" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="numInfants"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Infants</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" className="bg-neutral-900 border-white/10" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="specialRequests"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Special Requests (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Dietary requirements, accessibility needs, anniversaries..."
                                                        className="bg-neutral-900 border-white/10 min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* STEP 3: REVIEW */}
                            {step === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-4 space-y-3">
                                        <h3 className="font-bold text-emerald-400">Request Overview</h3>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm text-neutral-300">
                                            <span>Package:</span>
                                            <span className="font-medium text-white">{pkg.name}</span>

                                            <span>Dates:</span>
                                            <span className="font-medium text-white">
                                                {form.getValues('startDate') ? format(form.getValues('startDate'), 'MMM dd, yyyy') : '-'}
                                                {' '}({pkg.duration_days} Days)
                                            </span>

                                            <span>Travelers:</span>
                                            <span className="font-medium text-white">
                                                {form.getValues('numAdults')} Adults, {form.getValues('numChildren')} Kids
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex gap-3 items-start">
                                        <div className="mt-1"><Plane className="h-4 w-4 text-blue-400" /></div>
                                        <div className="text-sm">
                                            <p className="font-bold text-blue-400 mb-1">Estimated Price: ${pkg.starting_price.toLocaleString()}+</p>
                                            <p className="text-neutral-400">
                                                This is a preliminary estimate. Our concierge will review availability and send you a final confirmed price and payment link globally.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </Form>
                </div>

                <div className="p-6 border-t border-white/10 bg-neutral-900/50 flex justify-between">
                    {step > 1 ? (
                        <Button type="button" variant="outline" onClick={prevStep} className="border-white/10 hover:bg-white/5">
                            Back
                        </Button>
                    ) : (
                        <div /> // Spacer
                    )}

                    {step < 3 ? (
                        <Button type="button" onClick={nextStep} className="bg-emerald-600 hover:bg-emerald-700">
                            Next Step
                        </Button>
                    ) : (
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px]"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Submit Request"}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
