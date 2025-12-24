# Footer Integration

This document outlines the integration of the `FooterSection` component.

## Overview
The footer provides site-wide navigation, social links, and legal information (Privacy Policy, Terms of Use) via interactive modals.

## Component Structure
- **Path**: `components/ui/footer-section.tsx`
- **Dependencies**: `lucide-react`, `shadcn/ui` (Dialog, Button)
- **Key Features**:
  - **Internal Navigation**: Smooth scroll links to Services, Tours, Pricing, and About Us.
  - **Social Icons**: Social media links with hover effects.
  - **Legal Modals**: Privacy Policy and Terms of Use open in `Dialog` overlays.

## Customization
- **Links**: Update the `links` array in `footer-section.tsx`.
- **Legal Text**: Edit the text content within the `<DialogContent>` blocks in the component.

## Usage
Import and place the component at the bottom of `app/page.tsx`:

```tsx
import FooterSection from "@/components/ui/footer-section"

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Other sections */}
      <FooterSection />
    </div>
  )
}
```
