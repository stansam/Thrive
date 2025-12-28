# User Dashboard Integration Guide

## Overview

The User Dashboard component (`FeaturesDetail`) provides a dynamic, tabbed interface for the Thrive application. It features a comprehensive Dashboard UI for the "Analytics" tab, including a sidebar, key metrics cards, an interactive area chart, and a recent sales list. The component uses a slider mechanism to transition between different feature sets.

## Component Structure

- **`components/ui/features-detail.tsx`**: The main container component. Handles the slider logic using GSAP and React state.
- **`components/ui/dashboard-interface.tsx`**: The actual dashboard implementation (Sidebar, Header, Content).
- **Dependencies**: 
  - `gsap`: For smooth animations and scroll triggers.
  - `recharts`: For the "Overview" area chart.
  - `lucide-react`: For iconography.

## Integration

To use the User Dashboard in your page:

```tsx
import FeaturesDetail from "@/components/ui/features-detail";

export default function Page() {
  return (
    <main>
      <FeaturesDetail />
    </main>
  );
}
```

A demo page is available at `components/dashboard-demo.tsx` which can be mounted at a route like `/dashboard-demo`.

## Customization

### Dashboard Content (`dashboard-interface.tsx`)

- **Sidebar Links**: Modify the `<aside>` section to change navigation links.
- **Stats Cards**: Update the `data` array or the static Card components to reflect real metrics.
- **Chart Data**: The `data` array currently holds mock monthly revenue data. Replace this with API data or props.
- **Recent Sales**: Update the list of avatars and names within the "Recent Sales" card.

### Slider Tabs (`features-detail.tsx`)

The `dashboardTabs` array controls the tabs displayed in the slider:

```typescript
const dashboardTabs = [
  {
    id: 1,
    title: "Analytics",
    // ...
  },
  // ...
];
```

To add more functional components instead of images, duplicate the `type: "component"` logic in the map function and import your new component.

## Styling

The dashboard uses standard Tailwind CSS classes and relies on the CSS variables defined in `globals.css` (e.g., `bg-background`, `text-primary`, `border-border`) to ensure it adapts to both light and dark modes automatically.
