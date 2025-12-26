import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility from shadcn

// Define the props for the FlightCard component
export interface FlightCardGridProps {
    imageUrl: string;
    airline: string;
    flightCode: string;
    flightClass: string;
    departureCode: string;
    departureCity: string;
    departureTime: string;
    arrivalCode: string;
    arrivalCity: string;
    arrivalTime: string;
    duration: string;
    className?: string;
    price?: string; // Added price for conformity
    onBook?: () => void;
}

// Main component definition
export const FlightCardGrid = React.forwardRef<HTMLDivElement, FlightCardGridProps>(
    (
        {
            imageUrl,
            airline,
            flightCode,
            flightClass,
            departureCode,
            departureCity,
            departureTime,
            arrivalCode,
            arrivalCity,
            arrivalTime,
            duration,
            className,
            price,
            onBook
        },
        ref
    ) => {
        // Animation variants for the container and its children
        const cardVariants = {
            hidden: { opacity: 0, y: 20 },
            visible: {
                opacity: 1,
                y: 0,
                transition: {
                    duration: 0.5,
                    when: "beforeChildren",
                    staggerChildren: 0.1,
                },
            },
        };

        const itemVariants = {
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
        };

        return (
            <motion.div
                ref={ref}
                className={cn(
                    "max-w-sm w-full font-sans rounded-2xl overflow-hidden shadow-lg bg-card border border-neutral-800 cursor-pointer group hover:border-neutral-600 transition-colors",
                    className
                )}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                onClick={onBook}
            >
                {/* Flight Image */}
                <div className="relative h-40 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt="View from airplane window"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {price && (
                        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-white font-bold text-sm">
                            {price}
                        </div>
                    )}
                </div>

                {/* Flight Details Container */}
                <div className="p-6 pt-4 bg-black">
                    {/* Main Flight Route */}
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between"
                    >
                        <div className="text-left">
                            <p className="text-sm text-neutral-400">{departureTime}</p>
                            <p className="text-3xl font-bold text-white">
                                {departureCode}
                            </p>
                            <p className="text-xs text-neutral-500">{departureCity}</p>
                        </div>

                        <div className="text-center px-2">
                            <p className="text-[10px] font-medium text-neutral-500 mb-1">{flightCode}</p>
                            <div className="flex items-center gap-1 my-1">
                                <div className="h-[1px] w-full bg-neutral-700" />
                                <Plane className="h-3 w-3 text-neutral-500 rotate-90" />
                                <div className="h-[1px] w-full bg-neutral-700" />
                            </div>
                            <p className="text-[10px] text-neutral-500">{duration}</p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-neutral-400">{arrivalTime}</p>
                            <p className="text-3xl font-bold text-white">
                                {arrivalCode}
                            </p>
                            <p className="text-xs text-neutral-500">{arrivalCity}</p>
                        </div>
                    </motion.div>

                    {/* Divider */}
                    <motion.div
                        variants={itemVariants}
                        className="border-t border-dashed border-neutral-800 my-4"
                    />

                    {/* Additional Details */}
                    <motion.div
                        variants={itemVariants}
                        className="flex justify-between text-center"
                    >
                        <InfoItem label="Airline" value={airline} />
                        <InfoItem label="Class" value={flightClass} />
                    </motion.div>
                </div>
            </motion.div>
        );
    }
);

FlightCardGrid.displayName = "FlightCardGrid";

// Helper component for bottom info items
const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col items-center">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{label}</span>
        <span className="font-semibold text-sm text-neutral-300">{value}</span>
    </div>
);
