"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ArrowLeft, Copy, Check } from "lucide-react";
import QRCode from "react-qr-code";

export default function PaymentDetailsPage({ params }: { params: { id: string } }) {
  const [copied, setCopied] = useState(false);
  const [payment] = useState({
    id: params.id,
    amount: 100,
    description: "Sample Payment",
    status: "pending",
    tronAddress: "TLsV52sRDL79HXGGm9yzwDeVJ2BKsQfdDx",
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">GEN-PAY</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/payments" className="text-gray-600 hover:text-gray-900">
              Payments
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/payments" className="inline-flex items-center text-blue-600 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Link>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Share this link with your customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Link</label>
                <div className="flex items-center mt-1 space-x-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/pay/${payment.id}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(`${window.location.origin}/pay/${payment.id}`)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Amount</label>
                <p className="text-2xl font-bold mt-1">{payment.amount} USDT</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="mt-1">{payment.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {payment.status}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pay with USDT</CardTitle>
              <CardDescription>Send USDT to this address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 flex justify-center">
                <QRCode value={payment.tronAddress || ""} size={200} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Tron Address</label>
                <div className="flex items-center mt-1 space-x-2">
                  <input
                    type="text"
                    value={payment.tronAddress}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(payment.tronAddress)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium mb-2">Instructions:</h4>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Open your Tron wallet</li>
                  <li>Send exactly {payment.amount} USDT</li>
                  <li>Send to the address above or scan QR code</li>
                  <li>Wait for blockchain confirmation</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
