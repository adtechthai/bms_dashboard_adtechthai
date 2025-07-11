# Database Setup Instructions

## How to Run the Database Setup

### Step 1: Access Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your LeaniOS project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New Query"**

### Step 2: Run the Setup Script
1. Copy the entire contents of `database_setup.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** button
4. Wait for all commands to execute (should see "Success" messages)

### Step 3: Verify Setup
The script includes verification queries at the end that will show:
- ✅ Profiles table structure
- ✅ RLS enabled status  
- ✅ Security policies created
- ✅ Triggers and functions installed

### Step 4: Create Your First Admin User
After the setup is complete:

1. **Register a user** through your app's signup flow
2. **Promote to admin** via SQL:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

## What Gets Created

### 📋 **Tables**
- `public.profiles` - User profile data with role management

### 🔒 **Security Policies (RLS)**
- Users can view/update their own profiles
- Users can create their own profiles
- Admins can view/update all profiles

### ⚡ **Automatic Features**
- **Auto Profile Creation**: New signups automatically get profile records
- **Timestamp Management**: `updated_at` automatically updated on changes
- **Admin Functions**: `promote_to_admin()` and `demote_from_admin()`

### 🛡️ **Security Features**
- Row Level Security enabled
- Role-based access control
- Admin-only functions with permission checks
- Self-demotion protection for admins

## Troubleshooting

### If Script Fails
- Run sections individually if the full script fails
- Check for existing table conflicts
- Ensure you have sufficient permissions

### If RLS Policies Don't Work
- Verify policies exist: Check the verification queries output
- Ensure `auth.uid()` returns the correct user ID
- Check that users have proper profiles created

### If Auto Profile Creation Fails
- Verify the trigger exists on `auth.users`
- Check that the `handle_new_user()` function is created
- Test by registering a new user

## Testing the Setup

1. **Register a new user** - Should auto-create profile
2. **Login and check dashboard** - Should show user content
3. **Promote user to admin** - Use the SQL command above
4. **Login as admin** - Should see admin panel access
5. **Test admin functions** - Try promoting/demoting other users

## Database Schema Overview

```sql
profiles (
  id UUID PRIMARY KEY,           -- Links to auth.users
  email TEXT,                    -- User email
  first_name TEXT,               -- First name
  last_name TEXT,                -- Last name  
  role TEXT DEFAULT 'user',      -- 'user' or 'admin'
  avatar_url TEXT,               -- Profile picture URL
  created_at TIMESTAMPTZ,        -- Auto-set on creation
  updated_at TIMESTAMPTZ         -- Auto-updated on changes
)
```

Your database is now ready for production use! 🚀