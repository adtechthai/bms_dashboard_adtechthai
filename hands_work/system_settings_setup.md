# System Settings Database Setup

## Overview
The System Settings feature stores all application configuration data in Supabase instead of using hardcoded values. This allows admins to modify app behavior without code changes.

## Database Setup

### 1. Run the SQL Schema
Execute the following SQL in your Supabase SQL editor:

```sql
-- Run the contents of sql/system_settings_schema.sql
```

Or run it via command line:
```bash
# If you have Supabase CLI
supabase db reset --include-data

# Or apply directly via psql
psql -h your-db-host -U postgres -d your-database -f sql/system_settings_schema.sql
```

### 2. Verify Table Creation
Check that the table was created successfully:

```sql
-- Check table structure
\d system_settings

-- View default settings
SELECT key, value, category FROM system_settings ORDER BY category, key;
```

## Settings Categories

### General Settings
- `app_name`: Application display name
- `app_description`: Application description
- `maintenance_mode`: Put app in maintenance mode
- `allow_registration`: Allow new user signups

### Email Settings
- `smtp_host`: Email server hostname
- `smtp_port`: Email server port
- `smtp_user`: SMTP username
- `smtp_password`: SMTP password (encrypted)
- `email_notifications`: Enable email notifications

### Security Settings
- `force_admin_2fa`: Require 2FA for admin users
- `session_timeout`: Session timeout in minutes
- `auto_logout`: Enable automatic logout
- `password_min_length`: Minimum password length

### Notification Settings
- `system_alerts`: Enable system alerts
- `user_notifications`: Enable user notifications  
- `admin_notifications`: Enable admin notifications

### Theme Settings
- `primary_color`: Primary theme color (hex)
- `dark_mode`: Enable dark mode

## API Endpoints

### GET /api/admin/settings
Fetch all system settings (admin only)

**Query Parameters:**
- `category` (optional): Filter by category

**Response:**
```json
{
  "settings": {
    "app_name": {
      "value": "Leaniverse.co",
      "category": "general",
      "description": "Application name",
      "updated_at": "2025-01-09T..."
    }
  }
}
```

### PUT /api/admin/settings
Update system settings (admin only)

**Request Body:**
```json
{
  "settings": {
    "app_name": "New App Name",
    "maintenance_mode": true,
    "smtp_host": "smtp.example.com"
  }
}
```

**Response:**
```json
{
  "message": "Settings updated successfully",
  "updated_count": 3
}
```

### POST /api/admin/settings
Perform actions like testing email connection

**Request Body:**
```json
{
  "action": "test_email",
  "smtp_host": "smtp.example.com",
  "smtp_port": 587,
  "smtp_user": "user@example.com",
  "smtp_password": "password"
}
```

## Security Features

### Row Level Security (RLS)
- All users can **read** system settings
- Only **admin users** can modify settings
- Automatic user authentication checking

### Data Validation
- JSON schema validation on values
- Type checking for numeric values
- Required field validation

### Audit Trail
- `created_at` and `updated_at` timestamps
- Automatic timestamp updates on changes

## Using Settings in Your App

### Frontend (React)
```typescript
// Fetch settings
const response = await fetch('/api/admin/settings')
const { settings } = await response.json()

// Use setting
const appName = JSON.parse(settings.app_name.value)
```

### Backend (API Routes)
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: settings } = await supabase
  .from('system_settings')
  .select('key, value')
  .eq('key', 'maintenance_mode')
  .single()

const maintenanceMode = JSON.parse(settings.value)
```

## Best Practices

### 1. Environment Variables vs Settings
- **Environment Variables**: API keys, database URLs, secrets
- **System Settings**: App configuration, feature flags, UI preferences

### 2. Data Types
- Store all values as JSON strings for flexibility
- Parse values when retrieving: `JSON.parse(setting.value)`
- Validate types in your application logic

### 3. Caching
Consider implementing caching for frequently accessed settings:
```typescript
// Simple in-memory cache
const settingsCache = new Map()

async function getSetting(key: string) {
  if (!settingsCache.has(key)) {
    // Fetch from database
    const setting = await fetchSetting(key)
    settingsCache.set(key, setting)
  }
  return settingsCache.get(key)
}
```

### 4. Default Values
Always provide sensible defaults in your code:
```typescript
const maintenanceMode = settings?.maintenance_mode 
  ? JSON.parse(settings.maintenance_mode.value) 
  : false
```

## Troubleshooting

### Common Issues

1. **Settings not loading**
   - Check RLS policies are enabled
   - Verify user has admin role
   - Check network requests in browser dev tools

2. **Settings not saving**
   - Verify admin permissions
   - Check API route authentication
   - Review server logs for errors

3. **JSON parsing errors**
   - Ensure values are properly JSON encoded
   - Check for special characters in strings
   - Validate JSON structure

### Debug Commands

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'system_settings';

-- View raw setting values
SELECT key, value, pg_typeof(value) FROM system_settings;

-- Check user permissions
SELECT id, role FROM profiles WHERE id = 'user-uuid';
```

## Future Enhancements

1. **Setting Groups**: Organize related settings
2. **Setting Validation**: Server-side validation rules
3. **Setting History**: Track changes over time
4. **Import/Export**: Backup and restore settings
5. **Setting Templates**: Predefined configurations
6. **Real-time Updates**: Live setting changes via WebSockets