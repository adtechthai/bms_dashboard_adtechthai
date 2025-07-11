import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// DEBUG - Check raw product data
export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch raw data to debug
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        public_visible,
        active,
        prices (
          id,
          unit_amount,
          currency,
          type,
          interval,
          interval_count,
          active
        )
      `)
      .eq('public_visible', true)
      .eq('active', true)

    if (error) {
      console.error('Debug error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      products: products || [],
      count: products?.length || 0,
      debug: true
    })
  } catch (error) {
    console.error('Debug products error:', error)
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 })
  }
}