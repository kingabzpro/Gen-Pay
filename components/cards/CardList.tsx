'use client';

import { useState, useEffect } from 'react';
import { VirtualCard } from './VirtualCard';
import { CreateCardModal } from './CreateCardModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Card {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  status: string;
}

interface CardListProps {
  fetchAccounts: () => Promise<any[]>;
  fetchCards: () => Promise<Card[]>;
  createCard: (data: any) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  freezeCard: (id: string) => Promise<void>;
  unfreezeCard: (id: string) => Promise<void>;
}

export function CardList({
  fetchAccounts,
  fetchCards,
  createCard,
  deleteCard,
  freezeCard,
  unfreezeCard,
}: CardListProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const [cardsData, accountsData] = await Promise.all([fetchCards(), fetchAccounts()]);
      setCards(cardsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleCreateCard = async (data: any) => {
    await createCard(data);
    await loadCards();
  };

  const handleDeleteCard = async (id: string) => {
    await deleteCard(id);
    await loadCards();
  };

  const handleFreezeCard = async (id: string) => {
    await freezeCard(id);
    await loadCards();
  };

  const handleUnfreezeCard = async (id: string) => {
    await unfreezeCard(id);
    await loadCards();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Virtual Cards</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Card
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse bg-white/5 rounded-lg" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg border-white/10">
          <p className="text-muted-foreground mb-4">No cards yet</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Card
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <VirtualCard
              key={card.id}
              {...card}
              isFrozen={card.status === 'frozen'}
              onFreeze={() => handleFreezeCard(card.id)}
              onUnfreeze={() => handleUnfreezeCard(card.id)}
              onDelete={() => handleDeleteCard(card.id)}
            />
          ))}
        </div>
      )}

      <CreateCardModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateCard={handleCreateCard}
        accounts={accounts.map((a) => ({
          id: a.id,
          currencyCode: a.currencyCode,
          accountNumber: a.accountNumber,
        }))}
      />
    </div>
  );
}
