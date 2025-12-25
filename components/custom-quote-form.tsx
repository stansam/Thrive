'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function CustomQuoteForm({ className }: { className?: string }) {
    const [clientType, setClientType] = React.useState("individual")

    return (
        <Card className={cn("w-[400px] p-6 bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-2xl", className)}>
            <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-2 text-center">Request Quote</h2>

                {/* Row 1: Radio Buttons */}
                <RadioGroup defaultValue="individual" onValueChange={setClientType} className="flex justify-center space-x-4 mb-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="r1" className="border-white text-white" />
                        <Label htmlFor="r1" className="text-neutral-300">Individual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="corporate" id="r2" className="border-white text-white" />
                        <Label htmlFor="r2" className="text-neutral-300">Corporate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="group" id="r3" className="border-white text-white" />
                        <Label htmlFor="r3" className="text-neutral-300">Group</Label>
                    </div>
                </RadioGroup>

                {/* Extra Row: Number of People (Conditional) */}
                {clientType === 'group' && (
                    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2">
                        <Label htmlFor="people" className="text-xs text-neutral-400">Number of People</Label>
                        <Input id="people" type="number" placeholder="Total group size" className="bg-black/50 border-white/10" />
                    </div>
                )}

                {/* Row 2: From / To */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="q-from" className="text-xs text-neutral-400">From</Label>
                        <Input id="q-from" placeholder="Origin" className="bg-black/50 border-white/10" />
                    </div>
                    <div>
                        <Label htmlFor="q-to" className="text-xs text-neutral-400">To</Label>
                        <Input id="q-to" placeholder="Destination" className="bg-black/50 border-white/10" />
                    </div>
                </div>

                {/* Row 3: Dates & Budget */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="dates" className="text-xs text-neutral-400">Dates</Label>
                        <Input id="dates" placeholder="Jan-Feb" className="bg-black/50 border-white/10" />
                    </div>
                    <div>
                        <Label htmlFor="budget" className="text-xs text-neutral-400">Budget</Label>
                        <Input id="budget" placeholder="$1k - $5k" className="bg-black/50 border-white/10" />
                    </div>
                </div>

                {/* Row 4: Description */}
                <div>
                    <Label htmlFor="desc" className="text-xs text-neutral-400">Description</Label>
                    <Textarea id="desc" placeholder="Additional details..." className="bg-black/50 border-white/10 min-h-[60px]" />
                </div>

                <Button className="w-full bg-white text-black hover:bg-neutral-200">
                    Request Quote
                </Button>
            </div>
        </Card>
    )
}
