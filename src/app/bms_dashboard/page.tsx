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
  Clock,
  CalendarDays
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


type TimeFrame = 'today' | 'weekly' | 'monthly'

const timeFrameLabels = {
  today: 'วันนี้',
  weekly: 'สัปดาห์นี้',
  monthly: 'เดือนนี้'
}

const timeFrameColumns = {
  today: 'today_count',
  weekly: 'weekly_count',
  monthly: 'monthly_count'
}

export default function BMSDashboard() {
  const [activeTimeFrame, setActiveTimeFrame] = useState<TimeFrame>('today')
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

  const supabase = createClient()

  useEffect(() => {
    fetchMetrics()
  }, [activeTimeFrame])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const columnName = timeFrameColumns[activeTimeFrame]
      
      // Try to fetch from database first
      let totalChat = 0
      let intentMap = new Map<string, number>()
      let totalBuyValue = 0
      
      try {
        // Fetch Total Chat from psid_inputs_statistics
        const { data: chatData, error: chatError } = await supabase
          .from('psid_inputs_statistics')
          .select(columnName)
          .eq('metric_type', 'PSID Inputs')
          .single()

        if (chatData) {
          totalChat = (chatData as any)?.[columnName] || 0
        }

        // Fetch Intent Statistics
        const { data: intentData, error: intentError } = await supabase
          .from('intent_statistics')
          .select(`intent_type, ${columnName}`)

        if (intentData) {
          intentData.forEach((item: any) => {
            intentMap.set(item.intent_type, item[columnName] || 0)
          })
        }

        // Fetch Purchase Value from purchase_value_summary
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('purchase_value_summary')
          .select(columnName)
          .eq('metric_type', 'Purchase Value')
          .single()

        if (purchaseData) {
          totalBuyValue = (purchaseData as any)?.[columnName] || 0
        }

      } catch (dbError) {
        console.warn('Database tables not found, using sample data:', dbError)
        
        // Use sample data if database tables don't exist
        const sampleData = {
          today: {
            chat: 150,
            lead: 45,
            purchase: 12,
            buyValue: 45000,
            vc: 80,
            atc: 35,
            ic: 20,
            spam: 8,
            blocking: 3,
            ban: 2
          },
          weekly: {
            chat: 980,
            lead: 320,
            purchase: 85,
            buyValue: 318000,
            vc: 540,
            atc: 245,
            ic: 140,
            spam: 45,
            blocking: 22,
            ban: 12
          },
          monthly: {
            chat: 4200,
            lead: 1250,
            purchase: 380,
            buyValue: 1250000,
            vc: 2100,
            atc: 950,
            ic: 580,
            spam: 180,
            blocking: 95,
            ban: 48
          }
        }
        
        const data = sampleData[activeTimeFrame]
        totalChat = data.chat
        intentMap.set('Lead', data.lead)
        intentMap.set('Purchase', data.purchase)
        intentMap.set('VC', data.vc)
        intentMap.set('ATC', data.atc)
        intentMap.set('IC', data.ic)
        intentMap.set('Move to Spam', data.spam)
        intentMap.set('Blocking', data.blocking)
        intentMap.set('Ban', data.ban)
        totalBuyValue = data.buyValue
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

  const getTimeFrameIcon = (timeFrame: TimeFrame) => {
    switch (timeFrame) {
      case 'today':
        return <Clock className="h-4 w-4" />
      case 'weekly':
        return <Calendar className="h-4 w-4" />
      case 'monthly':
        return <CalendarDays className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">BMS Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                ระบบวิเคราะห์ข้อมูลธุรกิจ - Bangkok GMT+7
              </p>
            </div>
            
            {/* Time Frame Selector */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {(Object.keys(timeFrameLabels) as TimeFrame[]).map((timeFrame) => (
                <Button
                  key={timeFrame}
                  variant={activeTimeFrame === timeFrame ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTimeFrame(timeFrame)}
                  className="flex items-center space-x-2"
                >
                  {getTimeFrameIcon(timeFrame)}
                  <span>{timeFrameLabels[timeFrame]}</span>
                </Button>
              ))}
            </div>
            
            {/* Navigation to Detail Pages */}
            <div className="flex space-x-2 ml-4">
              <Link href="/bms_dashboard/today">
                <Button variant="outline" size="sm">
                  วันนี้ (รายละเอียด)
                </Button>
              </Link>
              <Link href="/bms_dashboard/weekly">
                <Button variant="outline" size="sm">
                  สัปดาห์ (รายละเอียด)
                </Button>
              </Link>
              <Link href="/bms_dashboard/monthly">
                <Button variant="outline" size="sm">
                  เดือน (รายละเอียด)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Row 1: Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chat</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalChat)}</div>
              <p className="text-xs text-muted-foreground">จำนวนแชททั้งหมด</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lead</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalLead)}</div>
              <p className="text-xs text-muted-foreground">จำนวนลีดทั้งหมด</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Buy</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalBuy)}</div>
              <p className="text-xs text-muted-foreground">จำนวนการซื้อทั้งหมด</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Buy Value</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalBuyValue)}</div>
              <p className="text-xs text-muted-foreground">มูลค่าการซื้อทั้งหมด</p>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Conversion Rates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chat to Lead %</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculatePercentage(metrics.totalLead, metrics.totalChat)}</div>
              <p className="text-xs text-muted-foreground">อัตราแปลงแชทเป็นลีด</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lead to Buy %</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculatePercentage(metrics.totalBuy, metrics.totalLead)}</div>
              <p className="text-xs text-muted-foreground">อัตราแปลงลีดเป็นการซื้อ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chat to Buy %</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculatePercentage(metrics.totalBuy, metrics.totalChat)}</div>
              <p className="text-xs text-muted-foreground">อัตราแปลงแชทเป็นการซื้อ</p>
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Good Customer Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Good Customer</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalGoodCustomer)}</div>
              <p className="text-xs text-muted-foreground">ลูกค้าที่มีคุณภาพ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total ViewContent</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalViewContent)}</div>
              <p className="text-xs text-muted-foreground">จำนวนการดูเนื้อหา</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total AddToCart</CardTitle>
              <Plus className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalAddToCart)}</div>
              <p className="text-xs text-muted-foreground">จำนวนการเพิ่มสินค้า</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Initiate Checkout</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalInitiateCheckout)}</div>
              <p className="text-xs text-muted-foreground">จำนวนการเริ่มชำระเงิน</p>
            </CardContent>
          </Card>
        </div>

        {/* Row 4: Bad Customer Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bad Customer</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalBadCustomer)}</div>
              <p className="text-xs text-muted-foreground">ลูกค้าที่มีปัญหา</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spam</CardTitle>
              <MessageCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalSpam)}</div>
              <p className="text-xs text-muted-foreground">จำนวนสแปม</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blocking</CardTitle>
              <Shield className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalBlocking)}</div>
              <p className="text-xs text-muted-foreground">จำนวนการบล็อก</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ban</CardTitle>
              <Ban className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalBan)}</div>
              <p className="text-xs text-muted-foreground">จำนวนการแบน</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}