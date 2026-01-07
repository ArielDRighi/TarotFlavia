import type { AuthUser } from '@/types';

/**
 * Creates a mock AuthUser with sensible defaults
 */
export function createMockAuthUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    roles: ['user'],
    plan: 'free',
    // Legacy fields (deprecated)
    dailyReadingsCount: 0,
    dailyReadingsLimit: 2,
    // New separate fields
    dailyCardCount: 0,
    dailyCardLimit: 1,
    tarotReadingsCount: 0,
    tarotReadingsLimit: 1,
    ...overrides,
  };
}

/**
 * Creates a mock anonymous user
 */
export function createMockAnonymousUser(overrides?: Partial<AuthUser>): AuthUser {
  return createMockAuthUser({
    plan: 'anonymous',
    dailyReadingsCount: 0,
    dailyReadingsLimit: 1,
    dailyCardCount: 0,
    dailyCardLimit: 1,
    tarotReadingsCount: 0,
    tarotReadingsLimit: 0,
    ...overrides,
  });
}

/**
 * Creates a mock FREE user
 */
export function createMockFreeUser(overrides?: Partial<AuthUser>): AuthUser {
  return createMockAuthUser({
    plan: 'free',
    dailyReadingsCount: 0,
    dailyReadingsLimit: 2,
    dailyCardCount: 0,
    dailyCardLimit: 1,
    tarotReadingsCount: 0,
    tarotReadingsLimit: 1,
    ...overrides,
  });
}

/**
 * Creates a mock PREMIUM user
 */
export function createMockPremiumUser(overrides?: Partial<AuthUser>): AuthUser {
  return createMockAuthUser({
    plan: 'premium',
    dailyReadingsCount: 0,
    dailyReadingsLimit: 4,
    dailyCardCount: 0,
    dailyCardLimit: 1,
    tarotReadingsCount: 0,
    tarotReadingsLimit: 3,
    ...overrides,
  });
}
