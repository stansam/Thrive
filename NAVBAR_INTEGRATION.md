# Navbar & Notification Integration

This document outlines the integration of the `Navbar` component.

## Overview
The Navbar provides sticky top navigation, contact urgency via a top strip, and a logged-in user experience with a notification system.

## Component Structure
- **Path**: `components/ui/navbar.tsx`
- **Helper**: `components/ui/notifications-modal.tsx`
- **Key Features**:
  - **Top Strip**: "Urgent flight..." with simulated WhatsApp number.
  - **Sticky Header**: Uses `sticky top-0` and glassmorphism.
  - **User Toggle**: Switch between "User Mode" (Logged In) and "Guest Mode" for demo purposes.
  - **Notifications**:
    - **Bell Icon**: Shows orange dot if unread.
    - **Dropdown**: Quick view of last 3 notifications.
    - **Modal**: "View All" opens a detailed list with "Mark Read" and "Delete" actions.

## Customization
- **Links**: Update `navLinks` array in `navbar.tsx`.
- **Top Strip**: Edit the text directly in the JSX.
- **Notifications**: Update the default state `notifications` array or fetch from an API.

## Usage
Placed at the top of `app/page.tsx`:

```tsx
import Navbar from "@/components/ui/navbar"

export default function Page() {
  return (
    <div>
      <Navbar />
      {/* Rest of the app */}
    </div>
  )
}
```
