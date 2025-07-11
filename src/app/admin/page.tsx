'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp,
  CreditCard,
  Shield,
  Activity,
  Calendar,
  Loader2
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  adminUsers: number
  totalProducts: number
  activeProducts: number
  stripeConnected: boolean
  recentSignups: number
  platformStatus: 'active' | 'maintenance'
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/stats')
      const result = await response.json()

      if (response.ok) {
        setStats(result.stats)
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading admin overview...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-gray-600">Platform overview and key metrics</p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.adminUsers || 0} admin{(stats?.adminUsers || 0) !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeProducts || 0} active
              </p>
            </CardContent>
          </Card>

          {/* Stripe Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment System</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge className={stats?.stripeConnected ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                  {stats?.stripeConnected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Stripe integration
              </p>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.recentSignups || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <CardTitle>Platform Status</CardTitle>
              </div>
              <CardDescription>Current system health and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">System Status</span>
                <Badge className={stats?.platformStatus === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                  {stats?.platformStatus === 'active' ? 'Operational' : 'Maintenance'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payments</span>
                <Badge className={stats?.stripeConnected ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                  {stats?.stripeConnected ? 'Ready' : 'Setup Required'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Quick Actions</CardTitle>
              </div>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <a 
                  href="/admin/users" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Manage Users</span>
                  </div>
                  <span className="text-xs text-gray-500">{stats?.totalUsers || 0} users</span>
                </a>
                <a 
                  href="/admin/stripe/products" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Manage Products</span>
                  </div>
                  <span className="text-xs text-gray-500">{stats?.totalProducts || 0} products</span>
                </a>
                {!stats?.stripeConnected && (
                  <a 
                    href="/admin/stripe" 
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700">Setup Payments</span>
                    </div>
                    <span className="text-xs text-blue-600">Required</span>
                  </a>
                )}
                <a 
                  href="/admin/settings" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Activity className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">System Settings</span>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Platform Information</CardTitle>
            </div>
            <CardDescription>System details and version information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="font-medium text-gray-900">Version</p>
                <p className="text-gray-600">LeaniOS v1.0.0</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Framework</p>
                <p className="text-gray-600">Next.js 15 + React 19</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Database</p>
                <p className="text-gray-600">Supabase PostgreSQL</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}