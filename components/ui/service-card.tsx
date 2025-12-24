import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface ServiceCardProps {
    title: string
    description: string
    icon: LucideIcon
    className?: string
}

export function ServiceCard({
    title,
    description,
    icon: Icon,
    className
}: ServiceCardProps) {
    return (
        <div
            className={cn(
                "flex flex-col rounded-lg border-t",
                "bg-gradient-to-b from-neutral-800/80 to-neutral-900/40 backdrop-blur-sm",
                "p-6 text-start",
                "hover:from-neutral-800 hover:to-neutral-900/60",
                "w-[300px] shrink-0 border-white/10",
                "transition-colors duration-300",
                className
            )}
        >
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-white/10 text-white">
                    <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white leading-tight">
                    {title}
                </h3>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
                {description}
            </p>
        </div>
    )
}
