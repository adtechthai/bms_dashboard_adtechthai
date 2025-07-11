import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5)

    // Check prices table
    const { data: prices, error: pricesError } = await supabase
      .from('prices')
      .select('*')
      .limit(5)

    return NextResponse.json({
      products: {
        data: products,
        error: productsError,
        count: products?.length || 0
      },
      prices: {
        data: prices,
        error: pricesError,
        count: prices?.length || 0
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}