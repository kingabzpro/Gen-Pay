"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wallet, Send, Download, AlertTriangle } from 'lucide-react';
import QRCode from 'react-qr-code';

interface WalletData {
  id: string;
  address: string;
  balanceUSDT: number;
  balanceTRX: number;
}

export function WalletDashboard() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [sending, setSending] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setError(null);
      const response = await fetch('/api/wallet/balance');
      const data = await response.json();

      if (data.success) {
        setWallet(data.wallet);
      } else {
        setError(data.error || 'Failed to fetch wallet');
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!sendAmount || !sendAddress) return;

    setSending(true);
    try {
      const response = await fetch('/api/wallet/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toAddress: sendAddress,
          amount: parseFloat(sendAmount)
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Transaction sent!');
        setSendAmount('');
        setSendAddress('');
        fetchWallet();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-48 bg-white/5 rounded-lg" />
        <div className="animate-pulse h-48 bg-white/5 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-white">My Wallet</h2>
          </div>
          {wallet && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              TRON Testnet
            </Badge>
          )}
        </div>

        {wallet ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">USDT Balance</p>
                <p className="text-3xl font-bold text-white">
                  {wallet.balanceUSDT.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">TRX Balance</p>
                <p className="text-3xl font-bold text-white">
                  {wallet.balanceTRX.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-black/40 rounded-lg p-4 mb-4">
              <p className="text-gray-400 text-xs mb-1">Wallet Address</p>
              <p className="text-white font-mono text-sm break-all">
                {wallet.address}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={wallet.address} size={150} />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-white mb-4">No wallet found</p>
            {error && (
              <div className="bg-red-900/50 border border-red-800 text-red-300 rounded-lg p-3 mb-4 text-sm">
                {error}
              </div>
            )}
            <Button
              onClick={async () => {
                try {
                  setCreatingWallet(true);
                  setError(null);
                  const response = await fetch('/api/wallet/create', { method: 'POST' });
                  const data = await response.json();

                  if (data.success) {
                    await fetchWallet();
                  } else {
                    setError(data.error || 'Failed to create wallet');
                  }
                } catch (error) {
                  console.error('Create wallet error:', error);
                  setError('Failed to connect to server');
                } finally {
                  setCreatingWallet(false);
                }
              }}
              className="bg-green-600 hover:bg-green-700"
              disabled={creatingWallet}
            >
              {creatingWallet ? 'Creating Wallet...' : 'Create Wallet'}
            </Button>
          </div>
        )}
      </GlassCard>

      {/* Send USDT Card */}
      {wallet && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Send className="w-5 h-5 mr-2 text-green-500" />
            Send USDT
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Recipient Address
              </label>
              <Input
                value={sendAddress}
                onChange={(e) => setSendAddress(e.target.value)}
                placeholder="T..."
                className="bg-black/40 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Amount (USDT)
              </label>
              <Input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.00"
                className="bg-black/40 border-white/10 text-white"
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={sending || !sendAmount || !sendAddress}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {sending ? 'Sending...' : 'Send USDT'}
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
