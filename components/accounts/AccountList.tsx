'use client';
 
import { useState, useEffect } from 'react';
import { AccountCard } from './AccountCard';
import { CreateAccountModal } from './CreateAccountModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
 
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
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferType, setTransferType] = useState<'send' | 'receive'>('send');
  const { toast } = useToast();
 
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

  const handleSendMoney = (account: Account) => {
    setSelectedAccount(account);
    setTransferType('send');
    setShowTransferModal(true);
  };

  const handleReceiveMoney = (account: Account) => {
    setSelectedAccount(account);
    setTransferType('receive');
    setShowTransferModal(true);
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
            <div key={i} className="h-48 animate-pulse bg-muted/50 rounded-lg" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg border-border">
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
              onSendMoney={() => handleSendMoney(account)}
              onReceiveMoney={() => handleReceiveMoney(account)}
            />
          ))}
        </div>
      )}
 
      <CreateAccountModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateAccount={handleCreateAccount}
      />

      {showTransferModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTransferModal(false)}>
          <div 
            className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {transferType === 'send' ? 'Send Money' : 'Receive Money'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowTransferModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-2">Selected Account</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{selectedAccount.currencyCode} Account</p>
                  <p className="text-xs text-muted-foreground">{selectedAccount.accountNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {selectedAccount.currencyCode === 'USD' ? '$' : selectedAccount.currencyCode === 'EUR' ? '€' : '£'}
                    {(typeof selectedAccount.balance === 'number' && !isNaN(selectedAccount.balance) ? selectedAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00')}
                  </p>
                </div>
              </div>
            </div>

            {transferType === 'send' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Recipient Email</label>
                  <input 
                    type="email"
                    placeholder="recipient@example.com"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {selectedAccount.currencyCode === 'USD' ? '$' : selectedAccount.currencyCode === 'EUR' ? '€' : '£'}
                    </span>
                    <input 
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Reference (Optional)</label>
                  <input 
                    type="text"
                    placeholder="What's this for?"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Transfer feature will be available soon.",
                    });
                    setShowTransferModal(false);
                  }}
                >
                  Send Money
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your account details to receive money
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-2">Account Number</p>
                    <p className="text-lg font-mono font-semibold">{selectedAccount.accountNumber}</p>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedAccount.accountNumber);
                      toast({
                        title: "Copied!",
                        description: "Account number copied to clipboard",
                      });
                    }}
                  >
                    Copy Account Number
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
