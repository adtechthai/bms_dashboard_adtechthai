# BMS Dashboard Setup Guide

## Overview
The BMS Dashboard displays business metrics for chat, leads, purchases, and customer behavior analytics. The dashboard works with or without the database tables - it shows sample data as a fallback.

## Quick Access from localhost:3000

The BMS Dashboard is now fully integrated with your application and can be accessed through multiple entry points:

### 🌐 **Public Access (Homepage)**
- Go to `http://localhost:3000`
- Click the "📊 BMS Dashboard - ดูแดชบอร์ดธุรกิจ" button in the hero section

### 👤 **User Dashboard Access**
- Go to `http://localhost:3000/dashboard` (requires login)
- Click "BMS Dashboard" in the sidebar navigation
- Or click your avatar → "BMS Dashboard" in the dropdown menu

### 🔑 **Admin Access**
- Go to `http://localhost:3000/admin` (requires admin login)
- Click "BMS Dashboard" in the admin sidebar navigation

### 🎯 **Direct Access**
- Go directly to `http://localhost:3000/bms_dashboard`
- Access any sub-page:
  - `http://localhost:3000/bms_dashboard/today`
  - `http://localhost:3000/bms_dashboard/weekly`
  - `http://localhost:3000/bms_dashboard/monthly`

## Database Setup (Optional)

If you want to use real data instead of sample data, you can create the required tables in your Supabase database:

### Step 1: Run the BMS Schema SQL

Execute the SQL script `schema-bms.sql` in your Supabase SQL editor:

```sql
-- Copy and run the contents of schema-bms.sql
-- This creates the required tables and sample data
```

### Step 2: Verify Tables Created

Check that these tables were created in your Supabase database:
- `psid_inputs_statistics`
- `intent_statistics` 
- `purchase_value_summary`

### Step 3: Test the Dashboard

1. Visit `/bms_dashboard` to see the main dashboard
2. Use the timeframe selector to switch between Today, Weekly, Monthly
3. Visit individual pages:
   - `/bms_dashboard/today` - Real-time daily metrics
   - `/bms_dashboard/weekly` - Weekly aggregated data
   - `/bms_dashboard/monthly` - Monthly aggregated data

## Features

### Main Dashboard (`/bms_dashboard`)
- Interactive timeframe selector
- Overview of all metrics
- Links to detailed pages
- Bangkok GMT+7 timezone support

### Detailed Pages
- **Today**: Auto-refreshes every minute, shows current day data
- **Weekly**: Shows week range, weekly aggregated data
- **Monthly**: Shows current month, monthly aggregated data

### Metrics Display (4 Rows)

**Row 1 - Core Business Metrics:**
- Total Chat: Total chat conversations
- Total Lead: Qualified leads generated
- Total Buy: Completed purchases
- Total Buy Value: Revenue from purchases (in Thai Baht)

**Row 2 - Conversion Rates:**
- Chat to Lead %: Conversion rate from chat to lead
- Lead to Buy %: Conversion rate from lead to purchase
- Chat to Buy %: Overall conversion rate from chat to purchase

**Row 3 - Positive Customer Actions:**
- Total Good Customer: Sum of all positive interactions
- Total ViewContent: Content viewing actions
- Total AddToCart: Items added to cart
- Total Initiate Checkout: Checkout processes started

**Row 4 - Negative Customer Actions:**
- Total Bad Customer: Sum of all negative interactions
- Total Spam: Spam reports
- Total Blocking: Blocked users
- Total Ban: Banned users

## Sample Data

If database tables don't exist, the dashboard automatically shows realistic sample data:

- **Today**: 150 chats, 45 leads, 12 purchases, ฿45,000 revenue
- **Weekly**: 980 chats, 320 leads, 85 purchases, ฿318,000 revenue  
- **Monthly**: 4,200 chats, 1,250 leads, 380 purchases, ฿1,250,000 revenue

## API Endpoints

The dashboard uses these API endpoints:
- `GET /api/bms/metrics?timeframe=today|weekly|monthly`

## Database Schema

### Table: psid_inputs_statistics
- `metric_type`: 'PSID Inputs'
- `today_count`, `weekly_count`, `monthly_count`: Integer counts

### Table: intent_statistics  
- `intent_type`: 'Lead', 'Purchase', 'VC', 'ATC', 'IC', 'Move to Spam', 'Blocking', 'Ban'
- `today_count`, `weekly_count`, `monthly_count`: Integer counts

### Table: purchase_value_summary
- `metric_type`: 'Purchase Value'
- `today_count`, `weekly_count`, `monthly_count`: Decimal amounts

## Customization

You can customize the dashboard by:
1. Updating the sample data in the fallback logic
2. Adding new metrics to the database tables
3. Modifying the calculation logic for conversion rates
4. Adding new intent types or metric types
5. Changing the color scheme or layout

## Troubleshooting

If you see "เกิดข้อผิดพลาดในการดึงข้อมูล" (Error fetching data), check:
1. Supabase connection is working
2. Database tables exist (or fallback to sample data)
3. User has proper permissions to access the tables
4. API endpoints are functioning correctly

The dashboard is designed to be resilient and will show sample data even if the database isn't set up yet.