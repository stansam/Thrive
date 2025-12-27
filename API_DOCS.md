# Thrive API Documentation

## UI Components

### TravelerDetailsForm
Form for collecting traveler information including personal details, contact info, and passport data.

**Path**: `components/traveler-details-form.tsx`
**Props**: `id`, `travelerType`, `onChange`, `errors`.

### FlightPricingSummary
Displays a price breakdown (Base fare, Taxes, Fees) and the total amount.

**Path**: `components/flight-pricing-summary.tsx`
**Props**: `baseFare`, `taxes`, `fees`, `currency`, `onProceed`.

### FlightItineraryConfirmation
Detailed view of the flight segments for confirmation.

**Path**: `components/flight-itinerary-confirmation.tsx`
**Props**: `segments` (Array of flight segments).

### FlightEmissionsDisplay
Displays estimated CO2 emissions and a comparison.

**Path**: `components/flight-emissions-display.tsx`
**Props**: `co2Amount`, `comparison`.

### FlightCard (List View)
Displays flight details in a horizontal list format.

**Path**: `components/ui/flight-card.tsx`
**Props**: standard flight details (airline, times, price, etc.).

### FlightCardGrid (Grid View)
Displays flight details in a compact card format.

**Path**: `components/ui/flight-card-grid.tsx`
**Props**: standard flight details key for grid layout.

## Page Features

### Flight Results Page (`/flights/results`)
- **Advanced Search Form**: Collapsible form for filtering flight parameters.
- **View Toggle**: List vs Grid views.
- **Sorting**: Best Value (Price) vs Fastest (Duration).
- **Navigation**: "Book" button navigates to `/flights/pricing`.

### Flight Pricing Page (`/flights/pricing`)
- **Purpose**: Confirm price, input traveler details, and convert to booking.
- **Features**:
    - Detailed Itinerary view.
    - Price Breakdown.
    - Carbon Emissions (CO2) display.
    - **Traveler Information Form**: Collects Name, DOB, Gender, Email, Phone, Passport.
- **Validation**: Form must be valid before proceeding to payment (alert simulation).
- **Mock Data**: Uses `MOCK_PRICING_DATA`.
