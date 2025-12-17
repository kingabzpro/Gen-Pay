import { databases } from "./client"
import { Query, Permission, ID } from "appwrite"
import type { Models } from "appwrite"

export const DATABASE_ID = "genpay"
export const MERCHANTS_COLLECTION_ID = "merchants"
export const PAYMENTS_COLLECTION_ID = "payments"
export const WALLETS_COLLECTION_ID = "prepaid_wallets"
export const TRANSACTIONS_COLLECTION_ID = "transactions"

export interface Merchant extends Models.Document {
    userId: string
    businessName: string
    apiKey: string
    webhookUrl?: string
    createdAt: string
}

export interface Payment extends Models.Document {
    merchantId: string
    amount: number
    currency: string
    status: "pending" | "paid" | "failed"
    tronAddress?: string
    txHash?: string
    createdAt: string
}

export interface PrepaidWallet extends Models.Document {
    merchantId: string
    balance: number
    ledger: Array<{
        type: "credit" | "debit"
        amount: number
        txHash?: string
        timestamp: string
    }>
}

export interface Transaction extends Models.Document {
    merchantId: string
    type: "send" | "receive"
    amount: number
    currency: string
    status: "pending" | "completed" | "failed"
    fromAddress?: string
    toAddress: string
    txHash?: string
    description?: string
    createdAt: string
    completedAt?: string
}

// Merchant operations
export async function createMerchant(data: Omit<Merchant, '$id' | '$createdAt' | '$updatedAt' | '$permissions'>) {
    const response = await databases.createDocument(
        DATABASE_ID,
        MERCHANTS_COLLECTION_ID,
        ID.unique(),
        data,
        [
            Permission.read('any'),
            Permission.update(`user:${data.userId}`),
            Permission.delete(`user:${data.userId}`)
        ]
    );
    return response as Merchant;
}

export async function getMerchant(userId: string) {
    const response = await databases.listDocuments(
        DATABASE_ID,
        MERCHANTS_COLLECTION_ID,
        [Query.equal('userId', userId)]
    );
    return response.documents[0] as Merchant | undefined;
}

// Payment operations
export async function createPayment(data: Omit<Payment, '$id' | '$createdAt' | '$updatedAt' | '$permissions'>) {
    const response = await databases.createDocument(
        DATABASE_ID,
        PAYMENTS_COLLECTION_ID,
        ID.unique(),
        data,
        [Permission.read('any')]
    );
    return response as Payment;
}

export async function getPayment(id: string) {
    return await databases.getDocument(DATABASE_ID, PAYMENTS_COLLECTION_ID, id) as Payment;
}

export async function updatePayment(id: string, data: Partial<Payment>) {
    return await databases.updateDocument(DATABASE_ID, PAYMENTS_COLLECTION_ID, id, data) as Payment;
}

// Wallet operations
export async function getWallet(merchantId: string) {
    const response = await databases.listDocuments(
        DATABASE_ID,
        WALLETS_COLLECTION_ID,
        [Query.equal('merchantId', merchantId)]
    );
    return response.documents[0] as PrepaidWallet | undefined;
}

export async function updateWalletBalance(merchantId: string, balance: number) {
    const wallets = await getWallet(merchantId);
    if (!wallets) return null;

    return await databases.updateDocument(DATABASE_ID, WALLETS_COLLECTION_ID, wallets.$id, {
        balance
    }) as PrepaidWallet;
}

// Transaction operations
export async function createTransaction(data: Omit<Transaction, '$id' | '$createdAt' | '$updatedAt' | '$permissions'>) {
    const response = await databases.createDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        ID.unique(),
        data,
        [Permission.read('any')]
    );
    return response as Transaction;
}

export async function getTransactions(merchantId: string, limit = 50) {
    const response = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [
            Query.equal('merchantId', merchantId),
            Query.orderDesc('$createdAt'),
            Query.limit(limit)
        ]
    );
    return response.documents as Transaction[];
}
