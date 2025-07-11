import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Admin client with service role key
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Check if current user is admin
async function isCurrentUserAdmin() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    return profile?.role === 'admin'
  } catch {
    return false
  }
}

// GET - Fetch individual email logs
export async function GET(request: Request) {
  try {
    // Check if user is admin
    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = (page - 1) * limit
    const email = searchParams.get('email') // Filter by recipient email
    const status = searchParams.get('status') // Filter by status (success/failed)
    const campaignId = searchParams.get('campaignId') // Filter by campaign
    const search = searchParams.get('search') // Search in subject/body

    const adminClient = createAdminClient()

    // Build the query for email logs with sender and campaign info
    const query = `
      *,
      sender:sent_by (
        first_name,
        last_name,
        email
      ),
      campaign:email_campaign_recipients!inner (
        campaign_id,
        campaign:email_campaigns (
          id,
          subject,
          created_at
        )
      )
    `

    let emailLogsQuery = adminClient
      .from('email_logs')
      .select(query)

    // Apply filters
    if (email) {
      emailLogsQuery = emailLogsQuery.ilike('recipient_email', `%${email}%`)
    }

    if (status && ['success', 'failed'].includes(status)) {
      emailLogsQuery = emailLogsQuery.eq('status', status)
    }

    if (search) {
      emailLogsQuery = emailLogsQuery.or(`subject.ilike.%${search}%,body.ilike.%${search}%`)
    }

    if (campaignId) {
      emailLogsQuery = emailLogsQuery.eq('campaign.campaign_id', campaignId)
    }

    // Get total count for pagination  
    let countQuery = adminClient
      .from('email_logs')
      .select('*', { count: 'exact', head: true })

    // Apply the same filters for counting
    if (email) {
      countQuery = countQuery.ilike('recipient_email', `%${email}%`)
    }

    if (status && ['success', 'failed'].includes(status)) {
      countQuery = countQuery.eq('status', status)
    }

    if (search) {
      countQuery = countQuery.or(`subject.ilike.%${search}%,body.ilike.%${search}%`)
    }

    if (campaignId) {
      countQuery = countQuery.eq('campaign.campaign_id', campaignId)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting email logs:', countError)
      return NextResponse.json({ error: 'Failed to count email logs' }, { status: 500 })
    }

    // Get email logs with pagination
    const { data: emailLogs, error: logsError } = await emailLogsQuery
      .range(offset, offset + limit - 1)
      .order('sent_at', { ascending: false })

    if (logsError) {
      console.error('Error fetching email logs:', logsError)
      return NextResponse.json({ error: 'Failed to fetch email logs' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      emailLogs: emailLogs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error in email logs API:', error)
    return NextResponse.json({ 
      error: 'An unexpected error occurred' 
    }, { status: 500 })
  }
}