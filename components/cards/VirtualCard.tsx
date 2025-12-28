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

  const cardColors: Record<string, string> = {
    active: 'bg-gradient-to-br from-green-500 to-green-700',
    inactive: 'bg-gradient-to-br from-gray-400 to-gray-500',
    frozen: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    blocked: 'bg-gradient-to-br from-red-400 to-red-600',
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Virtual Card</span>
          </div>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
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
              <DropdownMenuItem onClick={onDelete}>
                Delete Card
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className={`${cardColors[status] || cardColors.active} rounded-lg p-4 text-white mb-4`}>
          <div className="flex justify-between items-start mb-6">
            <CreditCard className="h-8 w-8 opacity-80" />
            <span className="text-xs font-medium uppercase opacity-80">Virtual</span>
          </div>
          <div className="font-mono text-lg mb-4 flex items-center gap-2">
            {showFullNumber ? (
              formatCardNumber(cardNumber)
            ) : (
              maskCardNumber(cardNumber)
            )}
            <button
              type="button"
              onClick={() => setShowFullNumber(!showFullNumber)}
              className="hover:opacity-80"
            >
              {showFullNumber ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs opacity-80 mb-1">CARD HOLDER</p>
              <p className="text-sm font-medium uppercase">{cardHolderName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80 mb-1">EXPIRES</p>
              <p className="text-sm font-medium">{formatExpiryDate(expiryMonth, expiryYear)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
