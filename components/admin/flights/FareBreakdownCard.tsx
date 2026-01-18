import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit2, Save } from "lucide-react";
import { useState } from "react";

export function FareBreakdownCard({ pricing }: { pricing: any }) {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Financial Breakdown</CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Base Fare</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-sm">$</span>
                            <Input
                                defaultValue={pricing.base_price}
                                disabled={!isEditing}
                                className="pl-6"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Taxes</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-sm">$</span>
                            <Input
                                defaultValue={pricing.taxes}
                                disabled={!isEditing}
                                className="pl-6"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Service Fee</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-sm">$</span>
                            <Input
                                defaultValue={pricing.service_fee}
                                disabled={!isEditing}
                                className="pl-6 font-semibold"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Discount</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-sm">$</span>
                            <Input
                                defaultValue={pricing.discount}
                                disabled={!isEditing}
                                className="pl-6 text-green-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t flex justify-between items-center bg-muted/20 p-4 rounded-lg">
                    <span className="font-medium">Total Price</span>
                    <span className="text-xl font-bold">${pricing.total_price.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
