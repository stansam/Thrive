import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Upload, CreditCard, CheckCircle } from "lucide-react";

interface InvoicePanelProps {
    invoices: any[]; // Using loose type
}

export function InvoicePanel({ invoices }: InvoicePanelProps) {
    const serviceFeeInv = invoices.find((i: any) => i.type === 'SERVICE_FEE');
    const airlineFareInv = invoices.find((i: any) => i.type === 'AIRLINE_FARE');

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Service Fee Management */}
            <Card className="border-l-4 border-l-orange-400">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">Service Fee Invoice</CardTitle>
                    <Badge variant={serviceFeeInv?.status === 'PAID' ? 'default' : 'outline'}>
                        {serviceFeeInv?.status || 'NOT ISSUED'}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-lg">{serviceFeeInv?.currency} {serviceFeeInv?.amount?.toFixed(2)}</span>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                            <Upload className="mr-2 h-4 w-4" /> Upload Custom Invoice
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                            <Download className="mr-2 h-4 w-4" /> Preview Current Invoice
                        </Button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <Label htmlFor="sf-paid" className="text-sm">Mark as Paid</Label>
                        <Switch id="sf-paid" checked={serviceFeeInv?.status === 'PAID'} />
                    </div>
                </CardContent>
            </Card>

            {/* Airline Fare Management */}
            <Card className="border-l-4 border-l-sky-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">Airline Fare Invoice</CardTitle>
                    <Badge variant={airlineFareInv?.status === 'PAID' ? 'default' : 'outline'}>
                        {airlineFareInv?.status || 'NOT ISSUED'}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-lg">{airlineFareInv?.currency} {airlineFareInv?.amount?.toFixed(2)}</span>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                            <Upload className="mr-2 h-4 w-4" /> Upload Receipt / Invoice
                        </Button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <Label htmlFor="air-paid" className="text-sm">Confirm Payment</Label>
                        <Switch id="air-paid" checked={airlineFareInv?.status === 'PAID'} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
