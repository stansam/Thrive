import { z } from "zod";

export const bookFlightSchema = z.object({
  tripType: z.enum(["round-trip", "one-way"]),
  from: z.string().min(2, "Origin is required"),
  to: z.string().min(2, "Destination is required"),
  departureDate: z.date({
    required_error: "Departure date is required",
  }),
  returnDate: z.date().optional(),
  adults: z.number().min(1).max(9),
  children: z.number().min(0).max(9),
  cabinClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
}).refine((data) => {
  if (data.tripType === "round-trip" && !data.returnDate) {
    return false;
  }
  return true;
}, {
  message: "Return date is required for round-trip",
  path: ["returnDate"],
});

export type BookFlightSchema = z.infer<typeof bookFlightSchema>;
