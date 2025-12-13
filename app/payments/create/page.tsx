"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ArrowLeft } from "lucide-react"

export default function CreatePaymentPage() {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          description,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment")
      }

      const payment = await response.json()
      window.location.href = `/payments/${payment.id}`
    } catch (error) {
      console.error("Error creating payment:", error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">GEN-PAY</span>
          </div>
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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/dashboard" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Create Payment Link</CardTitle>
            <CardDescription className="text-muted-foreground">
              Generate a unique payment link for USDT payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium text-foreground">
                  Amount (USDT)
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-background"
                  required
                />
                <p className="text-xs text-muted-foreground">Enter the amount you want to receive in USDT</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description (Optional)
                </label>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Order #12345"
                  className="bg-background"
                />
              </div>

              <div className="bg-secondary border border-border rounded-md p-4">
                <h4 className="font-medium mb-2 text-foreground">How it works:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Generate a unique payment link</li>
                  <li>Customer sends USDT to the generated address</li>
                  <li>Payment is automatically confirmed on the blockchain</li>
                  <li>Receive instant notification when payment is complete</li>
                </ol>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Payment Link"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
