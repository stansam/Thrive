# Execution Plan

Proposed refactoring and optimization plan based on forensic analysis.

## Goal Description

Enhance codebase quality, performance, and standard compliance by refactoring key components to usage of `react-hook-form` + `zod` and `next/image`.

## User Review Required

> [!IMPORTANT]
> **Image Optimization**: Switching to `next/image` requires `images.unsplash.com` to be configured in `next.config.ts`. (Verified: It is currently configured).

## Proposed Changes

### 1. Form Standardization (`BookFlightForm`)

Migrate manual state management to `react-hook-form` with Zod validation to ensure robustness and type safety.

#### [MODIFY] [book-flight-form.tsx](file:///home/vault/Documents/Bundle/Thrive/components/book-flight-form.tsx)

- **Before**: `const [adults, setAdults] = useState(1); ...` (Manual state for each field)
- **After**: `const form = useForm<BookFlightSchema>({ resolver: zodResolver(bookFlightSchema) })`
- **Logic**: Implement `zod` schema for validation (dates, passenger counts, codes).

### 2. Feature Component Optimization (`FeaturedTours`)

Optimize image loading and decouple data/logic.

#### [NEW] [constants.ts](file:///home/vault/Documents/Bundle/Thrive/lib/constants.ts)

- Extract `FALLBACK_PACKAGES` constant here.

#### [MODIFY] [featured-tours.tsx](file:///home/vault/Documents/Bundle/Thrive/components/blocks/featured-tours.tsx)

- **Image Optimization**: Replace `<img src="...">` with `<Image src="..." width={400} height={300} ... />`.
- **Logic**: Import `FALLBACK_PACKAGES` from `lib/constants.ts`.

### 3. Clean Up (`Navbar`)

#### [MODIFY] [navbar.tsx](file:///home/vault/Documents/Bundle/Thrive/components/ui/navbar.tsx)

- Remove commented-out "Auth Mode" toggle code to reduce noise.
- Ensure strict types for `NavItem`.

## Verification Plan

### Automated Tests

- Run `tsc --noEmit` to verify type safety of new Zod schemas and component props.
- Run `npm run lint` to check for cleaner code standards.

### Manual Verification

1. **BookFlightForm**:
   - Open Home Page.
   - Try submitting empty form (should show Zod errors).
   - Fill valid data and search (should redirect to `/flights/results`).
2. **FeaturedTours**:
   - Verify images load correctly (optimized `webp` format in Network tab).
   - Verify fallback usage (by temporarily forcing empty API result if needed).
