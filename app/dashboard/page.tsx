"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WalletDashboard } from '@/components/wallet/WalletDashboard';
import { TransactionTable } from '@/components/wallet/TransactionTable';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { WarningBadge } from '@/components/ui/warning-badge';
import { LogOut, Activity, Shield } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount_usdt: number;
  status: string;
  created_at: string;
  to_address?: string;
  from_address?: string;
  tx_hash?: string;
}

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Authentication Required
          </h2>
          <Link href="/login">
            <Button className="bg-red-600 hover:bg-red-700">
              Go to Login
            </Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">GEN-PAY</h1>
            <WarningBadge message="TRON TESTNET – CUSTODIAL WALLET" />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">{user?.email}</span>
            <Button
              variant="outline"
              onClick={logout}
              className="border-white/10 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <p className="text-gray-400">Welcome to your TRON wallet</p>
            <Shield className="w-4 h-4 text-red-500" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WalletDashboard />
          </div>

          <div>
            <TransactionTable transactions={transactions} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}
