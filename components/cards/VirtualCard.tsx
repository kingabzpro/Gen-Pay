'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCardNumber, formatExpiryDate, maskCardNumber } from '@/lib/utils/format-currency';
import { CreditCard, MoreHorizontal, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VirtualCardProps {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  status: string;
  isFrozen?: boolean;
  onFreeze?: () => void;
  onUnfreeze?: () => void;
  onDelete?: () => void;
}

export function VirtualCard({
  id,
  cardNumber,
  cardHolderName,
  expiryMonth,
  expiryYear,
  status,
  isFrozen = false,
  onFreeze,
  onUnfreeze,
  onDelete,
}: VirtualCardProps) {
  const [showFullNumber, setShowFullNumber] = useState(false);

  const cardStyles: Record<string, { bg: string; badge: string }> = {
    active: { 
      bg: 'bg-gradient-to-br from-amber-600 to-orange-700',
      badge: 'bg-green-500 text-white'
    },
    inactive: { 
      bg: 'bg-gradient-to-br from-gray-500 to-gray-700',
      badge: 'bg-muted text-muted-foreground'
    },
    frozen: { 
      bg: 'bg-gradient-to-br from-slate-600 to-slate-800',
      badge: 'bg-yellow-600 text-white'
    },
    blocked: { 
      bg: 'bg-gradient-to-br from-slate-700 to-slate-900',
      badge: 'bg-destructive text-destructive-foreground'
    },
  };

  const isActive = status === 'active';

  return (
    <Card className="relative overflow-hidden bg-background border border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">
          <div className="flex items-center gap-2.5">
            <CreditCard className="h-4 w-4" />
            <span>Virtual Card</span>
          </div>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isFrozen ? (
              <DropdownMenuItem onClick={onUnfreeze}>
                Unfreeze Card
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={onFreeze}>
                Freeze Card
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Delete Card
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className={`${cardStyles[status]?.bg || cardStyles.active.bg} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden`}>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <CreditCard className="h-5 w-5 opacity-80" />
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">Virtual</span>
                <span className={`text-xs px-2.5 py-1 rounded-full ${cardStyles[status]?.badge}`}>
                  {status}
                </span>
              </div>
            </div>

            <div className="font-mono text-2xl tracking-[0.15em] flex items-center justify-between">
              {showFullNumber ? (
                <span>{formatCardNumber(cardNumber)}</span>
              ) : (
                <span>{maskCardNumber(cardNumber)}</span>
              )}
              <button
                type="button"
                onClick={() => setShowFullNumber(!showFullNumber)}
                className="hover:bg-white/20 p-1.5 rounded-md transition-all"
              >
                {showFullNumber ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider opacity-80">Card Holder</p>
                <p className="text-base font-semibold uppercase tracking-wide">{cardHolderName}</p>
              </div>
              <div className="text-right space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider opacity-80">Expires</p>
                <p className="text-base font-semibold">{formatExpiryDate(expiryMonth, expiryYear)}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
                  <span className="font-bold text-sm">M</span>
                </div>
                <span className="text-xs font-medium opacity-90">Debit</span>
              </div>
              <div className="flex items-center gap-1 opacity-90">
                <div className="w-6 h-4 rounded-full bg-white/20" />
                <div className="w-6 h-4 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Virtual Card</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              status === 'active'
                ? 'bg-primary text-primary-foreground'
                : status === 'frozen'
                ? 'bg-yellow-600 text-white'
                : 'bg-destructive text-destructive-foreground'
            }`}>
              {status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
