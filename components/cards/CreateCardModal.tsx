'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCard: (data: {
    accountId: string;
    cardHolderName: string;
    cardType: 'virtual' | 'physical';
    dailyLimit?: number;
    monthlyLimit?: number;
  }) => Promise<void>;
  accounts: Array<{ id: string; currencyCode: string; accountNumber: string }>;
}

export function CreateCardModal({
  open,
  onOpenChange,
  onCreateCard,
  accounts,
}: CreateCardModalProps) {
  const [accountId, setAccountId] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardType, setCardType] = useState<'virtual' | 'physical'>('virtual');
  const [dailyLimit, setDailyLimit] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onCreateCard({
        accountId,
        cardHolderName,
        cardType,
        dailyLimit: dailyLimit ? parseFloat(dailyLimit) : undefined,
        monthlyLimit: monthlyLimit ? parseFloat(monthlyLimit) : undefined,
      });
      onOpenChange(false);
      setAccountId('');
      setCardHolderName('');
      setCardType('virtual');
      setDailyLimit('');
      setMonthlyLimit('');
    } catch (error) {
      console.error('Failed to create card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Card</DialogTitle>
            <DialogDescription>
              Generate a virtual debit card for online purchases.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="account">Link Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.currencyCode} - {account.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardHolderName">Card Holder Name</Label>
              <Input
                id="cardHolderName"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardType">Card Type</Label>
              <Select value={cardType} onValueChange={(value: any) => setCardType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyLimit">Daily Limit (Optional)</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  step="0.01"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                  placeholder="1000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyLimit">Monthly Limit (Optional)</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  step="0.01"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  placeholder="10000.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
