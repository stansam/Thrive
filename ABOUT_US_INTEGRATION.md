# About Us Section Integration

This document outlines the integration of the `AboutUsSection` component.

## Overview
The "About Us" section provides a detailed overview of Thrive Global Travel & Tours, including the business mission, vision, services, and key statistics. It uses `framer-motion` for engaging scroll animations.

## Component Structure
- **Path**: `components/ui/about-us-section.tsx`
- **Dependencies**: `framer-motion`, `lucide-react`
- **Key Features**:
  - Parallax background elements
  - Animated service cards
  - Counting statistics
  - Responsive grid layout

## Customization
To update the content, modify the constants in `components/ui/about-us-section.tsx`:
- `services`: Array of service objects (icon, title, description).
- `stats`: Array of statistic objects.
- Text content within the JSX (Mission, Vision, Executive Summary).

## Usage
Import and place the component in `app/page.tsx`:

```tsx
import AboutUsSection from "@/components/ui/about-us-section"

export default function Page() {
  return (
    <>
      <PricingSection />
      <AboutUsSection />
    </>
  )
}
```
