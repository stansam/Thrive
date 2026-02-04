# Audit Log

A scorecard of issues, warnings, and optimization opportunities found during forensic analysis.

## 🔴 Critical

_No critical hydration or type safety issues found yet._

## 🟡 Warning

1. **Manual Form Management**:
   - `components/book-flight-form.tsx`: Uses `useState` for individual fields (`adults`, `children`, `date`, `cabinClass`...) instead of `react-hook-form` + type-safe Zod schema. This leads to verbose code and fragile validation.
2. **Top-Level Client Component**:
   - `app/page.tsx` uses `"use client"`. This renders the entire homepage on the client, negating Next.js server-side rendering benefits for the initial paint relative to SEO and performance.
3. **Hardcoded Data**:
   - `components/blocks/featured-tours.tsx`: `FALLBACK_PACKAGES` is hardcoded within the component file. Should be extracted to a constants file.

## 🟢 Optimization

1. **Image Optimization**:
   - `components/blocks/featured-tours.tsx` (Line 240): Uses standard `<img>` tag instead of `next/image`. This bypasses Next.js image optimization (lazy loading, sizing, format conversion).
2. **Component Purity**:
   - `featured-tours.tsx` mixes data fetching hooks (`useFeaturedPackages`, `useMyPackages`), UI state (`carouselApi`), and rendering. Logic could be separated.
   - `Navbar` contains commented-out code (lines 184-193) for "Auth Mode". Dead code should be removed.
3. **Accessibility**:
   - `Navbar` uses an `<a>` tag for the WhatsApp link. While functional, ensure `rel="noopener noreferrer"` is used for external links if opening in new tab (though `href="https://wa.me..."` usually triggers app or new tab).

## 🔵 Mobile & Responsive

- `Navbar` has a dedicated `MobileNav` component using `Popover`.
- `BookFlightForm` and `SearchTripsForm` have responsive styling (`md:absolute`).
- **Verification Needed**: Ensure `BookFlightForm` inputs are touch-friendly (16px font size to prevent iOS zoom).
