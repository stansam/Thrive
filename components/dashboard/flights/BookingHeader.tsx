import { Plane, Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface BookingHeaderProps {
    bookingReference: string;
    status: string;
    airlineName: string;
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string | null;
}

export function BookingHeader({
    bookingReference,
    status,
    airlineName,
    origin,
    destination,
    departureDate,
    returnDate
}: BookingHeaderProps) {
    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'tickets issued':
            case 'booking confirmed':
                return 'default'; // primary/blue
            case 'cancelled':
                return 'destructive';
            case 'quote requested':
            case 'quote prepared':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <Card className="w-full border-l-4 border-l-primary shadow-sm">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Plane className="w-4 h-4" />
                            <span>{airlineName}</span>
                            <span>•</span>
                            <span className="font-mono">{bookingReference}</span>
                        </div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {origin} <span className="text-muted-foreground">→</span> {destination}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(departureDate).toLocaleDateString()}</span>
                            </div>
                            {returnDate && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>Return: {new Date(returnDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant={getStatusVariant(status)} className="px-3 py-1 text-sm">
                            {status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                            Status updated just now
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
