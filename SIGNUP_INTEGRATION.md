# Sign Up Page Integration

This document details the integration of the branded "Thrive Travel" User Sign Up page with form validation.

## Components
- **Page Route:** `/app/sign-up/page.tsx`
- **Main Component:** `/components/ui/thrive-signup.tsx`

## Features
- **Real-time Validation:** 
    -   **Password Length**: Checks if password is >= 8 characters.
    -   **Password Match**: Compares "Password" and "Confirm Password" fields.
    -   **Visual Feedback**: Green checkmarks or red crosses indicate status.
    -   **Detailed Borders**: Input borders change color (Red/Green) based on confirmation status.
    -   **Button State**: "Create Account" button is disabled until validation passes.
- **Interactive UI**:
    -   Password visibility toggle for both password fields.
    -   Hover animations on the submit button.
    -   Google Sign-Up mock button.
-   **Branding**: Consistent with Sign In page (Dot Map, Colors).

## API Description
The form is mocked for frontend demonstration.

### Mocked Events
1.  **Google Sign Up**:
    ```javascript
    console.log("Google sign-up")
    ```

2.  **Form Submission**:
    ```javascript
    console.log("Sign up attempts with:", { fullName, email, password, confirmPassword })
    ```

### Integration Points
To connect to a backend:

1.  **Google Auth**: Update the `onClick` handler of the Google button.
2.  **Registration Logic**:
    Update `handleSubmit`:
    ```tsx
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!isPasswordMatch || !isPasswordLength) return;

      const response = await fetch('/api/register', {
          method: 'POST',
          body: JSON.stringify(formData)
      });
      // Handle response...
    }
    ```

## Customization
-   **Validation Rules**: Modify `isPasswordLength` or `isPasswordMatch` variables.
-   **Colors**: Uses the same dark theme palette as the Sign In page.
