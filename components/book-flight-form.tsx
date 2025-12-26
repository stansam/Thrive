'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { MapPin, Minus, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function BookFlightForm({ className }: { className?: string }) {
    const [adults, setAdults] = React.useState(1)
    const [children, setChildren] = React.useState(0)

    // Mock airports for dropdown
    const airports = ["San Francisco (SFO)", "New York (JFK)", "London (LHR)", "Tokyo (HND)", "Dubai (DXB)"]

    const [showFromDropdown, setShowFromDropdown] = React.useState(false)
    const [showToDropdown, setShowToDropdown] = React.useState(false)
    const [fromValue, setFromValue] = React.useState("")
    const [toValue, setToValue] = React.useState("")

    return (
        <Card className={cn("w-[400px] p-6 bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-2xl", className)}>
            <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-center">Book Your Flight</h2>

                {/* Row 1: From / To */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                        <Label htmlFor="from" className="text-xs text-neutral-400">From</Label>
                        <div className="relative">
                            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
                            <Input
                                id="from"
                                placeholder="Origin"
                                className="pl-8 bg-black/50 border-white/10 focus:border-white/30"
                                value={fromValue}
                                onChange={(e) => {
                                    setFromValue(e.target.value)
                                    setShowFromDropdown(true)
                                }}
                                onFocus={() => setShowFromDropdown(true)}
                                onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
                            />
                        </div>
                        {showFromDropdown && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-neutral-900 border border-white/10 rounded-md z-50 overflow-hidden">
                                {airports.filter(a => a.toLowerCase().includes(fromValue.toLowerCase())).map((airport) => (
                                    <div
                                        key={airport}
                                        className="p-2 text-sm hover:bg-white/10 cursor-pointer"
                                        onClick={() => {
                                            setFromValue(airport)
                                            setShowFromDropdown(false)
                                        }}
                                    >
                                        {airport}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative group">
                        <Label htmlFor="to" className="text-xs text-neutral-400">To</Label>
                        <div className="relative">
                            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
                            <Input
                                id="to"
                                placeholder="Destination"
                                className="pl-8 bg-black/50 border-white/10 focus:border-white/30"
                                value={toValue}
                                onChange={(e) => {
                                    setToValue(e.target.value)
                                    setShowToDropdown(true)
                                }}
                                onFocus={() => setShowToDropdown(true)}
                                onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
                            />
                        </div>
                        {showToDropdown && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-neutral-900 border border-white/10 rounded-md z-50 overflow-hidden">
                                {airports.filter(a => a.toLowerCase().includes(toValue.toLowerCase())).map((airport) => (
                                    <div
                                        key={airport}
                                        className="p-2 text-sm hover:bg-white/10 cursor-pointer"
                                        onClick={() => {
                                            setToValue(airport)
                                            setShowToDropdown(false)
                                        }}
                                    >
                                        {airport}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Row 2: Passengers & Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                        <Label className="text-xs text-neutral-400">Passengers</Label>
                        <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-md p-1 px-2">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-neutral-500">Adults</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="text-neutral-400 hover:text-white"><Minus size={12} /></button>
                                    <span className="text-sm font-medium w-3 text-center">{adults}</span>
                                    <button onClick={() => setAdults(adults + 1)} className="text-neutral-400 hover:text-white"><Plus size={12} /></button>
                                </div>
                            </div>
                            <div className="w-[1px] h-6 bg-white/10"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-neutral-500">Children</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="text-neutral-400 hover:text-white"><Minus size={12} /></button>
                                    <span className="text-sm font-medium w-3 text-center">{children}</span>
                                    <button onClick={() => setChildren(children + 1)} className="text-neutral-400 hover:text-white"><Plus size={12} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="date" className="text-xs text-neutral-400">Departure</Label>
                        <Input
                            id="date"
                            defaultValue="25 June, 2025"
                            className="bg-black/50 border-white/10 focus:border-white/30 text-center"
                        />
                    </div>
                </div>

                <Link href="/flights/results" passHref>
                    <Button className="w-full bg-white text-black hover:bg-neutral-200 mt-2">
                        <Search className="mr-2 h-4 w-4" /> Search Flights
                    </Button>
                </Link>
            </div>
        </Card>
    )
}
