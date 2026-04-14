/**
 * User Capabilities Types
 *
 * Types for the user capabilities system that defines what features
 * and limits a user has based on their plan (anonymous, free, premium).
 * These types match the backend UserCapabilitiesDto.
 */

/**
 * Feature limit information
 * Contains usage counts, limits, and availability for a specific feature
 */
export interface FeatureLimit {
  /** Number of times the feature has been used today */
  used: number;
  /** Maximum number of times the feature can be used (999999 if unlimited) */
  limit: number;
  /** Whether the user can still use this feature (used < limit) */
  canUse: boolean;
  /** ISO date string when the limit resets (midnight UTC) */
  resetAt: string;
}

/**
 * Pendulum feature limit information
 * Extends FeatureLimit with period-specific information for pendulum queries
 */
export interface PendulumFeatureLimit {
  /** Number of times the feature has been used in the current period */
  used: number;
  /** Maximum number of times the feature can be used */
  limit: number;
  /** Whether the user can still use this feature (used < limit) */
  canUse: boolean;
  /** ISO date string when the limit resets, or null for lifetime limits */
  resetAt: string | null;
  /** Period type: 'daily' (premium), 'monthly' (free), 'lifetime' (anonymous) */
  period: 'daily' | 'monthly' | 'lifetime';
}

/**
 * User capabilities response from backend
 * Single source of truth for what a user can do in the app
 */
export interface UserCapabilities {
  /** Daily card reading limits and usage */
  dailyCard: FeatureLimit;
  /** Tarot readings limits and usage */
  tarotReadings: FeatureLimit;
  /** Pendulum queries limits and usage */
  pendulum: PendulumFeatureLimit;

  /** Convenient boolean: can create daily reading (dailyCard.canUse) */
  canCreateDailyReading: boolean;
  /** Convenient boolean: can create tarot reading (tarotReadings.canUse) */
  canCreateTarotReading: boolean;

  /** Can use AI interpretations (premium only) */
  canUseAI: boolean;
  /** Can use custom questions (premium only) */
  canUseCustomQuestions: boolean;
  /** Can use advanced spreads 5+ cards (premium only) */
  canUseAdvancedSpreads: boolean;
  /** Can use the full 78-card deck (premium only) */
  canUseFullDeck: boolean;

  /** User's current plan */
  plan: 'anonymous' | 'free' | 'premium';
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** MercadoPago subscription status — null if no active subscription */
  subscriptionStatus?: 'active' | 'cancelled' | 'expired' | null;
  /** ISO date string when the premium plan period expires — null if no subscription */
  planExpiresAt?: string | null;
}
