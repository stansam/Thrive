# Thrive Web - Interactive 3D Spline Experience

This is a [Next.js](https://nextjs.org) project showcasing an interactive 3D scene with `react-spline` and dynamic overlay forms for flight booking and custom quotes.

## Features

- **Interactive 3D Scene**: Integration of Spline 3D scenes with lazy loading and suspense fallback.
- **Dynamic Form Overlays**: Toggleable "Book Flight" and "Custom Quote" forms that appear to be held by the 3D character.
- **Book Flight Form**:
    - "From" and "To" fields with autocomplete suggestions.
    - Passenger counters (Adults/Children).
    - Default departure date.
- **Custom Quote Form**:
    - Radio buttons for client type (Individual, Corporate, Group).
    - Conditional rendering for "Group Size".
    - Fields for destinations, dates, and budget.
- **Services Section**: Auto-scrolling marquee of offered services with Lucide icons.
- **Featured Tours**: Carousel showcasing curated travel packages with detailed highlights.
- **Pricing Section**: Clear breakdown of corporate packages, booking fees, and add-on services.
- **Flight Results Page**: 
    - Advanced search filters (Amadeus API parameters).
    - List and Grid view toggles.
    - Integration of custom Flight Card components.
- **Flight Pricing Page**: 
    - Detailed itinerary confirmation.
    - Price breakdown (Base fare, Taxes, Fees).
    - Carbon emissions (CO2) display.
- **User Dashboard**:
    - Comprehensive analytics interface with Sidebar and Chart.
    - Interactive slider to view different feature sets (Users, Trends, Activity).
    - Built with Recharts and GSAP for smooth data visualization and transitions.
- **Modern UI**: Built with [shadcn/ui](https://ui.shadcn.com/) and Tailwind CSS, featuring glassmorphism and smooth transitions.
- **API Documentation**: See [API_DOCS.md](API_DOCS.md) for expected backend integration details.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **3D**: @splinetool/react-spline
- **Icons**: Lucide React
- **Animation**: Framer Motion (dependency available)
