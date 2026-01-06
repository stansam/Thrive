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
    // Initialize state from props
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date || defaultDate);

    // Local state for inputs
    const [day, setDay] = React.useState(date ? format(date, "dd") : "");
    const [month, setMonth] = React.useState(date ? format(date, "MM") : "");
    const [year, setYear] = React.useState(date ? format(date, "yyyy") : "");

    // Sync with external date prop if it changes
    React.useEffect(() => {
        if (date) {
            setSelectedDate(date);
            setDay(format(date, "dd"));
            setMonth(format(date, "MM"));
            setYear(format(date, "yyyy"));
        }
    }, [date]);

    const handleDateSelect = (d: Date | undefined) => {
        setSelectedDate(d);
        if (d) {
            setDay(format(d, "dd"));
            setMonth(format(d, "MM"));
            setYear(format(d, "yyyy"));
        } else {
            setDay("");
            setMonth("");
            setYear("");
        }
        if (setDate) setDate(d);
    };

    const updateDateFromInput = (d: string, m: string, y: string) => {
        if (d.length === 2 && m.length === 2 && y.length === 4) {
            const parsedDate = new Date(`${y}-${m}-${d}`);
            if (!isNaN(parsedDate.getTime())) {
                // Check if valid day for month
                if (parsedDate.getDate() === parseInt(d) && parsedDate.getMonth() + 1 === parseInt(m)) {
                    setSelectedDate(parsedDate);
                    if (setDate) setDate(parsedDate);
                }
            }
        }
    };

    const handleInputChange = (field: 'day' | 'month' | 'year', value: string) => {
        // Allow only numbers
        if (!/^\d*$/.test(value)) return;

        if (field === 'day') {
            if (value.length > 2) return;
            setDay(value);
            updateDateFromInput(value, month, year);
        } else if (field === 'month') {
            if (value.length > 2) return;
            setMonth(value);
            updateDateFromInput(day, value, year);
        } else if (field === 'year') {
            if (value.length > 4) return;
            setYear(value);
            updateDateFromInput(day, month, value);
        }
    };

    // Helper to render input segment
    const renderInput = (
        value: string,
        onChange: (val: string) => void,
        label: string,
        width: string,
        maxLength: number,
        placeholderChar: string
    ) => {
        return (
            <div className="flex flex-col items-center relative group">
                <span className="text-[10px] text-neutral-500 absolute -top-3 left-0 uppercase font-mono tracking-wider">{label}</span>
                <div className="relative">
                    {/* Placeholder underscores - visible only when input is empty or partial? 
                        Actually, requested: "_" disapear after it's value is inputted.
                        So we can show string of _ if empty.
                        Or maybe, just use standard placeholder and style it?
                        The request says "layout __/__/____ with superscripts... and individual _ disappear".
                        Let's put the _ as a background text or simple placeholder.
                    */}
                    {/* 
                       Trick: render the underscores absolutely behind the input? 
                       Or just use placeholder prop? 
                       Input has value, so placeholder hides.
                       But we want `__` and if you type `1`, it shows `1_`. 
                       This specific masking is complex custom logic. 
                       Simplification: Standard placeholder `__` works exactly like "value hides placeholder".
                       User asked: "individual _ disapear after it's value is inputted" -> this sounds like `1` -> `1_`.
                       Let's approximate with just placeholder for now to keep it robust, 
                       or use a mask. Given simplicity request, let's use standard placeholders.
                    */}
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={cn(
                            "bg-transparent border-none outline-none text-white text-center p-0 font-medium placeholder:text-neutral-600 focus:placeholder:text-neutral-700",
                            width
                        )}
                        placeholder={placeholderChar}
                        maxLength={maxLength}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className={cn(
            "flex items-center rounded-md border text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            "bg-neutral-950 border-neutral-800", // Default styles
            className
        )}>
            <div className="flex items-end px-3 py-2 gap-1 flex-1">
                {renderInput(day, (v) => handleInputChange('day', v), "DD", "w-5", 2, "__")}
                <span className="text-neutral-600 mb-0.5">/</span>
                {renderInput(month, (v) => handleInputChange('month', v), "MM", "w-5", 2, "__")}
                <span className="text-neutral-600 mb-0.5">/</span>
                {renderInput(year, (v) => handleInputChange('year', v), "YYYY", "w-9", 4, "____")}
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"ghost"}
                        className={cn(
                            "px-2 h-auto text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-l-none border-l border-neutral-800",
                        )}
                    >
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-neutral-900 border-neutral-800 text-white" align="end">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        autoFocus={true}
                        className="bg-neutral-900 text-white"
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
