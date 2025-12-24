# Sign In Page Integration

This document details the integration of the branded "Thrive Travel & Tours" User Sign In page.

## Components
- **Page Route:** `/app/sign-in/page.tsx`
- **Main Component:** `/components/ui/travel-connect-signin.tsx`

## Features
- **Global Dot Map**: An animated canvas-based world map visualizing flight routes.
- **Branded UI**: "Thrive Travel" branding with custom gradients matching the site theme.
- **Interactive Form**: Login form with password visibility toggle and floating animations.

## API Description
Currently, the form is mocked for frontend demonstration.

### Mocked Events
The component logs the following events to the console:

1.  **Google Sign In**:
    ```javascript
    console.log("Google sign-in")
    ```

2.  **Email/Password Sign In**:
    ```javascript
    console.log("Sign in attempt with:", { email, password })
    ```

### Integration Points
To connect this to a real backend (e.g., NextAuth, Supabase, Firebase):

1.  **Google Auth**:
    Replace the `onClick` handler in the Google button:
    ```tsx
    // Example with NextAuth
    onClick={() => signIn('google')}
    ```

2.  **Credentials Auth**:
    Update the `handleSubmit` function:
    ```tsx
    const handleSubmit = async (e) => {
      e.preventDefault()
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      if (result.error) {
        // Handle error
      }
    }
    ```

## Customization Guide

### Changing the Map
The `DotMap` component uses a grid-based approach to render the world map.
-   **Dot Color**: Modify `ctx.fillStyle` in `drawDots` function.
-   **Routes**: Edit the `routes` array:
    ```typescript
    const routes = [
      {
        start: { x: 100, y: 150, delay: 0 },
        end: { x: 200, y: 80, delay: 2 },
        color: "#3b82f6", // Route line color
      },
      // ... add more routes
    ];
    ```

### Colors
The component uses Tailwind classes. Key gradients to update if re-theming:
-   **Background**: `bg-gradient-to-br from-[#060818] to-[#0d1023]` (Page container)
-   **Card Background**: `bg-[#090b13]`
-   **Button Gradient**: `bg-gradient-to-r from-blue-600 to-indigo-600`
