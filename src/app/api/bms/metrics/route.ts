import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get timeframe from query params
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'today'
    
    // Validate timeframe
    const validTimeframes = ['today', 'weekly', 'monthly']
    if (!validTimeframes.includes(timeframe)) {
      return NextResponse.json({ error: 'Invalid timeframe' }, { status: 400 })
    }

    const columnName = `${timeframe}_count`

    // Fetch PSID Inputs Statistics
    const { data: psidData, error: psidError } = await supabase
      .from('psid_inputs_statistics')
      .select(`id, metric_type, ${columnName}`)
      .eq('metric_type', 'PSID Inputs')
      .single()

    if (psidError) {
      console.error('Error fetching PSID data:', psidError)
      return NextResponse.json({ error: 'Failed to fetch PSID data' }, { status: 500 })
    }

    // Fetch Intent Statistics
    const { data: intentData, error: intentError } = await supabase
      .from('intent_statistics')
      .select(`id, intent_type, ${columnName}`)

    if (intentError) {
      console.error('Error fetching intent data:', intentError)
      return NextResponse.json({ error: 'Failed to fetch intent data' }, { status: 500 })
    }

    // Fetch Purchase Value Summary
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchase_value_summary')
      .select(`id, metric_type, ${columnName}`)
      .eq('metric_type', 'Purchase Value')
      .single()

    if (purchaseError) {
      console.error('Error fetching purchase data:', purchaseError)
      return NextResponse.json({ error: 'Failed to fetch purchase data' }, { status: 500 })
    }

    // Process and return the data
    const response = {
      timeframe,
      data: {
        psidInputs: psidData,
        intentStatistics: intentData,
        purchaseValue: purchaseData
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in BMS metrics API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}