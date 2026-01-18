import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, ShieldAlert } from "lucide-react";

export function PassengerInfoCard({ passengers }: { passengers: any[] }) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg">Passengers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {passengers.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="bg-background p-2 rounded-full border">
                                <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{p.full_name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    {p.passenger_type || "Adult"}
                                    {!p.passport_number && (
                                        <span className="text-orange-500 flex items-center ml-2">
                                            <ShieldAlert className="h-3 w-3 mr-0.5" /> Missing Passport
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
