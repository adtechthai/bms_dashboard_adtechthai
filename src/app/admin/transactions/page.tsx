'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/currency'
import { 
  Loader2, 
  AlertCircle, 
  TrendingUp, 
  CreditCard,
  Users,
  Calendar,
  ExternalLink,
  RefreshCw,
  Star,
  Mail
} from 'lucide-react'

interface Transaction {
  id: string
  customer_user_id: string | null
  stripe_payment_intent_id: string
  amount: number
  currency: string
  status: 'succeeded' | 'failed' | 'canceled' | 'processing'
  payment_method_types: string[]
  created_at: string
  metadata: Record<string, any>
  product: {
    id: string
    name: string
  } | null
  price: {
    id: string
    type: 'one_time' | 'recurring'
    interval?: string
    interval_count?: number
  } | null
  user: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
  } | null
}

interface TransactionStats {
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  totalRevenue: number
  revenueByCurrency: Record<string, number>
  recentTransactions: number
  conversionRate: number
}

interface TransactionsData {
  transactions: Transaction[]
  stats: TransactionStats
}

export default function TransactionsPage() {
  const [data, setData] = useState<TransactionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await fetch('/api/admin/transactions')
      const result = await response.json()

      if (response.ok) {
        setData(result)
      } else {
        setError(result.error || 'Failed to fetch transactions')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-100 text-green-800">Succeeded</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'canceled':
        return <Badge variant="secondary">Canceled</Badge>
      case 'processing':
        return <Badge variant="outline">Processing</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatUser = (transaction: Transaction) => {
    // If user account exists, use profile data
    if (transaction.user) {
      const name = [transaction.user.first_name, transaction.user.last_name].filter(Boolean).join(' ')
      return name || transaction.user.email || 'User'
    }
    
    // Otherwise, check metadata for customer info
    const metadata = transaction.metadata || {}
    const customerEmail = metadata.customerEmail
    const customerFirstName = metadata.customerFirstName
    const customerLastName = metadata.customerLastName
    
    if (customerEmail) {
      const name = [customerFirstName, customerLastName].filter(Boolean).join(' ')
      return name || customerEmail
    }
    
    return 'Guest'
  }

  const getCustomerEmail = (transaction: Transaction) => {
    // If user account exists, use profile email
    if (transaction.user?.email) {
      return transaction.user.email
    }
    
    // Otherwise, check metadata for customer email
    const metadata = transaction.metadata || {}
    return metadata.customerEmail || null
  }

  const isNewUserAccount = (transaction: Transaction) => {
    const metadata = transaction.metadata || {}
    return metadata.userAccountCreated === true
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatPrice = (price: Transaction['price']) => {
    if (!price) return 'N/A'
    
    if (price.type === 'recurring') {
      const interval = price.interval_count === 1 
        ? price.interval 
        : `${price.interval_count} ${price.interval}s`
      return `Subscription (${interval})`
    }
    
    return 'One-time'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <p className="text-gray-600">Loading transaction data...</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <p className="text-gray-600">Manage and monitor all transactions in your system.</p>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => fetchTransactions()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </AdminLayout>
    )
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  const { transactions, stats } = data
  const primaryCurrency = Object.keys(stats.revenueByCurrency)[0] || 'usd'

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Manage and monitor all transactions in your system.</p>
        </div>
        <Button 
          onClick={() => fetchTransactions(true)}
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue, primaryCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.successfulTransactions} successful transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.conversionRate.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedTransactions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTransactions > 0 ? ((stats.failedTransactions / stats.totalTransactions) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            All payment transactions processed through your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600">Transactions will appear here once customers make purchases.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Transaction</th>
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm">{transaction.id.slice(0, 8)}...</p>
                            {(() => {
                              const metadata = transaction.metadata || {}
                              const isTestMode = metadata.livemode === false || metadata.stripeMode === 'test'
                              if (isTestMode) {
                                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Test</span>
                              }
                              return null
                            })()}
                          </div>
                          <p className="text-xs text-gray-500">
                            {(() => {
                              const types = transaction.payment_method_types || []
                              // Check metadata for actual payment method first
                              const metadata = transaction.metadata || {}
                              if (metadata.actualPaymentMethod) {
                                return metadata.actualPaymentMethod === 'promptpay' ? 'PromptPay' : 
                                       metadata.actualPaymentMethod === 'card' ? 'Card' : 
                                       metadata.actualPaymentMethod
                              }
                              // Fallback: prioritize specific payment methods
                              if (types.includes('promptpay')) return 'PromptPay'
                              if (types.includes('card')) return 'Card'
                              return types.join(', ')
                            })()}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{formatUser(transaction)}</p>
                            {isNewUserAccount(transaction) && (
                              <div title="New account created">
                                <Star className="h-3 w-3 text-green-500" />
                              </div>
                            )}
                          </div>
                          {getCustomerEmail(transaction) && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <p className="text-xs text-gray-500">{getCustomerEmail(transaction)}</p>
                            </div>
                          )}
                          {!transaction.customer_user_id && getCustomerEmail(transaction) && (
                            <Badge variant="outline" className="text-xs">Guest Purchase</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {transaction.product?.name || 'Product not found'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatPrice(transaction.price)}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{formatDate(transaction.created_at)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(
                            `https://dashboard.stripe.com/payments/${transaction.stripe_payment_intent_id}`,
                            '_blank'
                          )}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  )
}