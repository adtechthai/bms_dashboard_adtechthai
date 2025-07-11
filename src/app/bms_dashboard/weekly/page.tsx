'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  MessageSquare, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Plus,
  UserCheck,
  UserX,
  MessageCircle,
  Shield,
  Ban,
  Calendar,
  ArrowLeft
} from 'lucide-react'

interface MetricData {
  totalChat: number
  totalLead: number
  totalBuy: number
  totalBuyValue: number
  totalGoodCustomer: number
  totalViewContent: number
  totalAddToCart: number
  totalInitiateCheckout: number
  totalBadCustomer: number
  totalSpam: number
  totalBlocking: number
  totalBan: number
}

export default function BMSDashboardWeekly() {
  const [metrics, setMetrics] = useState<MetricData>({
    totalChat: 0,
    totalLead: 0,
    totalBuy: 0,
    totalBuyValue: 0,
    totalGoodCustomer: 0,
    totalViewContent: 0,
    totalAddToCart: 0,
    totalInitiateCheckout: 0,
    totalBadCustomer: 0,
    totalSpam: 0,
    totalBlocking: 0,
    totalBan: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [weekRange, setWeekRange] = useState<string>('')

  const supabase = createClient()

  useEffect(() => {
    calculateWeekRange()
    fetchMetrics()
  }, [])

  const calculateWeekRange = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // End of week (Saturday)
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    setWeekRange(`${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`)
  }

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use Bangkok timezone for weekly data
      const now = new Date()
      const bangkokTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
      
      // Try to fetch from database first, fallback to sample data
      let totalChat = 0
      let intentMap = new Map<string, number>()
      let totalBuyValue = 0
      
      try {
        // Fetch Total Chat from psid_inputs_statistics
        const { data: chatData } = await supabase
          .from('psid_inputs_statistics')
          .select('weekly_count')
          .eq('metric_type', 'PSID Inputs')
          .single()

        if (chatData) {
          totalChat = (chatData as any)?.weekly_count || 0
        }

        // Fetch Intent Statistics
        const { data: intentData } = await supabase
          .from('intent_statistics')
          .select('intent_type, weekly_count')

        if (intentData) {
          intentData.forEach((item: any) => {
            intentMap.set(item.intent_type, item.weekly_count || 0)
          })
        }

        // Fetch Purchase Value from purchase_value_summary
        const { data: purchaseData } = await supabase
          .from('purchase_value_summary')
          .select('weekly_count')
          .eq('metric_type', 'Purchase Value')
          .single()

        if (purchaseData) {
          totalBuyValue = (purchaseData as any)?.weekly_count || 0
        }

      } catch (dbError) {
        console.warn('Database tables not found, using sample data:', dbError)
        
        // Use sample data if database tables don't exist
        totalChat = 980
        intentMap.set('Lead', 320)
        intentMap.set('Purchase', 85)
        intentMap.set('VC', 540)
        intentMap.set('ATC', 245)
        intentMap.set('IC', 140)
        intentMap.set('Move to Spam', 45)
        intentMap.set('Blocking', 22)
        intentMap.set('Ban', 12)
        totalBuyValue = 318000
      }

      // Calculate metrics
      const totalLead = intentMap.get('Lead') || 0
      const totalBuy = intentMap.get('Purchase') || 0
      
      const totalViewContent = intentMap.get('VC') || 0
      const totalAddToCart = intentMap.get('ATC') || 0
      const totalInitiateCheckout = intentMap.get('IC') || 0
      const totalGoodCustomer = totalAddToCart + totalInitiateCheckout + totalLead + totalBuy + totalViewContent
      
      const totalSpam = intentMap.get('Move to Spam') || 0
      const totalBlocking = intentMap.get('Blocking') || 0
      const totalBan = intentMap.get('Ban') || 0
      const totalBadCustomer = totalSpam + totalBlocking + totalBan

      setMetrics({
        totalChat,
        totalLead,
        totalBuy,
        totalBuyValue,
        totalGoodCustomer,
        totalViewContent,
        totalAddToCart,
        totalInitiateCheckout,
        totalBadCustomer,
        totalSpam,
        totalBlocking,
        totalBan
      })

      setLastUpdated(bangkokTime.toLocaleString('th-TH', { 
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }))

    } catch (err) {
      console.error('Error fetching metrics:', err)
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const calculatePercentage = (numerator: number, denominator: number): string => {
    if (denominator === 0) return '0.00%'
    return ((numerator / denominator) * 100).toFixed(2) + '%'
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString('th-TH')
  }

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(num)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลสัปดาห์...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Button onClick={fetchMetrics} variant="outline">
            ลองใหม่
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Link href="/bms_dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    กลับ
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <h1 className="text-3xl font-bold text-gray-900">BMS Dashboard - สัปดาห์นี้</h1>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                ข้อมูลสัปดาห์: {weekRange} | อัปเดตล่าสุด: {lastUpdated} (เวลาไทย GMT+7)
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button onClick={fetchMetrics} variant="outline" size="sm">
                รีเฟรช
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Row 1: Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Total Chat</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{formatNumber(metrics.totalChat)}</div>
              <p className="text-xs text-blue-700">จำนวนแชททั้งหมดสัปดาห์นี้</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Total Lead</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{formatNumber(metrics.totalLead)}</div>
              <p className="text-xs text-green-700">จำนวนลีดสัปดาห์นี้</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Total Buy</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{formatNumber(metrics.totalBuy)}</div>
              <p className="text-xs text-purple-700">จำนวนการซื้อสัปดาห์นี้</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-900">Total Buy Value</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{formatCurrency(metrics.totalBuyValue)}</div>
              <p className="text-xs text-yellow-700">มูลค่าการซื้อสัปดาห์นี้</p>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Conversion Rates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-indigo-50 border-indigo-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-900">Chat to Lead %</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">{calculatePercentage(metrics.totalLead, metrics.totalChat)}</div>
              <p className="text-xs text-indigo-700">อัตราแปลงแชทเป็นลีดสัปดาห์นี้</p>
            </CardContent>
          </Card>

          <Card className="bg-teal-50 border-teal-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-900">Lead to Buy %</CardTitle>
              <TrendingUp className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-900">{calculatePercentage(metrics.totalBuy, metrics.totalLead)}</div>
              <p className="text-xs text-teal-700">อัตราแปลงลีดเป็นการซื้อสัปดาห์นี้</p>
            </CardContent>
          </Card>

          <Card className="bg-rose-50 border-rose-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-rose-900">Chat to Buy %</CardTitle>
              <TrendingUp className="h-4 w-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-900">{calculatePercentage(metrics.totalBuy, metrics.totalChat)}</div>
              <p className="text-xs text-rose-700">อัตราแปลงแชทเป็นการซื้อสัปดาห์นี้</p>
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Good Customer Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-900">Total Good Customer</CardTitle>
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{formatNumber(metrics.totalGoodCustomer)}</div>
              <p className="text-xs text-emerald-700">ลูกค้าที่มีคุณภาพสัปดาห์นี้</p>
            </CardContent>
          </Card>

          <Card className="bg-sky-50 border-sky-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-900">Total ViewContent</CardTitle>
              <Eye className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{formatNumber(metrics.totalViewContent)}</div>
              <p className="text-xs text-sky-700">จำนวนการดูเนื้อหาสัปดาห์นี้</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Total AddToCart</CardTitle>
              <Plus className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{formatNumber(metrics.totalAddToCart)}</div>
              <p className="text-xs text-orange-700">จำนวนการเพิ่มสินค้าสัปดาห์นี้</p>
            </CardContent>
          </Card>

          <Card className="bg-violet-50 border-violet-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-violet-900">Total Initiate Checkout</CardTitle>
              <ShoppingCart className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900">{formatNumber(metrics.totalInitiateCheckout)}</div>
              <p className="text-xs text-violet-700">จำนวนการเริ่มชำระเงินสัปดาห์นี้</p>
            </CardContent>
          </Card>
        </div>

        {/* Row 4: Bad Customer Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-red-50 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Total Bad Customer</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{formatNumber(metrics.totalBadCustomer)}</div>
              <p className="text-xs text-red-700">ลูกค้าที่มีปัญหาสัปดาห์นี้</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Total Spam</CardTitle>
              <MessageCircle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{formatNumber(metrics.totalSpam)}</div>
              <p className="text-xs text-amber-700">จำนวนสแปมสัปดาห์นี้</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-900">Total Blocking</CardTitle>
              <Shield className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatNumber(metrics.totalBlocking)}</div>
              <p className="text-xs text-slate-700">จำนวนการบล็อกสัปดาห์นี้</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Total Ban</CardTitle>
              <Ban className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalBan)}</div>
              <p className="text-xs text-gray-700">จำนวนการแบนสัปดาห์นี้</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}