# Stripe Integration Environment Variables

Add these environment variables to your `.env.local` file:

## Required Stripe Environment Variables

```env
# Stripe API Keys
STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_... for production
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=ca_... # Get this from your Stripe Connect settings

# Stripe Webhooks
STRIPE_WEBHOOK_SECRET=whsec_... # Get this after creating webhook endpoint

# Application URL (for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Change to your production URL
```

## How to Get These Values

### 1. Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** and **Secret key**
3. Use test keys for development, live keys for production

### 2. Stripe Connect Client ID
1. Go to [Stripe Connect Settings](https://dashboard.stripe.com/settings/connect)
2. Enable Connect if not already enabled
3. Copy your **Client ID** from the Connect settings

### 3. Stripe Webhook Secret
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Create a new webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret**

### 4. Application URL
- Development: `http://localhost:3000`
- Production: Your actual domain (e.g., `https://yourdomain.com`)

## Example .env.local File

```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (new)
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef
STRIPE_SECRET_KEY=sk_test_51234567890abcdef
STRIPE_CONNECT_CLIENT_ID=ca_1234567890abcdef
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Important Notes

- **Never commit these keys to version control**
- Use test keys during development
- Switch to live keys only in production
- Keep your secret keys secure and never expose them in client-side code
- The webhook secret is generated when you create the webhook endpoint