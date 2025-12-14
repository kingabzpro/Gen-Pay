"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { ArrowLeft, Copy, Check } from "lucide-react"
import QRCode from "react-qr-code"

export default function PaymentDetailsPage({ params }: { params: { id: string } }) {
  const [copied, setCopied] = useState(false)
  const [payment] = useState({
    id: params.id,
    amount: 100,
    description: "Sample Payment",
    status: "pending",
    tronAddress: "TLsV52sRDL79HXGGm9yzwDeVJ2BKsQfdDx",
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
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
            <Link href="/wallet" className="text-muted-foreground hover:text-primary transition-colors">
              Wallet
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/payments" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Link>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Payment Details</CardTitle>
              <CardDescription className="text-muted-foreground">Share this link with your customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Payment Link</label>
                <div className="flex items-center mt-1 space-x-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/pay/${payment.id}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(`${window.location.origin}/pay/${payment.id}`)}
                    className="border-border hover:bg-secondary"
                  >
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Amount</label>
                <p className="text-2xl font-bold mt-1 text-foreground">{payment.amount} USDT</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <p className="mt-1 text-foreground">{payment.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <p className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
                    {payment.status}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Pay with USDT</CardTitle>
              <CardDescription className="text-muted-foreground">Send USDT to this address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background p-4 rounded-lg border border-border flex justify-center">
                <QRCode value={payment.tronAddress || ""} size={200} />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Tron Address</label>
                <div className="flex items-center mt-1 space-x-2">
                  <input
                    type="text"
                    value={payment.tronAddress}
                    readOnly
                    className="flex-1 px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(payment.tronAddress)}
                    className="border-border hover:bg-secondary"
                  >
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-secondary border border-border rounded-md p-4">
                <h4 className="font-medium mb-2 text-foreground">Instructions:</h4>
                <ol className="text-sm text-foreground space-y-1 list-decimal list-inside">
                  <li>Open your Tron wallet</li>
                  <li>Send exactly {payment.amount} USDT</li>
                  <li>Send to the address above or scan QR code</li>
                  <li>Wait for blockchain confirmation</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
