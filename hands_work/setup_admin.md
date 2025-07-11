# Setup Admin User

## Quick Database Method
1. Go to Supabase Dashboard → Table Editor → `profiles` table
2. Find user by email
3. Change `role` from `'user'` to `'admin'`

## SQL Method
```sql
-- By email
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';

-- By user ID  
UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid-here';
```

## Verify Admin Access
After setting admin role:
1. User must sign out and sign back in
2. They should see "Admin Panel" in the sidebar
3. They can access `/admin` routes

## Current Admin Features
- User management (`/admin/users`)
- System settings (`/admin`)
- Database controls
- Email configuration
- User promotion/demotion (when implemented)

## Security Notes
- Admin role is checked in dashboard-layout.tsx:63
- Admin routes are protected in admin-layout.tsx:71-72
- Non-admin users are redirected to dashboard automatically