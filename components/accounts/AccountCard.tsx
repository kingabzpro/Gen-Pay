'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/format-currency';
import { Banknote, MoreHorizontal, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AccountCardProps {
  id: string;
  currencyCode: 'USD' | 'EUR' | 'GBP';
  accountNumber: string;
  balance: number;
  status: string;
  isPrimary: boolean;
  onClose?: () => void;
  onSetPrimary?: () => void;
}

export function AccountCard({
  id,
  currencyCode,
  accountNumber,
  balance,
  status,
  isPrimary,
  onClose,
  onSetPrimary,
}: AccountCardProps) {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            <span>{currencyCode} Account</span>
            {isPrimary && (
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            )}
          </div>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isPrimary && onSetPrimary && (
              <DropdownMenuItem onClick={onSetPrimary}>
                Set as Primary
              </DropdownMenuItem>
            )}
            {onClose && (
              <DropdownMenuItem onClick={onClose}>
                Close Account
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {currencySymbols[currencyCode]}{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {accountNumber}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              status === 'active'
                ? 'bg-green-100 text-green-800'
                : status === 'frozen'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {status}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
