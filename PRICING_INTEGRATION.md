# Pricing Integration Guide

This guide explains how to use and customize the `PricingSection` component.

## Overview

The `PricingSection` displays a comprehensive pricing structure including:
1.  **Corporate Monthly Packages**: Tiered subscription plans.
2.  **Ticket Booking Fees**: Transactional costs.
3.  **Additional Services**: Revenue streams from add-ons.

## Component Structure

- **Section Wrapper**: `PricingSection` handles the layout grid.
- **Card**: `PricingCard` displays individual plan details.

## Usage

Import the component:

```tsx
import { PricingSection } from "@/components/blocks/pricing-section"

export default function Page() {
  return (
    <PricingSection />
  )
}
```

## Customization

To modify prices or plans, edit `components/blocks/pricing-section.tsx`.  The data is defined directly within the component's JSX for specific categorization.

### Highlighted Plan
Add the `highlight` prop to a `PricingCard` to give it a distinct style (useful for "Most Popular" or top-tier plans).

```tsx
<PricingCard
  title="Gold"
  price="$500 / mo"
  highlight
  features={[...]}
/>
```

## Dependencies
- `lucide-react` (Check icon)
- `shadcn/ui` Button
