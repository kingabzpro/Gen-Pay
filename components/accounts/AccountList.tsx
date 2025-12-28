'use client';

import { useState, useEffect } from 'react';
import { AccountCard } from './AccountCard';
import { CreateAccountModal } from './CreateAccountModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Account {
  id: string;
  currencyCode: 'USD' | 'EUR' | 'GBP';
  accountNumber: string;
  balance: number;
  status: string;
  isPrimary: boolean;
}

interface AccountListProps {
  fetchAccounts: () => Promise<Account[]>;
  createAccount: (data: any) => Promise<void>;
  closeAccount: (id: string) => Promise<void>;
  setPrimaryAccount: (id: string) => Promise<void>;
}

export function AccountList({
  fetchAccounts,
  createAccount,
  closeAccount,
  setPrimaryAccount,
}: AccountListProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreateAccount = async (data: any) => {
    await createAccount(data);
    await loadAccounts();
  };

  const handleCloseAccount = async (id: string) => {
    await closeAccount(id);
    await loadAccounts();
  };

  const handleSetPrimary = async (id: string) => {
    await setPrimaryAccount(id);
    await loadAccounts();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Accounts</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Account
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No accounts yet</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              {...account}
              onClose={() => handleCloseAccount(account.id)}
              onSetPrimary={() => handleSetPrimary(account.id)}
            />
          ))}
        </div>
      )}

      <CreateAccountModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
}
