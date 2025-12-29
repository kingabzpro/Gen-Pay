'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format-currency';

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
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transferType: 'internal' | 'external' | 'card_payment';
  estimatedArrival?: Date;
  createdAt: Date;
}

interface TransferListProps {
  fetchTransfers: () => Promise<Transfer[]>;
}

export function TransferList({ fetchTransfers }: TransferListProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTransfers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTransfers();
      setTransfers(data);
    } catch (error) {
      console.error('Failed to load transfers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      completed: 'bg-green-500 text-white',
      pending: 'bg-yellow-500 text-white',
      processing: 'bg-blue-500 text-white',
      failed: 'bg-red-500 text-white',
      cancelled: 'bg-gray-500 text-white',
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="h-4 w-4" />;
    }
    if (status === 'pending' || status === 'processing') {
      return <Clock className="h-4 w-4" />;
    }
    if (status === 'failed') {
      return <XCircle className="h-4 w-4" />;
    }
    if (status === 'cancelled') {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  const formatDate = (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse bg-muted/30 rounded-lg" />
        ))}
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg border-border">
        <p className="text-muted-foreground mb-4">No transfers yet</p>
        <p className="text-sm text-muted-foreground/70">
          Send money to other GEN-PAY users or external bank accounts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Transfer History</h2>
      <div className="space-y-3">
        {transfers.map((transfer) => (
          <div key={transfer.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={'flex items-center gap-2 mb-3 ' + getStatusColor(transfer.status)}>
                  {getStatusIcon(transfer.status)}
                </div>
                <div>
                  <div className="text-xs text-white font-medium capitalize">{transfer.status}</div>
                  <div className="text-xs text-white/70">{formatDate(transfer.createdAt)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm text-muted-foreground">
                      {transfer.transferType === 'internal' ? 'Internal' : 
                       transfer.transferType === 'card_payment' ? 'Card Payment' : 'External'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-lg font-bold text-white">
                      {formatCurrency(transfer.amount, transfer.fromCurrency)}
                    </p>
                  </div>
                </div>
              </div>
              {transfer.recipientEmail || transfer.recipientName ? (
                <div className="mt-3 pt-3 border-t border-border/50 bg-muted/30 rounded">
                  <div className="text-sm text-muted-foreground">Recipient</div>
                  <div className="font-medium">{transfer.recipientName || transfer.recipientEmail}</div>
                </div>
              ) : null}
            </div>

            {transfer.exchangeRate && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 bg-muted/30 rounded">
                <div>
                  <p className="text-xs text-muted-foreground">Exchange Rate</p>
                  <p className="text-sm font-medium text-muted-foreground">
                    1 {transfer.fromCurrency} = {transfer.exchangeRate.toFixed(4)} {transfer.toCurrency}
                  </p>
                </div>
                <div className="text-right">
                  {transfer.estimatedArrival ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated</p>
                      <p className="text-sm font-medium text-muted-foreground">{formatDate(transfer.estimatedArrival)}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {transfer.fee > 0 && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 bg-muted/30 rounded">
                <div>
                  <p className="text-xs text-muted-foreground">Fee</p>
                  <p className="text-sm font-medium text-muted-foreground">{formatCurrency(transfer.fee, transfer.fromCurrency)}</p>
                </div>
                <div className="text-right">
                  {transfer.reference ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Reference</p>
                      <p className="text-sm font-medium text-muted-foreground">{transfer.reference}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
