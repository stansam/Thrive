import { cn } from "@/lib/utils"
import { ServiceCard } from "@/components/ui/service-card"
import { LucideIcon } from "lucide-react"

interface ServicesMarqueeProps {
    title: string
    description: string
    services: Array<{
        title: string
        description: string
        icon: LucideIcon
    }>
    className?: string
}

export function ServicesMarquee({
    title,
    description,
    services,
    className
}: ServicesMarqueeProps) {
    return (
        <section
            id="services"
            className={cn(
                "bg-black text-white",
                "py-24 px-0",
                className
            )}>
            <div className="mx-auto flex w-full flex-col items-center gap-16">
                <div className="flex flex-col items-center gap-4 px-4 text-center">
                    <h2 className="max-w-[720px] text-3xl font-bold leading-tight sm:text-5xl">
                        {title}
                    </h2>
                    <p className="text-lg max-w-[600px] text-neutral-400">
                        {description}
                    </p>
                </div>

                <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
                    {/* Marquee Container */}
                    <div className="group flex overflow-hidden p-4 [--gap:1rem] [gap:var(--gap)] flex-row w-full [--duration:40s]">
                        <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused] min-w-full">
                            {[...Array(2)].map((_, setIndex) => (
                                services.map((service, i) => (
                                    <ServiceCard
                                        key={`${setIndex}-${i}`}
                                        {...service}
                                    />
                                ))
                            ))}
                        </div>
                        {/* Duplicate for seamless loop */}
                        <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused] min-w-full" aria-hidden="true">
                            {[...Array(2)].map((_, setIndex) => (
                                services.map((service, i) => (
                                    <ServiceCard
                                        key={`duplicate-${setIndex}-${i}`}
                                        {...service}
                                    />
                                ))
                            ))}
                        </div>
                    </div>

                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-black to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-black to-transparent z-10" />
                </div>
            </div>
        </section>
    )
}
