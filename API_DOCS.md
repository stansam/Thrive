# Thrive API Documentation

## UI Components

### DatePicker
Reusable date selection component connecting to a Calendar popover.
**Path**: `components/ui/date-picker.tsx`
**Props**: `date` (Date), `setDate` (setter), `defaultDate`, `placeholder`.
**Default**: Pre-selected to Current Date if specified.

### TravelerDetailsForm
Form for collecting traveler information including personal details, contact info, and passport data.
**Path**: `components/traveler-details-form.tsx`
**Props**: `id`, `travelerType`, `onChange`, `errors`.
**Updates**: Uses `DatePicker` for Date of Birth and Passport Expiry.

### FlightPricingSummary
Displays a price breakdown and **Traveler Summary**.
**Path**: `components/flight-pricing-summary.tsx`
**Props**: `baseFare`, `taxes`, `fees`, `currency`, `onProceed`, `travelerDetails` (Optional).

### FlightItineraryConfirmation
Detailed view of the flight segments for confirmation.
**Path**: `components/flight-itinerary-confirmation.tsx`
**Props**: `segments` (Array of flight segments).
**Updates**: Improved image reliability.

### FlightCard / FlightCardGrid
Displays flight details.
**Path**: `components/ui/flight-card.tsx` / `grid.tsx`
**Updates**: Improved image reliability with Unsplash assets.

## Page Features

### Flight Results Page (`/flights/results`)
- **Advanced Search**: Now uses `DatePicker` for Departure and Return dates.
- **Flight Cards**: Valid Airline Logos.

### Flight Pricing Page (`/flights/pricing`)
- **Traveler Form**: Enhanced validation and Date Pickers.
- **Summary Side Panel**: Shows live preview of traveler name/email.
