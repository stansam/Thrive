# Type Registry

A central dictionary of exported types and interfaces to prevent duplication and ensure type safety.

## `/lib/types/admin.d.ts` (Admin Dashboard)

- `AdminStats`: { totalUsers, newUsersThisMonth, usersByRole, totalBookings, confirmedBookings... }
- `AdminUser`: { id, email, first_name, last_name, role, subscription_tier... }
- `AdminBooking`: { id, booking_reference, booking_type, status, total_price... }
- `AdminQuote`: { id, quote_reference, origin, destination, trip_type... }
- `AdminPackage`: { id, name, slug, destination_city, duration_days, price_per_person... }
- `AdminPayment`: { id, payment_reference, amount, currency, status... }
- `ContactMessage`: { id, name, email, subject, message, status... }
- `Pagination`: { page, perPage, totalPages, totalItems }

## `/lib/types/dashboard.ts` (User Dashboard)

- `User`: { id, email, firstName, lastName, passportNumber, subscriptionTier... }
- `ProfileUpdateData`: Partial user profile fields.
- `DashboardStats`: { totalBookings, confirmedBookings, totalSpent... }
- `DashboardSummary`: Aggregated stats and recent bookings.
- `Booking`: { id, bookingReference, bookingType, status, tripType, passengers... }
- `BookingStatus`: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded'
- `Passenger`: { id, firstName, lastName, passengerType... }
- `Payment`: { id, payment_reference, amount, status, paymentMethod... }
- `PackageInfo`: { id, name, slug, description, destination... }
- `Trip`: { id, bookingReference, status, departureDate... }
- `SubscriptionTier`: { name, price, currency, interval, benefits... }
- `Notification`: { id, title, message, isRead... }
- `APIResponse<T>`: { success, message, data, errors }

## `/lib/types/flight.ts` (Flight Search & Booking)

- `FlightSearchParams`: { origin, destination, departureDate, adults... }
- `FlightOffer`: { type, id, source, itineraries, price... }
- `Itinerary`: { duration, segments }
- `Segment`: { departure, arrival, carrierCode, number... }
- `Price`: { currency, total, base, fees }
- `TravelerPricing`: { travelerId, fareOption, price... }
- `FlightSearchResponse`: { success, data: FlightOffer[], meta... }
- `CreateBookingRequest`: { flightOffers, travelers, paymentMethod... }
- `BookingResponse`: { success, message, data: { bookingId... } }

## `/lib/types/package.ts` (Travel Packages)

- `Package`: { id, name, slug, short_description, full_description... }
- `PackageFilter`: { q, destination_city, min_price, sort_by... }

## Global

- `Window.google`: Defined in `types/global.d.ts`.

## Zod Schemas

_Note: Centralized Zod schemas not found in `lib/types`. Form validation appears to be handled manually or via local schemas._

- `components/blocks/booking-wizard.tsx`: Contains inline or local Zod schema (indicated by search).
