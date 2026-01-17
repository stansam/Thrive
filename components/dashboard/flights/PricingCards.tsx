import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PricingItem {
    amount: number;
    currency: string;
    status: "PAID" | "UNPAID";
    invoice_url?: string | null;
    payment_link?: string | null;
}

interface PricingCardsProps {
    serviceFee: PricingItem;
    airlineFare: PricingItem;
}

export function PricingCards({ serviceFee, airlineFare }: PricingCardsProps) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Service Fee Card */}
            <Card className="flex flex-col h-full border-l-4 border-l-orange-400">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-medium text-muted-foreground">
                            Service Fee
                        </CardTitle>
                        <Badge variant={serviceFee.status === 'PAID' ? 'outline' : 'destructive'}>
                            {serviceFee.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="text-3xl font-bold">
                        {serviceFee.currency} {serviceFee.amount.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Payable to Thrive Global Travel & Tours
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-4 border-t">
                    {serviceFee.status === 'UNPAID' && serviceFee.payment_link ? (
                        <Button className="w-full" asChild>
                            <Link href={serviceFee.payment_link}>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay Service Fee
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground" disabled>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Payment Completed
                        </Button>
                    )}

                    {serviceFee.invoice_url && (
                        <Button variant="outline" className="w-full" asChild disabled={!serviceFee.invoice_url}>
                            <a href={serviceFee.invoice_url || "#"} target="_blank" rel="noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Download Invoice
                            </a>
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Airline Fare Card */}
            <Card className="flex flex-col h-full border-l-4 border-l-sky-500">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-medium text-muted-foreground">
                            Airline Fare & Taxes
                        </CardTitle>
                        <Badge variant={airlineFare.status === 'PAID' ? 'outline' : 'destructive'}>
                            {airlineFare.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="text-3xl font-bold">
                        {airlineFare.currency} {airlineFare.amount.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Payable directly to Airline / Consolidator
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-4 border-t">
                    {airlineFare.status === 'UNPAID' && airlineFare.payment_link ? (
                        <Button className="w-full" variant="secondary" asChild>
                            <Link href={airlineFare.payment_link}>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay Airline Fare
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground" disabled>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Payment Completed
                        </Button>
                    )}

                    {airlineFare.invoice_url && (
                        <Button variant="outline" className="w-full" asChild disabled={!airlineFare.invoice_url}>
                            <a href={airlineFare.invoice_url || "#"} target="_blank" rel="noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Download Receipt
                            </a>
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
