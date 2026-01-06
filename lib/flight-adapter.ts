import { FlightOffer } from "./types/flight";

export interface FlightCardProps {
    id: string;
    airline: {
        name: string;
        logo: string;
        flightNumber: string;
    };
    departureTime: string;
    departureCode: string;
    departureCity: string;
    arrivalTime: string;
    arrivalCode: string;
    arrivalCity: string;
    duration: string;
    stops: number;
    price: number;
    currency: string;
    offer?: string;
    class?: string;
    refundableType: string;
}

export function formatDuration(isoDuration: string): string {
    // Format PT5H15M to 5h 15m
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return isoDuration;

    const hours = match[1] ? match[1].replace('H', 'h') : '';
    const minutes = match[2] ? match[2].replace('M', 'm') : '';

    return `${hours} ${minutes}`.trim();
}

export function mapFlightOfferToCard(
    offer: FlightOffer,
    dictionaries?: {
        carriers?: Record<string, string>,
        locations?: Record<string, any>
    }
): FlightCardProps {
    const itinerary = offer.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];

    // Carrier
    const carrierCode = firstSegment.carrierCode;
    const carrierName = dictionaries?.carriers?.[carrierCode] || carrierCode;

    // We can use a public logo service or map internally if we had logos
    // For now using Unsplash or a placeholder service is safer, or just a generic one
    const logoUrl = `https://pic.al/8.png`; // Placeholder or use a proper logo API if available

    // Times
    const departureDate = new Date(firstSegment.departure.at);
    const arrivalDate = new Date(lastSegment.arrival.at);

    const departureTime = departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const arrivalTime = arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // Stops
    const stops = itinerary.segments.length - 1;

    // Class (extract from first traveler, first segment)
    const travelerPricing = offer.travelerPricings[0];
    const fareDetails = travelerPricing.fareDetailsBySegment.find(f => f.segmentId === firstSegment.id);
    const cabin = fareDetails?.cabin || 'ECONOMY';

    return {
        id: offer.id,
        airline: {
            name: carrierName,
            logo: logoUrl,
            flightNumber: `${carrierCode} ${firstSegment.number}`
        },
        departureTime: departureTime,
        departureCode: firstSegment.departure.iataCode,
        departureCity: dictionaries?.locations?.[firstSegment.departure.iataCode]?.cityCode || firstSegment.departure.iataCode, // Fallback
        arrivalTime: arrivalTime,
        arrivalCode: lastSegment.arrival.iataCode,
        arrivalCity: dictionaries?.locations?.[lastSegment.arrival.iataCode]?.cityCode || lastSegment.arrival.iataCode, // Fallback
        duration: formatDuration(itinerary.duration),
        stops: stops,
        price: parseFloat(offer.price.total),
        currency: offer.price.currency,
        offer: '', // Can logic this out based on price if needed
        class: cabin.charAt(0) + cabin.slice(1).toLowerCase(),
        refundableType: 'Refundable', // Simplified for now
    };
}
