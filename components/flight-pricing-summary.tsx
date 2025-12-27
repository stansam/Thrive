import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Lock } from "lucide-react";

interface PricingItem {
    label: string;
    amount: number;
    highlight?: boolean;
}

import { TravelerData } from "@/components/traveler-details-form";

interface FlightPricingSummaryProps {
    baseFare: number;
    taxes: number;
    fees: number;
    currency?: string;
    onProceed?: () => void;
    travelerDetails?: TravelerData;
}

export function FlightPricingSummary({
    baseFare,
    taxes,
    fees,
    currency = "USD",
    onProceed,
    travelerDetails
}: FlightPricingSummaryProps) {
    const total = baseFare + taxes + fees;

    return (
        <Card className="bg-neutral-900/50 border-neutral-800 text-white sticky top-24">
            <CardHeader>
                <CardTitle className="text-xl">Price Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {travelerDetails && (travelerDetails.firstName || travelerDetails.lastName) && (
                    <div className="mb-4 p-3 bg-neutral-800 rounded-md text-sm border border-neutral-700">
                        <p className="text-neutral-400 text-xs mb-1">Traveler</p>
                        <p className="font-semibold">{travelerDetails.firstName} {travelerDetails.lastName}</p>
                        <p className="text-xs text-neutral-500">{travelerDetails.email}</p>
                    </div>
                )}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-neutral-400">
                        <span>Base Fare</span>
                        <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(baseFare)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                        <span>Taxes & Surcharges</span>
                        <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(taxes)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                        <span>Fees</span>
                        <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(fees)}</span>
                    </div>
                </div>

                <Separator className="bg-neutral-800" />

                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-neutral-400 text-xs">Total Amount</span>
                        <p className="text-2xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
                <Button onClick={onProceed} className="w-full bg-white text-black hover:bg-neutral-200">
                    Confirm & Book <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                    <Lock className="h-3 w-3" /> Secure Payment
                </div>
            </CardFooter>
        </Card>
    );
}
