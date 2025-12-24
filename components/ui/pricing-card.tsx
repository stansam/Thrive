import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
    title: string;
    price: string;
    description: string;
    features: string[];
    highlight?: boolean;
    highlightLabel?: string;
    buttonVariant?: "default" | "outline";
}

export function PricingCard({
    title,
    price,
    description,
    features,
    highlight = false,
    buttonVariant = "outline",
}: PricingCardProps) {
    return (
        <div
            className={cn(
                "flex flex-col justify-between p-6 space-y-4 rounded-xl border transition-all duration-300",
                highlight
                    ? "bg-secondary/10 border-white/20 scale-105 shadow-xl shadow-white/5"
                    : "bg-black/50 border-neutral-800 hover:border-neutral-700"
            )}
        >
            <div className={highlight ? "grid gap-6" : ""}>
                <div className="space-y-4">
                    <div>
                        <h2 className="font-medium text-neutral-200">{title}</h2>
                        <span className="my-3 block text-2xl font-semibold text-white">{price}</span>
                        <p className="text-muted-foreground text-sm">{description}</p>
                    </div>

                    <Button asChild className="w-full" variant={buttonVariant}>
                        <Link href="">Get Started</Link>
                    </Button>
                </div>
            </div>

            {highlight && (
                <div>
                    <div className="text-sm font-medium text-white">Everything in Silver, plus:</div>
                </div>
            )}

            <ul className={cn(
                "list-outside space-y-3 text-sm text-neutral-300",
                highlight ? "mt-4" : "border-t border-neutral-800 pt-4"
            )}>
                {features.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                        <Check className="size-3 text-green-500" />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
