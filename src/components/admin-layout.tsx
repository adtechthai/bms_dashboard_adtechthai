'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Shield,
  Users,
  Settings,
  CreditCard,
  Menu,
  LogOut,
  User,
  ArrowLeft,
  Package,
  Receipt,
  MessageSquare,
  Mail,
  History,
  MailOpen,
  BarChart3,
} from 'lucide-react'

interface User {
  id: string
  email?: string
  user_metadata?: {
    first_name?: string
    last_name?: string
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stripeIntegrationDialogOpen, setStripeIntegrationDialogOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        console.log('AdminLayout: Getting user data...')
        
        const { data: { user } } = await supabase.auth.getUser()
        console.log('AdminLayout: User data:', user)
        
        if (user) {
          setUser(user)
          // Since middleware has already verified admin access, we can trust the user is admin
          console.log('AdminLayout: User verified as admin by middleware, initializing admin panel')
          setIsAdmin(true)
        } else {
          console.log('AdminLayout: No user found, this should not happen due to middleware')
          router.push('/auth/sign-in')
        }
      } catch (error) {
        console.error('AdminLayout: Error getting user data:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    initializeAdmin()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/sign-in')
  }

  const adminNavItems = [
    { name: 'Admin Dashboard', href: '/admin', icon: Shield },
    { name: 'BMS Dashboard', href: '/bms_dashboard', icon: BarChart3 },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Messenger', href: '/admin/messenger', icon: MessageSquare },
    { name: 'Email History', href: '/admin/email-history', icon: History },
    { name: 'Email Logs', href: '/admin/email-logs', icon: MailOpen },
    { name: 'Email Config', href: '/admin/email-config', icon: Mail },
    { name: 'Products', href: '/admin/products', icon: Package, requiresStripe: true },
    { name: 'Transactions', href: '/admin/transactions', icon: Receipt },
    { name: 'Stripe Integration', href: '/admin/stripe', icon: CreditCard },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ]

  const checkStripeIntegration = async () => {
    try {
      const response = await fetch('/api/stripe/account')
      return response.ok
    } catch {
      return false
    }
  }

  const handleProductsClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    const isStripeIntegrated = await checkStripeIntegration()
    if (!isStripeIntegrated) {
      setStripeIntegrationDialogOpen(true)
    } else {
      router.push('/admin/products')
    }
  }

  const userInitials = (user?.user_metadata?.first_name?.[0] || '') + (user?.user_metadata?.last_name?.[0] || '') || user?.email?.[0]?.toUpperCase() || 'A'

  const Navigation = () => (
    <nav className="space-y-2">
      {adminNavItems.map((item) => {
        const Icon = item.icon
        const isStripeSection = item.href === '/admin/stripe'
        const isStripeActive = pathname.startsWith('/admin/stripe')
        
        return (
          <div key={item.name}>
            {item.requiresStripe ? (
              <button
                onClick={handleProductsClick}
                className={`w-full flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-red-50 ${
                  pathname === '/admin/products' || pathname.startsWith('/admin/products')
                    ? 'bg-red-100 text-red-900 border-l-4 border-red-500'
                    : 'text-gray-700 hover:text-red-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-red-50 ${
                  pathname === item.href
                    ? 'bg-red-100 text-red-900 border-l-4 border-red-500'
                    : 'text-gray-700 hover:text-red-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )}
            
          </div>
        )
      })}
    </nav>
  )

  // Show loading while checking admin status
  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 text-red-600 mx-auto mb-4 animate-pulse" />
          <p className="text-red-900">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Don't render admin layout for non-admin users
  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-red-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-red-50 border-r-2 border-red-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-600" />
              <div>
                <h1 className="text-xl font-bold text-red-900">Admin Panel</h1>
                <p className="text-xs text-red-600">LeaniOS Administration</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex-grow flex flex-col px-4">
            <div className="mb-4 pb-4 border-b border-red-200">
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to User Dashboard</span>
              </Link>
            </div>
            <Navigation />
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-red-50 border-b-2 border-red-200 px-4 py-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-red-50">
              <div className="py-4">
                <div className="flex items-center space-x-2 mb-6">
                  <Shield className="h-6 w-6 text-red-600" />
                  <div>
                    <h1 className="text-xl font-bold text-red-900">Admin Panel</h1>
                    <p className="text-xs text-red-600">LeaniOS Administration</p>
                  </div>
                </div>
                <div className="mb-4 pb-4 border-b border-red-200">
                  <Link 
                    href="/dashboard" 
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to User Dashboard</span>
                  </Link>
                </div>
                <Navigation />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <h1 className="text-lg font-semibold text-red-900">Admin Panel</h1>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
          <div className="relative flex h-16 items-center justify-between border-b-2 border-red-200 bg-red-50 px-4 sm:px-6 lg:px-0">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-red-600 lg:hidden" />
              <h2 className="text-lg font-semibold text-red-900">
                {pathname === '/admin/products' || pathname.startsWith('/admin/products')
                  ? 'Product Management'
                  : pathname === '/admin/stripe/products' 
                  ? 'Product Management'
                  : pathname === '/admin/transactions'
                  ? 'Transaction Management'
                  : adminNavItems.find(item => pathname === item.href)?.name || 'Admin Dashboard'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Administrator
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="" />
                      <AvatarFallback className="bg-red-100 text-red-900">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs leading-none text-red-600 font-medium">
                        Administrator
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      <span>User Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Stripe Integration Required Dialog */}
      <Dialog open={stripeIntegrationDialogOpen} onOpenChange={setStripeIntegrationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CreditCard className="h-5 w-5 text-red-600 mr-2" />
              Stripe Integration Required
            </DialogTitle>
            <DialogDescription>
              You need to set up Stripe integration before you can manage products. This allows you to create products, set pricing, and accept payments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <CreditCard className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    What you'll get with Stripe:
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Secure payment processing</li>
                      <li>Product and pricing management</li>
                      <li>Transaction tracking and reporting</li>
                      <li>Customer management</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={() => {
                setStripeIntegrationDialogOpen(false)
                router.push('/admin/stripe')
              }}
              className="w-full"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Go to Stripe Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}