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

  const currencyColors: Record<string, string> = {
    USD: 'from-blue-500 to-blue-600',
    EUR: 'from-purple-500 to-purple-600',
    GBP: 'from-red-500 to-red-600',
  };
 
  return (
    <Card 
      className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 group"
      onClick={() => {
        if (onSendMoney) onSendMoney();
      }}
    >
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
        <div className="flex items-center gap-2">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onReceiveMoney && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onReceiveMoney();
                }}
              >
                <ArrowDownLeft className="h-4 w-4 text-green-600" />
              </Button>
            )}
            {onSendMoney && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendMoney();
                }}
              >
                <ArrowUpRight className="h-4 w-4 text-blue-600" />
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0"
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
                  className="text-red-600"
                >
                  Close Account
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`bg-gradient-to-r ${currencyColors[currencyCode]} rounded-lg p-4 text-white mb-3`}>
          <div className="flex justify-between items-start mb-2">
            <Banknote className="h-6 w-6 opacity-80" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Balance</span>
          </div>
          <div className="text-3xl font-bold tracking-tight">
            {currencySymbols[currencyCode]}{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Account Number
        </p>
        <div className="text-sm font-mono bg-muted/50 rounded px-2 py-1 inline-block">
          {accountNumber}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              status === 'active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : status === 'frozen'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {status}
          </span>
          {isPrimary && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-500 dark:fill-yellow-400" />
              Primary
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
