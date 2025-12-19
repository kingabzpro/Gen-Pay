"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { Plus, Wallet, CreditCard, TrendingUp, ArrowUpRight, Activity, Users, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useMerchant } from "@/hooks/useMerchant"

interface DashboardStats {
  balance: number
  todayPayments: number
  totalVolume: number
  activeLinks: number
  successRate: number
  pendingPayments: number
}

export default function DashboardPage() {
  const { logout, isAuthenticated: authLoading } = useAuth()
  const { merchant, loading: merchantLoading, error: merchantError } = useMerchant()
  const [stats, setStats] = useState<DashboardStats>({
    balance: 0,
    todayPayments: 0,
    totalVolume: 0,
    activeLinks: 0,
    successRate: 0,
    pendingPayments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (merchant) {
      fetchDashboardStats()
    }
  }, [merchant])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Fetch wallet data
      const walletResponse = await fetch('/api/merchant/wallet')
      const walletData = await walletResponse.json()
      
      // Fetch transactions
      const transactionsResponse = await fetch('/api/merchant/transactions')
      const transactionsData = await transactionsResponse.json()
      
      if (walletData.success && transactionsData.success) {
        const transactions = transactionsData.transactions || []
        const today = new Date().toDateString()
        
        // Calculate stats
        const todayTransactions = transactions.filter(t => 
          new Date(t.createdAt).toDateString() === today
        )
        const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0)
        const completedTransactions = transactions.filter(t => t.status === 'completed')
        const successRate = transactions.length > 0 
          ? (completedTransactions.length / transactions.length) * 100 
          : 0

        setStats({
          balance: walletData.wallet.balance || 0,
          todayPayments: todayTransactions.length,
          totalVolume,
          activeLinks: 0, // Will be implemented with payment links
          successRate: Math.round(successRate),
          pendingPayments: transactions.filter(t => t.status === 'pending').length,
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // If still loading auth, show loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show login prompt
  if (!merchant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to access your dashboard.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size={32} showText={true} />
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-foreground font-medium">
              Dashboard
            </Link>
            <Link href="/payments" className="text-muted-foreground hover:text-primary transition-colors">
              Payments
            </Link>
            <Link href="/wallet" className="text-muted-foreground hover:text-primary transition-colors">
              Wallet
            </Link>
            <Link href="/payments/create" className="text-muted-foreground hover:text-primary transition-colors">
              Create Payment
            </Link>
            <ThemeToggle />
            <Button 
              variant="outline" 
              className="border-border text-foreground hover:bg-secondary bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your payment overview.</p>
          </div>
          <Link href="/payments/create">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Create Payment
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Prepaid Balance</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${stats.balance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <span className="text-primary mr-1">USDT</span> Available
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Payments Today</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.todayPayments}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <ArrowUpRight className="h-3 w-3 text-primary mr-1" />
                Transactions processed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${stats.totalVolume.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">All time revenue</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Links</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.activeLinks}</div>
              <p className="text-xs text-muted-foreground mt-1">Payment links created</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Payment completion rate</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-muted-foreground">Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/payments/create" className="block">
                <Button className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Payment Link
                </Button>
              </Link>
              <Link href="/payments" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-secondary hover:text-primary bg-transparent"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  View All Payments
                </Button>
              </Link>
              <Link href="/api-keys" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-secondary hover:text-primary bg-transparent"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Manage API Keys
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription className="text-muted-foreground">Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <p className="text-foreground font-medium">No recent activity</p>
                <p className="text-sm mt-2 text-muted-foreground">Create your first payment to get started&apos;</p>
                <Link href="/payments/create" className="mt-4 inline-block">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get Started
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
