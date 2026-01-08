/**
 * Test Factories - User Capabilities
 *
 * Factory functions to create mock UserCapabilities objects for testing.
 * These match the backend UserCapabilitiesDto structure.
 */

import type { UserCapabilities, FeatureLimit } from '@/types';

/**
 * Create a mock FeatureLimit with default values
 */
export function createMockFeatureLimit(overrides: Partial<FeatureLimit> = {}): FeatureLimit {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);

  return {
    used: 0,
    limit: 1,
    canUse: true,
    resetAt: midnight.toISOString(),
    ...overrides,
  };
}

/**
 * Create mock UserCapabilities for anonymous user
 */
export function createMockAnonymousCapabilities(
  overrides: Partial<UserCapabilities> = {}
): UserCapabilities {
  return {
    dailyCard: createMockFeatureLimit({ used: 0, limit: 1, canUse: true }),
    tarotReadings: createMockFeatureLimit({ used: 0, limit: 0, canUse: false }),
    canCreateDailyReading: true,
    canCreateTarotReading: false,
    canUseAI: false,
    canUseCustomQuestions: false,
    canUseAdvancedSpreads: false,
    plan: 'anonymous',
    isAuthenticated: false,
    ...overrides,
  };
}

/**
 * Create mock UserCapabilities for FREE user
 */
export function createMockFreeCapabilities(
  overrides: Partial<UserCapabilities> = {}
): UserCapabilities {
  return {
    dailyCard: createMockFeatureLimit({ used: 0, limit: 1, canUse: true }),
    tarotReadings: createMockFeatureLimit({ used: 0, limit: 1, canUse: true }),
    canCreateDailyReading: true,
    canCreateTarotReading: true,
    canUseAI: false,
    canUseCustomQuestions: false,
    canUseAdvancedSpreads: false,
    plan: 'free',
    isAuthenticated: true,
    ...overrides,
  };
}

/**
 * Create mock UserCapabilities for PREMIUM user
 */
export function createMockPremiumCapabilities(
  overrides: Partial<UserCapabilities> = {}
): UserCapabilities {
  return {
    dailyCard: createMockFeatureLimit({ used: 0, limit: 1, canUse: true }),
    tarotReadings: createMockFeatureLimit({ used: 0, limit: 3, canUse: true }),
    canCreateDailyReading: true,
    canCreateTarotReading: true,
    canUseAI: true,
    canUseCustomQuestions: true,
    canUseAdvancedSpreads: true,
    plan: 'premium',
    isAuthenticated: true,
    ...overrides,
  };
}

/**
 * Create mock UserCapabilities when daily card limit is reached
 */
export function createMockCapabilitiesWithDailyCardLimitReached(
  plan: 'anonymous' | 'free' | 'premium' = 'free'
): UserCapabilities {
  const baseCapabilities = {
    dailyCard: createMockFeatureLimit({ used: 1, limit: 1, canUse: false }),
    canCreateDailyReading: false,
  };

  switch (plan) {
    case 'anonymous':
      return createMockAnonymousCapabilities(baseCapabilities);
    case 'free':
      return createMockFreeCapabilities(baseCapabilities);
    case 'premium':
      return createMockPremiumCapabilities(baseCapabilities);
  }
}

/**
 * Create mock UserCapabilities when tarot reading limit is reached
 */
export function createMockCapabilitiesWithTarotReadingLimitReached(
  plan: 'free' | 'premium' = 'free'
): UserCapabilities {
  const baseFactory = plan === 'free' ? createMockFreeCapabilities : createMockPremiumCapabilities;
  const limit = plan === 'free' ? 1 : 3;

  return baseFactory({
    tarotReadings: createMockFeatureLimit({ used: limit, limit, canUse: false }),
    canCreateTarotReading: false,
  });
}

/**
 * Create generic mock UserCapabilities (defaults to FREE)
 */
export function createMockUserCapabilities(
  overrides: Partial<UserCapabilities> = {}
): UserCapabilities {
  return createMockFreeCapabilities(overrides);
}
