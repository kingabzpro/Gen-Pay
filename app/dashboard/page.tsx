"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Plus, Wallet, CreditCard, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [stats] = useState({
    balance: 0,
    todayPayments: 0,
    totalVolume: 0,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">GEN-PAY</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-900 font-medium">
              Dashboard
            </Link>
            <Link href="/payments" className="text-gray-600 hover:text-gray-900">
              Payments
            </Link>
            <Link href="/payments/create" className="text-gray-600 hover:text-gray-900">
              Create Payment
            </Link>
            <Button variant="outline">Logout</Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Prepaid Balance</CardTitle>
              <Wallet className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.balance.toFixed(2)}</div>
              <p className="text-xs text-gray-600">USDT Available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Payments Today</CardTitle>
              <CreditCard className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayPayments}</div>
              <p className="text-xs text-gray-600">Transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalVolume.toFixed(2)}</div>
              <p className="text-xs text-gray-600">All time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/payments/create" className="block">
                <Button className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Payment Link
                </Button>
              </Link>
              <Link href="/payments" className="block">
                <Button variant="outline" className="w-full justify-start">
                  View All Payments
                </Button>
              </Link>
              <Link href="/api-keys" className="block">
                <Button variant="outline" className="w-full justify-start">
                  Manage API Keys
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
                <p className="text-sm mt-2">Create your first payment to get started</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
