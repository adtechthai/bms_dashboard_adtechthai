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

export async function GET() {
  try {
    // Check if user is admin
    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Use admin client to fetch all users
    const adminClient = createAdminClient()
    const { data: profiles, error } = await adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users: profiles || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { action, userId, ...data } = await request.json()
    const adminClient = createAdminClient()

    switch (action) {
      case 'promote':
        const { error: promoteError } = await adminClient
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', userId)
        
        if (promoteError) throw promoteError
        return NextResponse.json({ success: true, message: 'User promoted to admin' })

      case 'demote':
        const { error: demoteError } = await adminClient
          .from('profiles')
          .update({ role: 'user' })
          .eq('id', userId)
        
        if (demoteError) throw demoteError
        return NextResponse.json({ success: true, message: 'Admin privileges removed' })

      case 'disable':
        const { error: disableError } = await adminClient
          .from('profiles')
          .update({ is_disabled: true })
          .eq('id', userId)
        
        if (disableError) throw disableError
        return NextResponse.json({ success: true, message: 'User disabled' })

      case 'enable':
        const { error: enableError } = await adminClient
          .from('profiles')
          .update({ is_disabled: false })
          .eq('id', userId)
        
        if (enableError) throw enableError
        return NextResponse.json({ success: true, message: 'User enabled' })

      case 'delete':
        const { error: deleteError } = await adminClient
          .from('profiles')
          .delete()
          .eq('id', userId)
        
        if (deleteError) throw deleteError
        return NextResponse.json({ success: true, message: 'User deleted' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}