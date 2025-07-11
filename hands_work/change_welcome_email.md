# Change Welcome Email - Supabase Dashboard Method

## Instructions

1. Go to your **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select **"Confirm signup"** template
3. Update with casual content:

## Subject
```
Welcome to LeaniOS! Let's get you started 🎉
```

## Body
```html
<h2>Hey there! 👋</h2>
<p>Thanks for joining LeaniOS! We're excited to have you on board.</p>
<p>Just one quick thing - we need to verify your email address to keep everything secure.</p>
<p><a href="{{ .ConfirmationURL }}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirm My Email</a></p>
<p style="color: #666; font-size: 14px;">This link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
<p>Cheers!<br>The LeaniOS Team</p>
```

## Notes
- Changes take effect immediately in production
- No restart required for dashboard method
- Use the provided HTML exactly as shown for proper styling