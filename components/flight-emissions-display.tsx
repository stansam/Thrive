import { Card, CardContent } from "@/components/ui/card";
import { Leaf } from "lucide-react";

interface FlightEmissionsDisplayProps {
    co2Amount: string; // e.g., "145 kg"
    comparison?: string; // e.g., "-12% vs average"
}

export function FlightEmissionsDisplay({ co2Amount, comparison }: FlightEmissionsDisplayProps) {
    return (
        <Card className="bg-green-950/20 border-green-900 text-green-100">
            <CardContent className="flex items-center gap-4 py-4">
                <div className="h-10 w-10 rounded-full bg-green-900/50 flex items-center justify-center text-green-400">
                    <Leaf className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-sm text-green-400">Estimated CO2 Emissions</h4>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{co2Amount}</span>
                        {comparison && (
                            <span className="text-xs text-green-500 bg-green-900/30 px-2 py-0.5 rounded-full">
                                {comparison}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-green-300/60 mt-1">Calculated based on aircraft type, distance, and cabin class.</p>
                </div>
            </CardContent>
        </Card>
    );
}
