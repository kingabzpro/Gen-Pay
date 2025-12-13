import { Databases } from "appwrite";
import { client } from "./client";

export const databases = new Databases(client);

export const DATABASE_ID = "genpay";
export const MERCHANTS_COLLECTION_ID = "merchants";
export const PAYMENTS_COLLECTION_ID = "payments";
export const WALLETS_COLLECTION_ID = "prepaid_wallets";

export interface Merchant {
  userId: string;
  businessName: string;
  apiKey: string;
  webhookUrl?: string;
  createdAt: string;
}

export interface Payment {
  merchantId: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  tronAddress?: string;
  txHash?: string;
  createdAt: string;
}

export interface PrepaidWallet {
  merchantId: string;
  balance: number;
  ledger: Array<{
    type: "credit" | "debit";
    amount: number;
    txHash?: string;
    timestamp: string;
  }>;
}
