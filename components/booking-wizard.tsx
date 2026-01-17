'use client';

import React, { useState, useEffect } from 'react';
import { flightService } from '@/services/flight-service';
import { FlightOffer, TravelerInfo, TravelerType } from '@/lib/types/flight';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, AlertCircle, Plane, Armchair, User, ChevronRight, FileSearch, Send, Info } from 'lucide-react';
import { PassportScanner, ScannedPassportData } from './passport-scanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { FlightItineraryConfirmation } from '@/components/flight-itinerary-confirmation';
import { DatePicker } from '@/components/ui/date-picker';
import { SeatMap } from './seat-map';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface BookingWizardProps {
    flightOffer: FlightOffer;
    user: any; // User context
    dictionaries?: any;
}

type WizardStep = 'review' | 'seats' | 'travelers' | 'summary' | 'success';

function parseISODate(value?: string): Date | undefined {
    if (!value) return undefined
    const date = new Date(value)
    return isNaN(date.getTime()) ? undefined : date
}

function formatISODate(date?: Date): string {
    if (!date) return ""
    return date.toISOString().split("T")[0]
}

export function BookingWizard({ flightOffer, user, dictionaries }: BookingWizardProps) {
    const [currentStep, setCurrentStep] = useState<WizardStep>('review');
    const [travelers, setTravelers] = useState<TravelerInfo[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<{ [travelerId: string]: string }>({});
    // Map traveler Id (e.g., '1') -> Seat Summary String (e.g. "12A")
    // NOTE: Traveler IDs in flightOffer are usually '1', '2' etc.

    // We maintain a local traveler state. Initially populated on mount.

    const { toast } = useToast();
    const router = useRouter();

    // Initialize travelers based on flight offer requirements (adults, children, etc.)
    useEffect(() => {
        if (travelers.length === 0) {
            // We need to match the travelerPricings in offer
            const initialTravelers: TravelerInfo[] = (flightOffer.travelerPricings || []).map((tp) => ({
                id: tp.travelerId,
                travelerType: tp.travelerType as TravelerType,
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                gender: 'MALE',
                email: tp.travelerId === '1' ? (user?.email || '') : '', // Only first user gets email by default
                phone: { countryCode: '1', number: tp.travelerId === '1' ? (user?.phone || '') : '' }
            }));

            if (initialTravelers.length === 0) {
                // Fallback
                initialTravelers.push({
                    id: '1',
                    travelerType: 'ADULT',
                    firstName: '',
                    lastName: '',
                    dateOfBirth: '',
                    gender: 'MALE',
                    email: user?.email || '',
                    phone: { countryCode: '1', number: user?.phone || '' }
                });
            }

            setTravelers(initialTravelers);
        }
    }, [flightOffer, user]);

    // --- STEP LOGIC ---

    const handleTravelerUpdate = (index: number, field: keyof TravelerInfo, value: any) => {
        const updated = [...travelers];
        updated[index] = { ...updated[index], [field]: value };
        setTravelers(updated);
    };

    const handleSeatSelection = (selections: { [travelerId: string]: string }) => {
        // selections keys are internal index based? Or travelerId?
        // SeatMap component emits { "1": "12A", "2": "14B" } where keys are traveler IDs.
        setSelectedSeats(selections);
    };

    const handlePassportScan = (index: number, data: ScannedPassportData) => {
        const updated = [...travelers];
        const gender: 'MALE' | 'FEMALE' = (data.gender === 'FEMALE') ? 'FEMALE' : 'MALE';

        updated[index] = {
            ...updated[index],
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.birthDate,
            gender: gender,
            documents: [{
                documentType: 'PASSPORT',
                number: data.passportNumber,
                expiryDate: data.expirationDate,
                issuanceCountry: data.nationality,
                nationality: data.nationality,
                holder: true
            }]
        };
        setTravelers(updated);
        toast({
            title: "Passport Scanned",
            description: `Details for ${data.firstName} ${data.lastName} updated.`,
        });
    };

    const submitBookingRequest = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            // Validate travelers
            const invalid = travelers.find(t => !t.firstName || !t.lastName || !t.dateOfBirth);
            if (invalid) {
                throw new Error("Please fill in all traveler details.");
            }

            // Merge selected seats into traveler info or separate
            // We'll attach selectedSeats to each traveler object for backend
            const travelersWithSeats = travelers.map(t => ({
                ...t,
                selectedSeats: selectedSeats[t.id || '1'] // Backend expects this key now
            }));

            const request = {
                flightOffers: [flightOffer],
                travelers: travelersWithSeats,
                specialRequests: "" // Add special requests field later if needed
            };

            const response = await flightService.createBooking(request);

            if (!response.success) {
                throw new Error(response.message || 'Request failed');
            }

            setCurrentStep('success');

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to submit booking request.");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- RENDER HELPERS ---

    const steps = [
        { id: 'review', label: 'Flight', icon: Plane },
        { id: 'seats', label: 'Seats', icon: Armchair },
        { id: 'travelers', label: 'Travelers', icon: User },
        { id: 'summary', label: 'Summary', icon: FileSearch },
        { id: 'success', label: 'Done', icon: Send },
    ];

    const currentStepIdx = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="max-w-5xl mx-auto p-3 md:p-4 space-y-6">

            {/* Progress Bar */}
            <div className="w-full bg-neutral-900/50 rounded-full h-2 mb-8 relative overflow-hidden">
                <div
                    className="bg-sky-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
                />
            </div>

            <div className="flex justify-between px-2 mb-8 -mt-6">
                {steps.map((s, idx) => (
                    <div key={s.id} className={`flex flex-col items-center gap-1 ${idx <= currentStepIdx ? 'text-sky-400' : 'text-neutral-600'}`}>
                        <div className={`p-2 rounded-full border-2 ${idx <= currentStepIdx ? 'border-sky-500 bg-sky-950' : 'border-neutral-800 bg-neutral-900'}`}>
                            <s.icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium hidden md:block">{s.label}</span>
                    </div>
                ))}
            </div>

            {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-white mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* STEP 1: REVIEW */}
            {currentStep === 'review' && (
                <div className="space-y-6">
                    <Card className="bg-neutral-900 border-neutral-800 text-white">
                        <CardHeader>
                            <CardTitle>Review Flight Details</CardTitle>
                            <CardDescription className="text-neutral-400">Confirm your itinerary before proceeding.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {flightOffer.itineraries.map((itinerary, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="text-sm text-neutral-400 font-medium">
                                        {idx === 0 ? 'Outbound' : 'Return'} • {itinerary.duration ? itinerary.duration.replace('PT', '').toLowerCase() : ''}
                                    </div>
                                    <FlightItineraryConfirmation
                                        segments={itinerary.segments.map(seg => ({
                                            ...seg,
                                            airlineName: dictionaries?.carriers?.[seg.carrierCode] || seg.carrierCode,
                                            airlineLogo: `https://pic.al/8.png`
                                        }))}
                                    />
                                </div>
                            ))}
                            <div className="flex justify-between items-center bg-neutral-800/50 p-4 rounded-lg border border-neutral-800">
                                <div>
                                    <p className="text-sm text-neutral-400">Estimated Total</p>
                                    <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: flightOffer.price?.currency || 'USD' }).format(parseFloat(flightOffer.price?.total || '0'))}
                                    </p>
                                </div>
                                <div className="text-right text-xs text-neutral-500">
                                    Includes taxes & fees<br />
                                    Subject to availability
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end pt-4 border-t border-neutral-800">
                            <Button onClick={() => setCurrentStep('seats')} className="bg-white text-black hover:bg-neutral-200 min-w-[150px]">
                                Select Seats <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* STEP 2: SEATS */}
            {currentStep === 'seats' && (
                <div className="space-y-6">
                    <SeatMap
                        flightOffer={flightOffer}
                        travelers={travelers}
                        onSeatsSelected={handleSeatSelection}
                        onSkip={() => setCurrentStep('travelers')}
                    />
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep('review')} className="border-neutral-700 text-neutral-300">
                            Back
                        </Button>
                        <Button onClick={() => setCurrentStep('travelers')} className="bg-white text-black hover:bg-neutral-200 min-w-[150px]">
                            Add Traveler Info <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 3: TRAVELERS */}
            {currentStep === 'travelers' && (
                <div className="space-y-6">
                    {travelers.map((traveler, idx) => (
                        <Card key={idx} className="bg-neutral-900 border-neutral-800">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center text-white">
                                    <span>Traveler {idx + 1} ({traveler.travelerType})</span>
                                    {selectedSeats[traveler.id || '1'] && (
                                        <span className="text-sm font-normal text-sky-400 bg-sky-950/50 px-2 py-1 rounded border border-sky-900">
                                            Seat: {selectedSeats[traveler.id || '1']}
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <PassportScanner
                                    onScanComplete={(data) => handlePassportScan(idx, data)}
                                    onError={(msg) => toast({ title: "OCR Error", description: msg, variant: "destructive" })}
                                />
                                <Separator className="bg-neutral-800" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 text-white">
                                        <Label>First Name</Label>
                                        <Input
                                            value={traveler.firstName}
                                            onChange={(e) => handleTravelerUpdate(idx, 'firstName', e.target.value)}
                                            className="bg-black/50 border-neutral-700"
                                            placeholder="As on passport"
                                        />
                                    </div>
                                    <div className="space-y-2 text-white">
                                        <Label>Last Name</Label>
                                        <Input
                                            value={traveler.lastName}
                                            onChange={(e) => handleTravelerUpdate(idx, 'lastName', e.target.value)}
                                            className="bg-black/50 border-neutral-700"
                                            placeholder="As on passport"
                                        />
                                    </div>
                                    <div className="space-y-2 text-white">
                                        <Label>Date of Birth</Label>
                                        <DatePicker
                                            date={parseISODate(traveler.dateOfBirth)}
                                            setDate={(date) =>
                                                handleTravelerUpdate(idx, "dateOfBirth", formatISODate(date))
                                            }
                                            className="bg-black/50 border-neutral-700 text-white h-10"
                                        />
                                    </div>
                                    <div className="space-y-2 text-white">
                                        <Label>Gender</Label>
                                        <select
                                            className="w-full h-10 rounded-md border border-neutral-700 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                                            value={traveler.gender}
                                            onChange={(e) => handleTravelerUpdate(idx, 'gender', e.target.value as 'MALE' | 'FEMALE')}
                                        >
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                        </select>
                                    </div>
                                    {idx === 0 && (
                                        <>
                                            <div className="space-y-2 text-white">
                                                <Label>Contact Email</Label>
                                                <Input
                                                    value={traveler.email}
                                                    onChange={(e) => handleTravelerUpdate(idx, 'email', e.target.value)}
                                                    className="bg-black/50 border-neutral-700"
                                                />
                                            </div>
                                            <div className="space-y-2 text-white">
                                                <Label>Contact Phone</Label>
                                                <Input
                                                    value={traveler.phone.number}
                                                    onChange={(e) => handleTravelerUpdate(idx, 'phone', { ...traveler.phone, number: e.target.value })}
                                                    className="bg-black/50 border-neutral-700"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setCurrentStep('seats')} className="border-neutral-700 text-neutral-300">
                            Back
                        </Button>
                        <Button onClick={() => setCurrentStep('summary')} className="bg-white text-black hover:bg-neutral-200 min-w-[150px]">
                            Review Summary <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 4: SUMMARY */}
            {currentStep === 'summary' && (
                <div className="space-y-6">
                    <Card className="bg-neutral-900 border-neutral-800 text-white">
                        <CardHeader>
                            <CardTitle>Final Review</CardTitle>
                            <CardDescription>Please check all details before submitting your request.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Accordion type="single" collapsible className="w-full border-neutral-800" defaultValue="item-1">
                                <AccordionItem value="item-1" className="border-neutral-800">
                                    <AccordionTrigger className="text-white hover:no-underline hover:text-sky-400">Flight Details</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="pl-4 border-l-2 border-neutral-700">
                                            {flightOffer.itineraries.map((it, idx) => (
                                                <div key={idx} className="mb-2">
                                                    <p className="text-xs text-neutral-500 font-bold uppercase">{idx === 0 ? "Outbound" : "Inbound"}</p>
                                                    <p className="text-sm">
                                                        {it.segments[0].departure.iataCode} → {it.segments[it.segments.length - 1].arrival.iataCode}
                                                    </p>
                                                    <p className="text-xs text-neutral-400">{it.duration?.replace('PT', '').toLowerCase()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-2" className="border-neutral-800">
                                    <AccordionTrigger className="text-white hover:no-underline hover:text-sky-400">Travelers & Seats</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-3 pl-4 border-l-2 border-neutral-700">
                                            {travelers.map((t, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm">
                                                    <div>
                                                        <span className="text-white block font-medium">{t.firstName} {t.lastName || '(Name Pending)'}</span>
                                                        <span className="text-neutral-500 text-xs">{t.travelerType}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        {selectedSeats[t.id || ''] ? (
                                                            <span className="text-sky-400 font-mono bg-sky-950/30 px-2 py-1 rounded">Seat: {selectedSeats[t.id || '']}</span>
                                                        ) : (
                                                            <span className="text-neutral-600 text-xs italic">No seat selected</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-3" className="border-neutral-800">
                                    <AccordionTrigger className="text-white hover:no-underline hover:text-sky-400">Price Estimate</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="bg-neutral-800/30 p-4 rounded text-sm space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-400">Base</span>
                                                <span>{flightOffer.price?.base} {flightOffer.price?.currency}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-400">Fees & Taxes</span>
                                                <span>{(parseFloat(flightOffer.price?.total || '0') - parseFloat(flightOffer.price?.base || '0')).toFixed(2)} {flightOffer.price?.currency}</span>
                                            </div>
                                            <Separator className="bg-neutral-700" />
                                            <div className="flex justify-between font-bold text-lg text-white">
                                                <span>Total</span>
                                                <span>{flightOffer.price?.total} {flightOffer.price?.currency}</span>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <Alert className="bg-yellow-900/10 border-yellow-900/30 text-yellow-100">
                                <Info className="h-4 w-4 text-yellow-400" />
                                <AlertTitle className="text-yellow-300">Important</AlertTitle>
                                <AlertDescription className="text-yellow-200/80 text-xs mt-1">
                                    Submitting this request does not guarantee the fare.
                                    Our agents will review your request, confirm availability, and send an invoice for payment.
                                    Tickets are issued only after payment is received.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-4 border-t border-neutral-800">
                            <Button variant="outline" onClick={() => setCurrentStep('travelers')} className="border-neutral-700 text-neutral-300">
                                Back
                            </Button>
                            <Button
                                onClick={submitBookingRequest}
                                disabled={isProcessing}
                                className="bg-sky-600 hover:bg-sky-700 text-white min-w-[200px]"
                            >
                                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Submit Request
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* STEP 5: SUCCESS (REQUEST SUBMITTED) */}
            {currentStep === 'success' && (
                <Card className="bg-neutral-900 border-neutral-800 text-center py-12">
                    <div className="flex justify-center mb-6">
                        <div className="h-24 w-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl mb-2 text-white">Request Submitted!</CardTitle>
                    <CardDescription className="text-lg text-neutral-400 mb-8">
                        Your flight booking request has been received.
                    </CardDescription>

                    <div className="max-w-md mx-auto p-6 bg-neutral-800/50 rounded-lg text-left mb-8 space-y-4">
                        <h4 className="font-semibold text-white text-center mb-4 border-b border-neutral-700 pb-2">What happens next?</h4>
                        <div className="flex gap-4 items-start">
                            <div className="h-6 w-6 rounded-full bg-neutral-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                            <div>
                                <p className="text-white text-sm font-medium">Admin Review</p>
                                <p className="text-xs text-neutral-400">Our team will verify availability and price.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="h-6 w-6 rounded-full bg-neutral-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                            <div>
                                <p className="text-white text-sm font-medium">Invoice Sent</p>
                                <p className="text-xs text-neutral-400">You will receive an invoice via email/dashboard.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="h-6 w-6 rounded-full bg-neutral-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                            <div>
                                <p className="text-white text-sm font-medium">Ticket Issued</p>
                                <p className="text-xs text-neutral-400">Once paid, we issue your tickets immediately.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button onClick={() => router.push('/dashboard')} className="bg-white text-black hover:bg-neutral-200">
                            Go to Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/')} className="border-neutral-700 text-neutral-300">
                            Back Home
                        </Button>
                    </div>
                </Card>
            )}

        </div>
    );
}

// Removing ClientSecretWrapper and PaymentForm components as they are no longer used in this flow.
