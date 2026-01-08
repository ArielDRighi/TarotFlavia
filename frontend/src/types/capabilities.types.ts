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
 * User capabilities response from backend
 * Single source of truth for what a user can do in the app
 */
export interface UserCapabilities {
  /** Daily card reading limits and usage */
  dailyCard: FeatureLimit;
  /** Tarot readings limits and usage */
  tarotReadings: FeatureLimit;

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

  /** User's current plan */
  plan: 'anonymous' | 'free' | 'premium';
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}
