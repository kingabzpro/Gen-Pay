"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Plus, ArrowLeft } from "lucide-react";

export default function PaymentsPage() {
  const payments: any[] = [];

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
            <Link href="/payments" className="text-gray-300 font-medium">
              Payments
            </Link>
            <Link href="/payments/create">
              <Button className="bg-green-500 hover:bg-green-600 text-black">New Payment</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center text-green-500 hover:underline mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">Payments</h1>
          </div>
          <Link href="/payments/create">
            <Button className="bg-green-500 hover:bg-green-600 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Create Payment
            </Button>
          </Link>
        </div>

        {payments.length === 0 ? (
          <Card className="bg-gray-900 border border-gray-800">
            <CardContent className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2 text-white">No payments yet</h3>
              <p className="text-gray-400 mb-6">
                Create your first payment link to start accepting USDT
              </p>
              <Link href="/payments/create">
                <Button className="bg-green-500 hover:bg-green-600 text-black">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Payment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">All Payments</CardTitle>
              <CardDescription className="text-gray-400">View and manage all your payment links</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-white">{payment.description}</p>
                      <p className="text-sm text-gray-400">{payment.amount} USDT</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === "paid"
                            ? "bg-green-900 text-green-300"
                            : payment.status === "pending"
                            ? "bg-yellow-900 text-yellow-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {payment.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
