import { useState, useEffect } from 'react';
import { createMerchant, getMerchant, type Merchant } from '@/lib/appwrite/database';
import { account } from '@/lib/appwrite/client';

export function useMerchant() {
    const [merchant, setMerchant] = useState<Merchant | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMerchant = async (): Promise<void> => {
        try {
            const user = await account.get();
            const userId = user.$id;
            const merchantData = await getMerchant(userId);
            setMerchant(merchantData || null);
        } catch (error) {
            console.error('Error fetching merchant:', error);
            setMerchant(null);
        } finally {
            setLoading(false);
        }
    };

    const registerMerchant = async (businessName: string, apiKey: string, webhookUrl?: string): Promise<void> => {
        try {
            const user = await account.get();
            const userId = user.$id;

            const newMerchant = await createMerchant({
                userId,
                businessName,
                apiKey,
                webhookUrl,
                createdAt: new Date().toISOString()
            });

            setMerchant(newMerchant);
        } catch (error: any) {
            console.error('Error creating merchant:', error);
            throw new Error(error.message || 'Failed to create merchant');
        }
    };

    useEffect(() => {
        fetchMerchant();
    }, []);

    return {
        merchant,
        loading,
        registerMerchant,
        refetch: fetchMerchant,
    };
}
