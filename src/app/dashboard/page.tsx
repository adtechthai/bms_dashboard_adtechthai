'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Activity, Users, TrendingUp, DollarSign, Shield } from 'lucide-react'

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()
          
          setIsAdmin(profile?.role === 'admin')
        } catch (error) {
          console.warn('Error checking admin status:', error)
          setIsAdmin(false)
        }
      }
    }

    checkAdminStatus()
  }, [supabase])

  const stats = [
    {
      name: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: Users,
    },
    {
      name: 'Active Sessions',
      value: '567',
      change: '+8%',
      icon: Activity,
    },
    {
      name: 'Growth Rate',
      value: '23.4%',
      change: '+4.2%',
      icon: TrendingUp,
    },
    {
      name: 'Revenue',
      value: '$12,345',
      change: '+18%',
      icon: DollarSign,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your LeaniOS dashboard</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600">
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Profile updated</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Settings changed</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <p className="font-medium">Update Profile</p>
                  <p className="text-sm text-gray-500">Manage your personal information</p>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-gray-500">Update your account security</p>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <p className="font-medium">View Settings</p>
                  <p className="text-sm text-gray-500">Configure your preferences</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Panel Access */}
        {isAdmin && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-700">
                <Shield className="h-5 w-5" />
                <span>Admin Panel</span>
              </CardTitle>
              <CardDescription>
                You have administrator privileges. Access the admin panel to manage users and system settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Shield className="mr-2 h-4 w-4" />
                  Go to Admin Panel
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}