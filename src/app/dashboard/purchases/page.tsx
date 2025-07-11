'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/currency'
import { 
  Loader2, 
  AlertCircle, 
  Package, 
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react'

interface Purchase {
  id: string
  access_granted: boolean
  access_expires_at: string | null
  created_at: string
  product: {
    id: string
    name: string
    description: string | null
    short_description: string | null
  } | null
  transaction: {
    id: string
    amount: number
    currency: string
    status: string
    created_at: string
  } | null
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/purchases')
      const result = await response.json()

      if (response.ok) {
        setPurchases(result.purchases || [])
      } else {
        setError(result.error || 'Failed to fetch purchases')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAccessStatus = (purchase: Purchase) => {
    if (!purchase.access_granted) {
      return { status: 'No Access', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }

    if (purchase.access_expires_at) {
      const expiryDate = new Date(purchase.access_expires_at)
      const now = new Date()
      
      if (now > expiryDate) {
        return { status: 'Expired', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
      } else {
        return { status: 'Active Subscription', color: 'bg-green-100 text-green-800', icon: CheckCircle }
      }
    }

    return { status: 'Lifetime Access', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Purchases</h1>
            <p className="text-gray-600">View your purchase history and manage your access.</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Purchases</h1>
            <p className="text-gray-600">View your purchase history and manage your access.</p>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchPurchases}>
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Purchases</h1>
        <p className="text-gray-600">View your purchase history and manage your access.</p>
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't made any purchases yet. Browse our products to get started.
              </p>
              <Button asChild>
                <a href="/products">
                  Browse Products
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {purchases.map((purchase) => {
            const accessStatus = getAccessStatus(purchase)
            const StatusIcon = accessStatus.icon
            
            return (
              <Card key={purchase.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        {purchase.product?.name || 'Product Not Found'}
                      </CardTitle>
                      {purchase.product?.short_description && (
                        <CardDescription>
                          {purchase.product.short_description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge className={accessStatus.color}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {accessStatus.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Purchase Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Purchase Information</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Purchase Date:</span>
                          <span>{formatDate(purchase.created_at)}</span>
                        </div>
                        {purchase.transaction && (
                          <>
                            <div className="flex justify-between">
                              <span>Amount Paid:</span>
                              <span className="font-medium">
                                {formatCurrency(purchase.transaction.amount, purchase.transaction.currency)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Transaction Status:</span>
                              <Badge variant={purchase.transaction.status === 'succeeded' ? 'default' : 'secondary'}>
                                {purchase.transaction.status}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Access Information</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Access Status:</span>
                          <span className={`font-medium ${purchase.access_granted ? 'text-green-600' : 'text-red-600'}`}>
                            {purchase.access_granted ? 'Granted' : 'Not Granted'}
                          </span>
                        </div>
                        {purchase.access_expires_at && (
                          <div className="flex justify-between">
                            <span>Expires On:</span>
                            <span>{formatDate(purchase.access_expires_at)}</span>
                          </div>
                        )}
                        {!purchase.access_expires_at && purchase.access_granted && (
                          <div className="flex justify-between">
                            <span>Access Type:</span>
                            <span className="text-blue-600 font-medium">Lifetime</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Product Description */}
                  {purchase.product?.description && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Product Description</h4>
                      <p className="text-sm text-gray-600">{purchase.product.description}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t pt-4 flex gap-2">
                    {purchase.product && (
                      <Button variant="outline" asChild>
                        <a href={`/products/${purchase.product.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Product
                        </a>
                      </Button>
                    )}
                    
                    {purchase.access_granted && (
                      <Button asChild>
                        <a href={`/products/${purchase.product?.id}/access`}>
                          Access Content
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary Card */}
      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Purchase Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{purchases.length}</div>
                <div className="text-sm text-gray-600">Total Purchases</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {purchases.filter(p => p.access_granted).length}
                </div>
                <div className="text-sm text-gray-600">Active Access</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {purchases.filter(p => p.access_granted && !p.access_expires_at).length}
                </div>
                <div className="text-sm text-gray-600">Lifetime Access</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  )
}