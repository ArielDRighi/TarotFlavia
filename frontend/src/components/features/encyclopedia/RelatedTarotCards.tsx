'use client';

import type { ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { useCards } from '@/hooks/api/useEncyclopedia';
import { ROUTES } from '@/lib/constants/routes';
import type { CardSummary } from '@/types/encyclopedia.types';

import { CardThumbnail } from './CardThumbnail';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RelatedTarotCardsProps {
  /** IDs of the tarot cards related to the article. */
  cardIds: number[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GRID_CLASSES = 'grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6';

// ─── Sub-components ───────────────────────────────────────────────────────────

function RelatedTarotCardsSection({ children }: { children: ReactNode }) {
  return (
    <section data-testid="related-tarot-cards" className="space-y-4">
      <h2 className="text-foreground text-xl font-bold">Cartas de Tarot Relacionadas</h2>
      {children}
    </section>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * RelatedTarotCards Component
 *
 * Renders the full "Cartas de Tarot Relacionadas" section: resolves an article's
 * `relatedTarotCards` IDs to full card data and shows each as a thumbnail + name
 * linking to its tarot detail page, instead of the raw numeric IDs.
 *
 * Card data is resolved from the full deck (`useCards`, cached for 1h) so no new
 * endpoint is required. Unknown IDs are skipped; when none resolve, the whole
 * section (heading included) is hidden — owning the heading here avoids leaving
 * an orphan title in the parent.
 *
 * @example
 * ```tsx
 * <RelatedTarotCards cardIds={[1, 3, 10]} />
 * ```
 */
export function RelatedTarotCards({ cardIds }: RelatedTarotCardsProps) {
  const { data: cards, isLoading } = useCards();

  if (isLoading) {
    return (
      <RelatedTarotCardsSection>
        <div data-testid="related-tarot-cards-skeleton" className={GRID_CLASSES}>
          {cardIds.map((id) => (
            <Skeleton key={id} className="aspect-[2/3] rounded-md" />
          ))}
        </div>
      </RelatedTarotCardsSection>
    );
  }

  const cardById = new Map<number, CardSummary>((cards ?? []).map((card) => [card.id, card]));
  const resolvedCards = cardIds
    .map((id) => cardById.get(id))
    .filter((card): card is CardSummary => card !== undefined);

  if (resolvedCards.length === 0) {
    return null;
  }

  return (
    <RelatedTarotCardsSection>
      <div className={GRID_CLASSES}>
        {resolvedCards.map((card) => (
          <CardThumbnail
            key={card.id}
            card={card}
            href={ROUTES.ENCICLOPEDIA_TAROT_CARD(card.slug)}
          />
        ))}
      </div>
    </RelatedTarotCardsSection>
  );
}
