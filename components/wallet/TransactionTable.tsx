"use client";

import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

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

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
}

export function TransactionTable({ transactions, loading }: TransactionTableProps) {
  if (loading) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>

      {transactions.length > 0 ? (
        <div className="space-y-2">
          {transactions.slice(0, 10).map((tx) => (
            <div
              key={tx.id}
              className="p-3 bg-white/5 rounded border border-white/10"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  {tx.type === 'send' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-green-500" />
                  )}
                  <Badge
                    variant={tx.type === 'send' ? 'destructive' : 'secondary'}
                    className={
                      tx.type === 'send'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-green-500/20 text-green-400'
                    }
                  >
                    {tx.type.toUpperCase()}
                  </Badge>
                </div>
                <span className="text-white font-bold">
                  {tx.amount_usdt.toFixed(2)} USDT
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <p className="text-gray-400">
                  {new Date(tx.created_at).toLocaleString()}
                </p>
                <Badge
                  variant="outline"
                  className={
                    tx.status === 'confirmed'
                      ? 'border-green-500/50 text-green-400'
                      : tx.status === 'pending'
                      ? 'border-yellow-500/50 text-yellow-400'
                      : 'border-green-500/50 text-green-400'
                  }
                >
                  {tx.status}
                </Badge>
              </div>
              {tx.tx_hash && (
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  {tx.tx_hash.substring(0, 20)}...
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No transactions yet</p>
      )}
    </GlassCard>
  );
}
