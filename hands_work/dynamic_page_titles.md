# Dynamic Page Titles Implementation

## Overview
All page titles now follow the template: **"{Current Page} - {Application Name} {Application Description}"**

The app name and description are dynamically fetched from the `system_settings` table, so when admins change these values in System Settings, all page titles update automatically.

## Architecture

### Server-Side Rendering (SSR)
For initial page loads, titles are generated server-side using Next.js metadata:

```typescript
// src/lib/metadata.ts
export async function generatePageTitle(currentPage: string): Promise<string> {
  const settings = await getSystemSettings()
  return `${currentPage} - ${settings.app_name} ${settings.app_description}`
}
```

### Client-Side Updates
For dynamic client-side title updates:

```typescript
// src/hooks/usePageTitle.ts
export function usePageTitle(currentPage: string) {
  // Fetches settings and updates document.title
}
```

## Implementation Structure

### Layout Files
Each route section has a layout that generates metadata:

```
src/app/
├── layout.tsx                    # "Home - ..."
├── auth/
│   ├── layout.tsx               # "Authentication - ..."
│   ├── sign-in/layout.tsx       # "Sign In - ..."
│   ├── sign-up/layout.tsx       # "Sign Up - ..."
│   ├── forgot-password/layout.tsx # "Forgot Password - ..."
│   └── reset-password/layout.tsx  # "Reset Password - ..."
├── dashboard/
│   ├── layout.tsx               # "Dashboard - ..."
│   ├── profile/layout.tsx       # "Profile - ..."
│   └── settings/layout.tsx      # "User Settings - ..."
└── admin/
    ├── layout.tsx               # "Admin - ..."
    ├── users/layout.tsx         # "User Management - ..."
    ├── settings/layout.tsx      # "System Settings - ..."
    └── stripe/
        ├── layout.tsx           # "Stripe Integration - ..."
        └── products/layout.tsx  # "Product Management - ..."
```

### API Endpoints

#### Public App Info API
```
GET /api/public/app-info
```

Returns basic app information without authentication:
```json
{
  "app_name": "Leaniverse.co",
  "app_description": "Modern SaaS boilerplate built with Next.js, React, TypeScript, and Supabase"
}
```

#### Settings Caching
- Server-side: 5-minute cache to reduce database calls
- Client-side: In-memory cache for session duration

## Example Page Titles

With default settings:
- **Home**: "Home - Leaniverse.co Modern SaaS boilerplate built with Next.js, React, TypeScript, and Supabase"
- **Sign In**: "Sign In - Leaniverse.co Modern SaaS boilerplate built with Next.js, React, TypeScript, and Supabase"
- **Dashboard**: "Dashboard - Leaniverse.co Modern SaaS boilerplate built with Next.js, React, TypeScript, and Supabase"
- **User Management**: "User Management - Leaniverse.co Modern SaaS boilerplate built with Next.js, React, TypeScript, and Supabase"

When admin changes app name to "MyApp" and description to "Best SaaS Ever":
- **Home**: "Home - MyApp Best SaaS Ever"
- **Sign In**: "Sign In - MyApp Best SaaS Ever"
- **Dashboard**: "Dashboard - MyApp Best SaaS Ever"

## Usage

### For Server Components
Metadata is automatically generated using layout files. No additional code needed.

### For Client Components
Use the hook when you need dynamic title updates:

```typescript
'use client'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function MyComponent() {
  usePageTitle('My Custom Page')
  
  return <div>Content</div>
}
```

### Manual Title Updates
For immediate title updates without re-fetching:

```typescript
import { updatePageTitle } from '@/hooks/usePageTitle'

// Update title immediately
updatePageTitle('New Page', 'MyApp', 'Best SaaS Ever')
```

## Benefits

1. **Consistent Branding**: All pages reflect current app branding
2. **Dynamic Updates**: Changes in System Settings immediately affect all pages
3. **SEO Friendly**: Proper page titles for search engines
4. **User Experience**: Clear page identification in browser tabs
5. **Performance**: Caching reduces database calls

## Technical Details

### Database Integration
- Fetches `app_name` and `app_description` from `system_settings` table
- Falls back to default values if database is unavailable
- Respects Row Level Security policies

### Caching Strategy
- **Server**: 5-minute cache with timestamp validation
- **Client**: Session-based cache with fetch-on-demand
- **Fallback**: Hardcoded defaults for reliability

### Error Handling
- Graceful degradation if database is unavailable
- Default values ensure titles always display
- Console logging for debugging issues

## Testing

### Verify Implementation
1. Visit any page and check browser tab title
2. Change app name/description in System Settings
3. Navigate to different pages to see updated titles
4. Test with browser refresh to verify SSR titles

### Debug Endpoints
- Test public API: `GET /api/public/app-info`
- Test settings API: `GET /api/admin/settings/debug` (when signed in)

## Maintenance

### Adding New Pages
1. Create layout file in page directory
2. Import and use `generatePageMetadata`
3. Specify the page name as parameter

Example:
```typescript
// src/app/my-new-page/layout.tsx
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return await generatePageMetadata("My New Page");
}

export default function MyNewPageLayout({ children }) {
  return children;
}
```

### Customizing Titles
To customize title format, modify `generatePageTitle` in `src/lib/metadata.ts`:

```typescript
export async function generatePageTitle(currentPage: string): Promise<string> {
  const settings = await getSystemSettings()
  // Custom format: Page | App Name
  return `${currentPage} | ${settings.app_name}`
}
```

## Performance Considerations

- **Cache Duration**: 5 minutes balances freshness vs performance
- **API Calls**: Public endpoint avoids authentication overhead
- **Fallbacks**: Prevent delays if database is slow
- **Client Cache**: Reduces API calls during user session

The implementation ensures all pages have consistent, dynamic titles that reflect the current application branding configured in System Settings.