'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRelatedCards } from '@/hooks/api/useEncyclopedia';

import { CardThumbnail } from './CardThumbnail';

export interface RelatedCardsProps {
  slug: string;
}

export function RelatedCards({ slug }: RelatedCardsProps) {
  const { data: cards, isLoading } = useRelatedCards(slug);

  if (isLoading) {
    return (
      <Card data-testid="related-cards-skeleton" className="p-6">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="aspect-[2/3]" />
          <Skeleton className="aspect-[2/3]" />
          <Skeleton className="aspect-[2/3]" />
        </div>
      </Card>
    );
  }

  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <Card data-testid="related-cards" className="p-6">
      <h3 className="mb-4 font-serif text-lg">Cartas Relacionadas</h3>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {cards.map((card) => (
          <CardThumbnail key={card.id} card={card} />
        ))}
      </div>
    </Card>
  );
}
