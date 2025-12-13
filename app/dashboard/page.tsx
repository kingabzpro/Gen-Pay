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
    <div className="min-h-screen bg-black">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-green-500" />
            <span className="text-2xl font-bold text-green-500">GEN-PAY</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-300 font-medium">
              Dashboard
            </Link>
            <Link href="/payments" className="text-gray-400 hover:text-green-500">
              Payments
            </Link>
            <Link href="/payments/create" className="text-gray-400 hover:text-green-500">
              Create Payment
            </Link>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">Logout</Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Prepaid Balance</CardTitle>
              <Wallet className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.balance.toFixed(2)}</div>
              <p className="text-xs text-gray-400">USDT Available</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Payments Today</CardTitle>
              <CreditCard className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.todayPayments}</div>
              <p className="text-xs text-gray-400">Transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.totalVolume.toFixed(2)}</div>
              <p className="text-xs text-gray-400">All time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/payments/create" className="block">
                <Button className="w-full justify-start bg-green-500 hover:bg-green-600 text-black">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Payment Link
                </Button>
              </Link>
              <Link href="/payments" className="block">
                <Button variant="outline" className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800">
                  View All Payments
                </Button>
              </Link>
              <Link href="/api-keys" className="block">
                <Button variant="outline" className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800">
                  Manage API Keys
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">Your latest transactions</CardDescription>
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
