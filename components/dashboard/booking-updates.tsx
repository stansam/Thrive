import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AlertTriangle, Bell, CheckCircle2, Info, Mail } from "lucide-react";

interface BookingUpdate {
    id: string;
    type: string;
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
}

interface BookingUpdatesProps {
    updates: BookingUpdate[];
    className?: string;
}

export function BookingUpdates({ updates, className }: BookingUpdatesProps) {
    if (!updates || updates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mb-2 opacity-50" />
                <p>No activity updates yet.</p>
            </div>
        );
    }

    const getIcon = (type: string) => {
        if (type.includes('error') || type.includes('alert') || type.includes('cancelled')) return <AlertTriangle className="w-4 h-4 text-red-500" />;
        if (type.includes('success') || type.includes('confirmed') || type.includes('paid')) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        if (type.includes('email') || type.includes('message')) return <Mail className="w-4 h-4 text-blue-500" />;
        return <Info className="w-4 h-4 text-sky-500" />;
    };

    return (
        <ScrollArea className={cn("h-[400px] w-full rounded-md border p-4", className)}>
            <div className="space-y-4">
                {updates.map((update) => (
                    <div key={update.id} className="flex gap-4 items-start pb-4 border-b last:border-0 last:pb-0">
                        <div className="mt-1 flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                {getIcon(update.type)}
                            </div>
                        </div>
                        <div className="grid gap-1">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold leading-none">{update.title}</h4>
                                {!update.is_read && (
                                    <span className="flex h-2 w-2 rounded-full bg-sky-500" />
                                )}
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {update.message}
                            </p>
                            <span className="text-xs text-neutral-400">
                                {new Date(update.created_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
