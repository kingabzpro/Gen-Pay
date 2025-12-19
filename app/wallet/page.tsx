"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { Send, ArrowDownToLine, Wallet, Copy, Check, ArrowLeft, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useMerchant } from "@/hooks/useMerchant"
// import { tronUSDTService } from "@/lib/tron" // Commented out for build fix

interface WalletData {
  balance: number
  ledger: Array<{
    type: "credit" | "debit"
    amount: number
    txHash?: string
    timestamp: string
  }>
}

export default function WalletPage() {
  const { logout, isAuthenticated: authLoading } = useAuth()
  const { merchant, loading: merchantLoading } = useMerchant()
  const [activeTab, setActiveTab] = useState("send")
  const [sendAmount, setSendAmount] = useState("")
  const [sendAddress, setSendAddress] = useState("")
  const [receiveAmount, setReceiveAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [walletAddress] = useState("TLsV52sRDL79HXGGm9yzwDeVJ2BKsQfdDx")
  const [error, setError] = useState("")

  useEffect(() => {
    if (merchant && !merchantLoading && !authLoading) {
      fetchWalletData()
    }
  }, [merchant, merchantLoading, authLoading])

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/merchant/wallet')
      const data = await response.json()
      
      if (data.success) {
        setWalletData(data.wallet)
      } else {
        setError(data.error || 'Failed to fetch wallet data')
      }
    } catch (error) {
      console.error('Error fetching wallet:', error)
      setError('Failed to fetch wallet data')
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // if (!tronUSDTService.isValidTronAddress(sendAddress)) {
      //   throw new Error('Invalid Tron address')
      // }

      const response = await fetch('/api/merchant/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'send',
          amount: parseFloat(sendAmount),
          toAddress: sendAddress,
          fromAddress: walletAddress,
          description: 'USDT transfer from GenPay wallet'
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`Transaction created successfully! ID: ${data.transaction.id}`)
        setSendAmount("")
        setSendAddress("")
        await fetchWalletData() // Refresh wallet data
      } else {
        throw new Error(data.error || 'Transaction failed')
      }
    } catch (error: any) {
      console.error("Error sending USDT:", error)
      setError(error.message || "Failed to send USDT")
    } finally {
      setLoading(false)
    }
  }

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch('/api/merchant/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'receive',
          amount: parseFloat(receiveAmount),
          toAddress: walletAddress,
          description: 'USDT payment request'
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`Payment request created! ID: ${data.transaction.id}`)
        setReceiveAmount("")
      } else {
        throw new Error(data.error || 'Failed to create payment request')
      }
    } catch (error: any) {
      console.error("Error creating payment request:", error)
      setError(error.message || "Failed to create payment request")
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const balance = walletData?.balance || 0

  if (!walletData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size={32} showText={true} />
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/payments" className="text-muted-foreground hover:text-primary transition-colors">
              Payments
            </Link>
            <Link href="/wallet" className="text-foreground font-medium">
              Wallet
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">USDT Wallet</h1>
          <p className="text-muted-foreground mt-1">Send and receive USDT payments</p>
        </div>

        <Card className="mb-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground mb-1">Your Balance</p>
                <p className="text-4xl font-bold text-foreground">${balance.toFixed(2)}</p>
                <p className="text-sm text-primary mt-1">USDT</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-full">
                <Wallet className="h-10 w-10 text-primary" />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Your Wallet Address</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground font-mono">
                  {walletAddress}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyAddress}
                  className="border-border hover:bg-secondary"
                >
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card dark:bg-card border border-border">
            <TabsTrigger
              value="send"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
            >
              <Send className="mr-2 h-4 w-4" />
              Send USDT
            </TabsTrigger>
            <TabsTrigger
              value="receive"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
            >
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Receive USDT
            </TabsTrigger>
          </TabsList>

          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-800 text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <TabsContent value="send">
            <Card className="border-border dark:bg-card">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-card-foreground">Send USDT</CardTitle>
                <CardDescription className="text-muted-foreground dark:text-card-foreground/70">Transfer USDT to another wallet address</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSend} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="sendAddress" className="text-sm font-medium text-foreground">
                      Recipient Address
                    </label>
                    <Input
                      id="sendAddress"
                      type="text"
                      value={sendAddress}
                      onChange={(e) => setSendAddress(e.target.value)}
                      placeholder="TLsV52sRDL79HXGGm9yzwDeVJ2BKsQfdDx"
                      className="font-mono dark:bg-input dark:border-border"
                      required
                    />
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">Enter the Tron wallet address to send USDT to</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="sendAmount" className="text-sm font-medium text-foreground dark:text-foreground">
                      Amount (USDT)
                    </label>
                    <Input
                      id="sendAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={balance}
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0.00"
                      className="dark:bg-input dark:border-border"
                      required
                    />
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">Available balance: ${balance} USDT</p>
                  </div>

                  <div className="bg-accent/20 dark:bg-black border border-border rounded-md p-4">
                    <h4 className="font-medium mb-2 text-foreground">Transaction Details:</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="text-foreground font-medium">{sendAmount || "0.00"} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network Fee:</span>
                        <span className="text-foreground font-medium">~0.00 TRX</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-medium text-foreground">Total:</span>
                        <span className="text-foreground font-bold">{sendAmount || "0.00"} USDT</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send USDT"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receive">
            <Card className="border-border dark:bg-card">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-card-foreground">Receive USDT</CardTitle>
                <CardDescription className="text-muted-foreground dark:text-card-foreground/70">Create a payment link to receive USDT</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReceive} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="receiveAmount" className="text-sm font-medium text-foreground">
                      Amount (USDT)
                    </label>
                    <Input
                      id="receiveAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={receiveAmount}
                      onChange={(e) => setReceiveAmount(e.target.value)}
                      placeholder="0.00"
                      className="dark:bg-input dark:border-border"
                      required
                    />
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">Enter the amount you want to receive</p>
                  </div>

                  <div className="bg-accent/20 dark:bg-black border border-border rounded-md p-4">
                    <h4 className="font-medium mb-2 text-foreground">How it works:</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Enter the amount you want to receive</li>
                      <li>Generate a unique payment link</li>
                      <li>Share the link with the sender</li>
                      <li>Receive USDT directly to your wallet</li>
                    </ol>
                  </div>

                  <div className="bg-primary/10 border border-primary/30 dark:bg-primary/10 rounded-md p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/20 rounded-lg mt-1">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground dark:text-foreground mb-1">Direct Wallet Address</h4>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">
                          Or share your wallet address directly for any amount
                        </p>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 px-3 py-2 bg-background dark:bg-input border border-border rounded-md text-xs text-foreground font-mono">
                            {walletAddress}
                          </code>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={copyAddress}
                            className="border-border hover:bg-secondary dark:border-border dark:hover:bg-secondary"
                          >
                            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate Payment Link"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
