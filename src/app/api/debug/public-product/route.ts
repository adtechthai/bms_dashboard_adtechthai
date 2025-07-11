import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test the exact same query as the public products API
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        short_description,
        slug,
        images,
        features,
        created_at,
        public_visible,
        active
      `)
      .eq('public_visible', true)
      .eq('active', true)

    console.log('Products query result:', { products, productsError })

    if (!products || products.length === 0) {
      return NextResponse.json({ 
        message: 'No public products found',
        products,
        productsError 
      })
    }

    // Fetch prices for found products
    const productIds = products.map(p => p.id)
    const { data: prices, error: pricesError } = await supabase
      .from('prices')
      .select(`
        id,
        product_id,
        unit_amount,
        currency,
        type,
        interval,
        interval_count,
        active
      `)
      .in('product_id', productIds)
      .eq('active', true)

    console.log('Prices query result:', { prices, pricesError })

    // Combine the data
    const result = products.map(product => ({
      ...product,
      images: product.images || [],
      features: product.features || [],
      prices: prices?.filter(price => price.product_id === product.id) || []
    }))

    return NextResponse.json({
      products: result,
      debug: {
        foundProducts: products.length,
        foundPrices: prices?.length || 0,
        productIds,
        productsError,
        pricesError
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}