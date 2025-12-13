"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ArrowLeft } from "lucide-react";

export default function CreatePaymentPage() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment");
      }

      const payment = await response.json();
      window.location.href = `/payments/${payment.id}`;
    } catch (error) {
      console.error("Error creating payment:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-green-500" />
            <span className="text-2xl font-bold text-green-500">GEN-PAY</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-400 hover:text-green-500">
              Dashboard
            </Link>
            <Link href="/payments" className="text-gray-400 hover:text-green-500">
              Payments
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/dashboard" className="inline-flex items-center text-green-500 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="bg-gray-900 border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Create Payment Link</CardTitle>
            <CardDescription className="text-gray-400">
              Generate a unique payment link for USDT payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium text-gray-300">
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
                  required
                  className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
                />
                <p className="text-xs text-gray-500">
                  Enter the amount you want to receive in USDT
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-300">
                  Description (Optional)
                </label>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Order #12345"
                  className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
                />
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                <h4 className="font-medium mb-2 text-white">How it works:</h4>
                <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Generate a unique payment link</li>
                  <li>Customer sends USDT to the generated address</li>
                  <li>Payment is automatically confirmed on the blockchain</li>
                  <li>Receive instant notification when payment is complete</li>
                </ol>
              </div>

              <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-black" disabled={loading}>
                {loading ? "Creating..." : "Create Payment Link"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
