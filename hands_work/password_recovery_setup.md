# Password Recovery Setup

## Overview
The password recovery system allows users to reset their passwords via email links. This guide explains how to configure it properly.

## Supabase Configuration Required

### 1. Email Templates (Optional Customization)
Go to **Authentication > Email Templates** in your Supabase dashboard:

#### Reset Password Template:
- **Subject**: Reset your password for {{ .SiteURL }}
- **Body**: 
```html
<h2>Reset your password</h2>
<p>Follow this link to reset the password for your account:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can ignore this email.</p>
```

### 2. URL Configuration
Go to **Authentication > URL Configuration**:
- **Site URL**: `http://localhost:3000` (development) or your production domain
- **Redirect URLs**: Add these URLs:
  - `http://localhost:3000/auth/reset-password` (development)
  - `https://yourdomain.com/auth/reset-password` (production)

## How It Works

### 1. User Flow
1. User clicks "Forgot your password?" on sign-in page
2. User enters their email address
3. System sends password reset email via Supabase
4. User clicks link in email → redirected to reset password page
5. User enters new password and confirms it
6. Password is updated and user is redirected to dashboard

### 2. Security Features
- **Email verification required** - only valid email addresses can reset
- **Time-limited links** - reset links expire automatically
- **Password validation** - minimum 6 characters, must match confirmation
- **Session management** - user is automatically signed in after reset
- **One-time use** - reset links can only be used once

### 3. Error Handling
- Invalid/expired links show clear error messages
- Password mismatch validation
- Network error handling
- Disabled account detection (users can't reset if disabled)

## File Structure

```
src/app/auth/
├── forgot-password/
│   └── page.tsx          # Email input form
├── reset-password/
│   └── page.tsx          # New password form
└── sign-in/
    └── page.tsx          # Updated with "Forgot password?" link
```

## Features Included

### Forgot Password Page (`/auth/forgot-password`)
- Clean email input form
- Loading states and error handling
- Success message with instructions
- Back to sign-in link

### Reset Password Page (`/auth/reset-password`)
- New password input with strength indicators
- Confirm password validation
- Show/hide password toggles
- Real-time password requirement checking
- Auto-redirect to dashboard on success

### Enhanced Sign-in Page
- "Forgot your password?" link added
- Proper placement in the UI flow

## Testing

### Development Testing
1. Ensure Supabase email settings are configured
2. Test with a real email address (development emails may not send)
3. Check spam folder if email doesn't arrive
4. Verify redirect URLs are correct

### Production Checklist
- [ ] Update Site URL in Supabase dashboard
- [ ] Add production redirect URLs
- [ ] Test email delivery
- [ ] Verify SMTP settings (if using custom email provider)
- [ ] Test with disabled accounts (should not allow reset)

## Security Considerations

- Reset links are one-time use only
- Links expire automatically (Supabase default: 1 hour)
- Disabled accounts cannot reset passwords
- All password changes are logged by Supabase
- Users are automatically signed in after successful reset

## Customization Options

### Email Styling
- Customize email templates in Supabase dashboard
- Add your branding and styling
- Include support contact information

### Password Requirements
- Modify validation in `reset-password/page.tsx`
- Update minimum length requirements
- Add complexity requirements (uppercase, numbers, symbols)

### Redirect Behavior
- Change post-reset redirect destination
- Add custom success messages
- Integrate with your notification system