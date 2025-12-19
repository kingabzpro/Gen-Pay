import { useState, useEffect } from 'react';
import { createMerchant, getMerchant, type Merchant } from '@/lib/appwrite/database';
import { checkAuthStatus } from '@/lib/appwrite/auth';

export function useMerchant() {
    const [merchant, setMerchant] = useState<Merchant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMerchant = async (): Promise<void> => {
        try {
            setError(null);
            setLoading(true);
            
            // First check if user is authenticated
            const { isAuthenticated, user } = await checkAuthStatus();
            
            if (!isAuthenticated || !user) {
                setMerchant(null);
                return;
            }
            
            const userId = user.$id;
            const merchantData = await getMerchant(userId);
            setMerchant(merchantData || null);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch merchant data';
            console.error('Error fetching merchant:', error);
            setError(errorMessage);
            setMerchant(null);
        } finally {
            setLoading(false);
        }
    };

    const registerMerchant = async (businessName: string, apiKey: string, webhookUrl?: string): Promise<void> => {
        try {
            setError(null);
            
            // Check authentication first
            const { isAuthenticated, user } = await checkAuthStatus();
            
            if (!isAuthenticated || !user) {
                throw new Error('User must be authenticated to create merchant profile');
            }
            
            const userId = user.$id;

            const newMerchant = await createMerchant({
                userId,
                businessName,
                apiKey,
                webhookUrl,
                createdAt: new Date().toISOString()
            });

            setMerchant(newMerchant);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create merchant';
            console.error('Error creating merchant:', error);
            setError(errorMessage);
            throw error;
        }
    };

    useEffect(() => {
        fetchMerchant();
    }, []);

    return {
        merchant,
        loading,
        error,
        registerMerchant,
        refetch: fetchMerchant,
        isAuthenticated: !!merchant || !loading,
    };
}
