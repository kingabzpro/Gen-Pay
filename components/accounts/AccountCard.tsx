'use client';
 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownLeft, ArrowUpRight, Banknote, MoreHorizontal, Star } from 'lucide-react';
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
  onSendMoney?: () => void;
  onReceiveMoney?: () => void;
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
  onSendMoney,
  onReceiveMoney,
}: AccountCardProps) {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const currencyColors: Record<string, { bg: string; text: string }> = {
    USD: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600' },
    EUR: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600' },
    GBP: { bg: 'from-red-500 to-red-600', text: 'text-red-600' },
  };
 
  return (
    <Card 
      className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group bg-background border border-border"
      onClick={() => {
        if (onSendMoney) onSendMoney();
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">
          <div className="flex items-center gap-2.5">
            <Banknote className="h-4 w-4" />
            <span>{currencyCode} Account</span>
            {isPrimary && (
              <Star className="h-3.5 w-3.5 text-foreground fill-foreground" />
            )}
          </div>
        </CardTitle>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onReceiveMoney && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onReceiveMoney();
                }}
              >
                <ArrowDownLeft className="h-4 w-4" />
              </Button>
            )}
            {onSendMoney && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendMoney();
                }}
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onSendMoney && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendMoney();
                  }}
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Send Money
                </DropdownMenuItem>
              )}
              {onReceiveMoney && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onReceiveMoney();
                  }}
                >
                  <ArrowDownLeft className="h-4 w-4 mr-2" />
                  Receive Money
                </DropdownMenuItem>
              )}
              {!isPrimary && onSetPrimary && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetPrimary();
                  }}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Set as Primary
                </DropdownMenuItem>
              )}
              {onClose && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="text-destructive"
                >
                  Close Account
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`bg-gradient-to-r ${currencyColors[currencyCode].bg} rounded-xl p-5 text-white shadow-lg`}>
          <div className="flex justify-between items-start mb-3">
            <Banknote className="h-6 w-6 opacity-90" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Balance</span>
          </div>
          <div className="text-4xl font-bold tracking-tight">
            {currencySymbols[currencyCode]}{(typeof balance === 'number' && !isNaN(balance) ? balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00')}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">Account Number</p>
          <div className="text-sm font-mono bg-muted/50 dark:bg-muted/30 rounded px-3 py-2 inline-block">
            {accountNumber}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              status === 'active'
                ? 'bg-primary text-primary-foreground'
                : status === 'frozen'
                ? 'bg-yellow-600 text-white'
                : 'bg-destructive text-destructive-foreground'
            }`}
          >
            {status}
          </span>
          {isPrimary && (
            <span className="text-xs font-medium flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1.5 rounded-full">
              <Star className="h-3 w-3 fill-foreground" />
              Primary
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
