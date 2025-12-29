'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AccountList } from '@/components/accounts/AccountList';
import { CardList } from '@/components/cards/CardList';
import { TransferList } from '@/components/transfers/TransferList';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, CreditCard } from 'lucide-react';

interface Account {
  id: string;
  currencyCode: 'USD' | 'EUR' | 'GBP';
  accountNumber: string;
  balance: number;
  status: string;
  isPrimary: boolean;
}

interface Card {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  status: string;
}

interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId?: string;
  recipientEmail?: string;
  recipientName?: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate?: number;
  fee: number;
  totalAmount: number;
  reference?: string;
  status: string;
  transferType: string;
  estimatedArrival?: Date;
  createdAt: Date;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'accounts' | 'cards' | 'transfers'>('accounts');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const fetchAccounts = async (): Promise<Account[]> => {
    try {
      const response = await fetch('/api/accounts');
      if (!response.ok) return [];
      const data = await response.json();
      return data.accounts?.map((a: any) => ({
        id: a.id,
        currencyCode: a.currencyCode,
        accountNumber: a.accountNumber,
        balance: a.balance,
        status: a.status,
        isPrimary: a.isPrimary,
      })) || [];
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <header className="bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">GEN-PAY</h1>
            <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
              Multi-Currency Banking
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-300">{user?.email}</span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button>
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-gray-400">Welcome to your multi-currency banking platform</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 'accounts'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Accounts
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 'cards'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Cards
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 'transfers'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Transfers
          </button>
        </div>

        {activeTab === 'accounts' && (
          <AccountList
            fetchAccounts={fetchAccounts}
            createAccount={async (data: any) => {
              const response = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              if (!response.ok) throw new Error('Failed to create account');
            }}
            closeAccount={async (id: string) => {
              const response = await fetch(`/api/accounts/${id}`, {
                method: 'DELETE',
              });
              if (!response.ok) throw new Error('Failed to close account');
            }}
            setPrimaryAccount={async (id: string) => {
              const response = await fetch(`/api/accounts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPrimary: true }),
              });
              if (!response.ok) throw new Error('Failed to set primary account');
            }}
          />
        )}

        {activeTab === 'cards' && (
          <CardList
            fetchAccounts={fetchAccounts}
            fetchCards={async () => {
              try {
                const response = await fetch('/api/cards');
                if (!response.ok) return [];
                const data = await response.json();
                return data.cards?.map((c: any) => ({
                  id: c.id,
                  cardNumber: c.cardNumber,
                  cardHolderName: c.cardHolderName,
                  expiryMonth: c.expiryMonth,
                  expiryYear: c.expiryYear,
                  status: c.status,
                })) || [];
              } catch (error) {
                console.error('Failed to fetch cards:', error);
                return [];
              }
            }}
            createCard={async (data: any) => {
              const response = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              if (!response.ok) throw new Error('Failed to create card');
            }}
            deleteCard={async (id: string) => {
              const response = await fetch(`/api/cards/${id}`, {
                method: 'DELETE',
              });
              if (!response.ok) throw new Error('Failed to delete card');
            }}
            freezeCard={async (id: string) => {
              const response = await fetch(`/api/cards/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'frozen' }),
              });
              if (!response.ok) throw new Error('Failed to freeze card');
            }}
            unfreezeCard={async (id: string) => {
              const response = await fetch(`/api/cards/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active' }),
              });
              if (!response.ok) throw new Error('Failed to unfreeze card');
            }}
          />
        )}

        {activeTab === 'transfers' && (
          <TransferList fetchTransfers={async () => {
            try {
              const response = await fetch('/api/transfers');
              if (!response.ok) return [];
              const data = await response.json();
              return data.transfers?.map((t: any) => ({
                id: t.id,
                fromAccountId: t.fromAccountId,
                toAccountId: t.toAccountId,
                recipientEmail: t.recipientEmail,
                recipientName: t.recipientName,
                amount: parseFloat(t.amount),
                fromCurrency: t.fromCurrency,
                toCurrency: t.toCurrency,
                exchangeRate: t.exchangeRate ? parseFloat(t.exchangeRate) : undefined,
                fee: parseFloat(t.fee),
                totalAmount: parseFloat(t.total_amount),
                reference: t.reference,
                status: t.status,
                transferType: t.transfer_type,
                estimatedArrival: t.estimated_arrival ? new Date(t.estimated_arrival) : undefined,
                createdAt: new Date(t.created_at),
              })) || [];
            } catch (error) {
              console.error('Failed to load transfers:', error);
              return [];
            }
          }} />
        )}
      </main>
    </div>
  );
}
