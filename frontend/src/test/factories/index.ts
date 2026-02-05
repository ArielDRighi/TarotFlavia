/**
 * Test Factories Barrel Export
 *
 * Centralized exports for all test factory functions.
 * Import from '@/test/factories' in test files.
 */

export {
  createMockTarotCard,
  createMockDailyReading,
  createMockDailyReadingHistoryItem,
  createMockUser,
} from './dailyReading.factory';

export {
  createMockAuthUser,
  createMockAnonymousUser,
  createMockFreeUser,
  createMockPremiumUser,
} from './authUser.factory';

export {
  createMockFeatureLimit,
  createMockPendulumFeatureLimit,
  createMockAnonymousCapabilities,
  createMockFreeCapabilities,
  createMockPremiumCapabilities,
  createMockCapabilitiesWithDailyCardLimitReached,
  createMockCapabilitiesWithTarotReadingLimitReached,
  createMockUserCapabilities,
} from './capabilities.factory';
