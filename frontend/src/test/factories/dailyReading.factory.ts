/**
 * Test factories for daily reading related types
 *
 * These factories provide consistent mock data for tests across the application.
 * Usage: Import and call with optional overrides for specific test cases.
 */

import type { DailyReading, TarotCard, AuthUser, DailyReadingHistoryItem } from '@/types';

/**
 * Creates a mock TarotCard with sensible defaults
 * @param overrides - Partial TarotCard to override defaults
 */
export function createMockTarotCard(overrides: Partial<TarotCard> = {}): TarotCard {
  return {
    id: 1,
    name: 'El Loco',
    number: 0,
    category: 'major',
    imageUrl: '/cards/the-fool.jpg',
    reversedImageUrl: '/cards/the-fool-reversed.jpg',
    meaningUpright: 'Nuevos comienzos, aventura',
    meaningReversed: 'Imprudencia, riesgos',
    description: 'Representa el inicio del viaje',
    keywords: 'libertad, espontaneidad, inocencia',
    deckId: 1,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  };
}

/**
 * Creates a mock DailyReading with sensible defaults
 * @param overrides - Partial DailyReading to override defaults
 */
export function createMockDailyReading(overrides: Partial<DailyReading> = {}): DailyReading {
  const defaultCard = createMockTarotCard();

  const baseReading = {
    id: 1,
    userId: 1,
    tarotistaId: 1,
    card: defaultCard,
    isReversed: false,
    interpretation: 'Hoy es un día de nuevos comienzos. El Loco te invita a dar ese salto de fe.',
    cardMeaning: undefined, // Only present for anonymous users
    readingDate: '2025-12-09',
    wasRegenerated: false,
    createdAt: new Date('2025-12-09T08:00:00Z'),
    ...overrides,
  };

  // If interpretation is explicitly null, add cardMeaning (anonymous flow)
  // Use the final isReversed value after applying overrides
  if (overrides.interpretation === null && !overrides.cardMeaning) {
    const finalCard = baseReading.card;
    const finalIsReversed = baseReading.isReversed;
    baseReading.cardMeaning = finalIsReversed
      ? finalCard.meaningReversed
      : finalCard.meaningUpright;
  }

  return baseReading;
}

/**
 * Creates a mock DailyReadingHistoryItem with sensible defaults
 * @param overrides - Partial DailyReadingHistoryItem to override defaults
 */
export function createMockDailyReadingHistoryItem(
  overrides: Partial<DailyReadingHistoryItem> = {}
): DailyReadingHistoryItem {
  return {
    id: 1,
    readingDate: '2025-12-09T00:00:00Z',
    cardName: 'El Loco',
    isReversed: false,
    interpretationSummary:
      'Hoy es un día de nuevos comienzos. El Loco te invita a dar ese salto de fe.',
    wasRegenerated: false,
    createdAt: new Date('2025-12-09T08:00:00Z'),
    ...overrides,
  };
}

/**
 * Creates a mock AuthUser with sensible defaults
 * @param overrides - Partial AuthUser to override defaults
 */
export function createMockUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    roles: ['user'],
    plan: 'FREE',
    dailyReadingsCount: 0,
    dailyReadingsLimit: 3,
    dailyCardCount: 0,
    dailyCardLimit: 1,
    tarotReadingsCount: 0,
    tarotReadingsLimit: 3,
    ...overrides,
  };
}
