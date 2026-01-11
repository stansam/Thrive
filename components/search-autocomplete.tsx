'use client'

import * as React from "react"
import { Search, Loader2, MapPin, Calendar, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"
import axios from "axios"

interface SearchAutocompleteProps {
    className?: string
    placeholder?: string
    onSelect?: (value: string) => void
}

export function SearchAutocomplete({
    className,
    placeholder = "Search for trips, destinations...",
    onSelect
}: SearchAutocompleteProps) {
    const [query, setQuery] = React.useState("")
    const [data, setData] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()
    const [isOpen, setIsOpen] = React.useState(false)

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 1) {
                setLoading(true)
                setIsOpen(true)
                try {
                    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/packages/search?q=${query}&per_page=5`)
                    if (res.data?.data?.items) {
                        setData(res.data.data.items)
                    } else {
                        setData([])
                    }
                } catch (error) {
                    console.error("Search error", error)
                    setData([])
                } finally {
                    setLoading(false)
                }
            } else {
                setData([])
                setIsOpen(false)
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [query])

    const handleSelect = (item: any) => {
        // Navigate to package detail
        setIsOpen(false)
        if (onSelect) {
            onSelect(item.name)
        } else {
            router.push(`/trip/${item.slug}`)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (query.trim()) {
                setIsOpen(false)
                router.push(`/trips/results?q=${encodeURIComponent(query)}`)
            }
        }
    }

    return (
        <div className={cn("relative w-full z-50", className)}>
            <Command
                shouldFilter={false}
                className="rounded-lg border border-white/20 bg-black/50 overflow-visible backdrop-blur-sm"
            >
                <div className="flex items-center border-b border-white/10 px-3" cmdk-input-wrapper="">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-white" />
                    <CommandInput
                        placeholder={placeholder}
                        value={query}
                        onValueChange={setQuery}
                        onKeyDown={handleKeyDown}
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-neutral-400 text-white disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0"
                    />
                </div>

                {isOpen && (
                    <div className="absolute top-[calc(100%+4px)] left-0 w-full rounded-md border border-white/10 bg-black/90 shadow-2xl overflow-hidden z-[60]">
                        <CommandList>
                            {loading && (
                                <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                                </div>
                            )}

                            {!loading && data.length === 0 && query.length > 1 && (
                                <CommandEmpty className="py-6 text-center text-sm text-neutral-400">
                                    No trips found. Press Enter to see all results.
                                </CommandEmpty>
                            )}

                            {!loading && data.length > 0 && (
                                <CommandGroup heading="Suggestions" className="text-neutral-400">
                                    {data.map((item) => (
                                        <CommandItem
                                            key={item.id}
                                            value={item.id} // value must be unique for cmdk
                                            onSelect={() => handleSelect(item)}
                                            className="cursor-pointer aria-selected:bg-white/10 text-white flex flex-col items-start gap-1 py-3"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-medium text-base">{item.name}</span>
                                                <span className="text-xs text-emerald-400 font-bold">${item.starting_price}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {item.destination_city}, {item.destination_country}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {item.duration_days} Days
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </div>
                )}
            </Command>
        </div>
    )
}
