/**
 * useTarotDeck Hook
 *
 * Computes the available deck for the current user based on their plan capabilities.
 *
 * - FREE / Anonymous: Only 22 Major Arcana cards (indices 0-21, card IDs 1-22)
 * - PREMIUM: Full 78-card deck (indices 0-77)
 *
 * The deck is represented as an array of 0-based indices that map to card IDs
 * (index + 1 = cardId). No API fetch is required since cards are indexed locally.
 */

import { useMemo } from 'react';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';

/** Number of Major Arcana cards */
const MAJOR_ARCANA_COUNT = 22;

/** Total tarot deck size */
const FULL_DECK_SIZE = 78;

export interface TarotDeckResult {
  /** Array of 0-based card indices available to the user */
  cardIndices: number[];
  /** Number of cards in the available deck */
  deckSize: number;
  /** Whether the deck is restricted (FREE plan — only Major Arcana) */
  isRestricted: boolean;
}

/**
 * Hook that returns the available deck indices for the current user.
 *
 * Uses `canUseFullDeck` capability from the backend to determine the deck size.
 * While capabilities are loading, defaults to the full deck to avoid premature restriction.
 *
 * @example
 * ```tsx
 * const { cardIndices, deckSize, isRestricted } = useTarotDeck();
 * // Render deckSize cards; use cardIndices to map to cardId (index + 1)
 * ```
 */
export function useTarotDeck(): TarotDeckResult {
  const { data: capabilities } = useUserCapabilities();

  return useMemo(() => {
    // While loading or no data: default to full deck (safe — backend validates anyway)
    const canUseFullDeck = capabilities?.canUseFullDeck ?? true;

    const size = canUseFullDeck ? FULL_DECK_SIZE : MAJOR_ARCANA_COUNT;
    const indices = Array.from({ length: size }, (_, i) => i);

    return {
      cardIndices: indices,
      deckSize: size,
      isRestricted: !canUseFullDeck,
    };
  }, [capabilities?.canUseFullDeck]);
}
