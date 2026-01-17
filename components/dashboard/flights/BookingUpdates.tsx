import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

interface ActivityLogItem {
    message: string;
    created_at: string;
}

interface BookingUpdatesProps {
    activityLog: ActivityLogItem[];
}

export function BookingUpdates({ activityLog }: BookingUpdatesProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
                {!activityLog || activityLog.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No recent activity.</div>
                ) : (
                    <div className="relative pl-4 border-l border-muted space-y-6">
                        {activityLog.map((log, idx) => (
                            <div key={idx} className="relative">
                                {/* Dot */}
                                <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-muted-foreground/30 border-2 border-background" />

                                <p className="text-sm font-medium">{log.message}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(log.created_at).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
