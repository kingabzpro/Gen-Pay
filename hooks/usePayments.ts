import { useState, useEffect } from 'react';
import { createPayment, getPayment, updatePayment, type Payment } from '@/lib/appwrite/database';

export function usePayments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPayment = async (id: string): Promise<void> => {
        try {
            const payment = await getPayment(id);
            setPayments(prev => {
                const existing = prev.find(p => p.$id === id);
                if (existing) {
                    return prev.map(p => p.$id === id ? payment : p);
                }
                return [payment, ...prev];
            });
        } catch (error) {
            console.error('Error fetching payment:', error);
        }
    };

    const createNewPayment = async (data: Omit<Payment, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | 'merchantId'> & { merchantId: string }): Promise<Payment> => {
        try {
            const payment = await createPayment(data);
            setPayments(prev => [payment, ...prev]);
            return payment;
        } catch (error: any) {
            console.error('Error creating payment:', error);
            throw new Error(error.message || 'Failed to create payment');
        }
    };

    const updatePaymentStatus = async (id: string, status: Payment['status'], txHash?: string): Promise<void> => {
        try {
            const updatedPayment = await updatePayment(id, { status, txHash });
            setPayments(prev => prev.map(p => p.$id === id ? updatedPayment : p));
        } catch (error: any) {
            console.error('Error updating payment:', error);
            throw new Error(error.message || 'Failed to update payment');
        }
    };

    return {
        payments,
        loading,
        fetchPayment,
        createPayment: createNewPayment,
        updatePayment: updatePaymentStatus,
    };
}
