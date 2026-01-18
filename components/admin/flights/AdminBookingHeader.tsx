import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    AlertTriangle,
    Copy,
    FileText,
    Upload,
    Ban,
    User,
    Mail
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminBookingHeaderProps {
    booking: any; // Using loose type for speed, ideally proper interface
    onRefresh: () => void;
}

export function AdminBookingHeader({ booking, onRefresh }: AdminBookingHeaderProps) {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard" });
    };

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'tickets issued': return 'default';
            case 'booking confirmed': return 'default'; // if success variant exists
            case 'cancelled': return 'destructive';
            case 'quote requested': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <Card className="shadow-md border-t-4 border-t-primary mb-6">
            <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">

                {/* Left: Identity */}
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            {booking.booking_reference}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground"
                                onClick={() => copyToClipboard(booking.booking_reference)}
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                        </h1>
                        <Badge variant={getStatusVariant(booking.status)} className="uppercase">
                            {booking.status}
                        </Badge>
                        {booking.is_urgent && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Urgent
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{booking.user?.full_name || "Unknown User"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="select-all">{booking.user?.email}</span>
                        </div>
                        {booking.assigned_agent && (
                            <div className="pl-4 border-l">
                                <span className="text-xs">Agent: </span>
                                <span className="font-medium text-foreground">{booking.assigned_agent.name}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap gap-2 justify-end">
                    {/* These buttons would toggle modals or trigger APIs in a real flow */}
                    {booking.status === 'quote requested' && (
                        <Button size="sm">
                            <FileText className="mr-2 h-4 w-4" /> Prepare Quote
                        </Button>
                    )}

                    <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" /> Service Invoice
                    </Button>

                    <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" /> Airline Invoice
                    </Button>

                    <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" /> Upload Tickets
                    </Button>

                    {(booking.status !== 'cancelled' && booking.status !== 'completed') && (
                        <Button variant="destructive" size="sm" className="ml-2">
                            <Ban className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}
