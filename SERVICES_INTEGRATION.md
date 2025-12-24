# Services Integration Guide

This guide explains how to use and customize the `ServicesMarquee` component.

## Overview

The `ServicesMarquee` is a responsive, auto-scrolling marquee of service cards. It is built with React, Tailwind CSS, shadcn/ui components, and Lucide icons.

## Component Structure

- **Section Wrapper**: `ServicesMarquee` handles the layout, title, description, and the infinite scrolling container.
- **Card**: `ServiceCard` displays the individual service content with an icon, title, and description.

## Usage

Import the component and pass the required props:

```tsx
import { ServicesMarquee } from "@/components/blocks/services-marquee"
import { Plane, Users } from "lucide-react"

const services = [
  {
    title: "Airline Ticket Booking",
    description: "Seamless domestic and international flight reservations.",
    icon: Plane
  },
  {
    title: "Group Travel",
    description: "Expert planning for large groups.",
    icon: Users
  }
]

export default function Page() {
  return (
    <ServicesMarquee
      title="Our Premium Services"
      description="Comprehensive travel solutions."
      services={services}
    />
  )
}
```

## Customization

### Animation Speed
The marquee animation speed is controlled by the CSS variable `--duration` on the parent container in `services-marquee.tsx`.
Default is `40s`. Decrease to speed up, increase to slow down.

```tsx
<div className="group flex ... [--duration:40s]">
```

### Gap Size
The gap between cards is controlled by `--gap` (default `1rem`).

### Styling
You can pass a `className` prop to `ServicesMarquee` to override background colors, padding, etc.

e.g. `className="bg-neutral-900 text-white"`

## Dependencies
- `lucide-react`
- Tailwind CSS animations (defined in `globals.css`)
