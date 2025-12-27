"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date?: Date
    setDate?: (date: Date | undefined) => void
    defaultDate?: Date
    className?: string
    placeholder?: string
}

export function DatePicker({ date, setDate, defaultDate, className, placeholder = "Pick a date" }: DatePickerProps) {
    // If controlled (date provided), use it. If not, manage local state initialized with defaultDate.
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(defaultDate || new Date());

    const selectedDate = date !== undefined ? date : internalDate;
    const onSelect = (d: Date | undefined) => {
        setInternalDate(d);
        if (setDate) setDate(d);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal bg-neutral-950 border-neutral-800 text-white hover:bg-neutral-900 hover:text-white",
                        !selectedDate && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd MMMM, yyyy") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-neutral-900 border-neutral-800 text-white">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={onSelect}
                    initialFocus
                    className="bg-neutral-900 text-white"
                />
            </PopoverContent>
        </Popover>
    )
}
