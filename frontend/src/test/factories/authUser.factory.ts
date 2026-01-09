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
    profilePicture: null,
    ...overrides,
  };
}

/**
 * Creates a mock anonymous user
 */
export function createMockAnonymousUser(overrides?: Partial<AuthUser>): AuthUser {
  return createMockAuthUser({
    plan: 'anonymous',
    ...overrides,
  });
}

/**
 * Creates a mock FREE user
 */
export function createMockFreeUser(overrides?: Partial<AuthUser>): AuthUser {
  return createMockAuthUser({
    plan: 'free',
    ...overrides,
  });
}

/**
 * Creates a mock PREMIUM user
 */
export function createMockPremiumUser(overrides?: Partial<AuthUser>): AuthUser {
  return createMockAuthUser({
    plan: 'premium',
    ...overrides,
  });
}
