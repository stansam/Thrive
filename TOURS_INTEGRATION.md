# Featured Tours Integration Guide

This guide explains how to use and customize the `FeaturedTours` component.

## Overview

The `FeaturedTours` component displays a curated selection of travel packages using a responsive carousel (built with Embla Carousel). Each card showcases an image, pricing, duration, highlights, and inclusions/exclusions.

## Component Structure

- **Section Wrapper**: `FeaturedTours` handles the layout, title, description, and navigation arrows.
- **Carousel**: Uses `components/ui/carousel.tsx` for swipeable interactions.
- **Card**: Custom styled card overlaying text on images.

## Usage

Import the component:

```tsx
import { FeaturedTours } from "@/components/blocks/featured-tours"

export default function Page() {
  return (
    <FeaturedTours />
  )
}
```

## Customization

To modify the tour packages, edit the `data` array in `components/blocks/featured-tours.tsx`.

```tsx
const data: TourItem[] = [
  {
    id: "dubai-luxury",
    title: "Dubai Luxury Escape",
    duration: "5 Days • 4 Nights",
    price: "From $1,899",
    highlights: ["Yacht Cruise", "Desert Safari"],
    included: ["Hotel", "Breakfast"],
    excluded: ["Flights"],
    image: "https://..."
  },
  // Add more items...
];
```

## Dependencies
- `embla-carousel-react`
- `lucide-react` (Icons)
- shadcn/ui `Button`, `Carousel`
