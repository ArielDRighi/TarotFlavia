/**
 * Subscription Types
 *
 * Types for user subscriptions and favorite tarotista functionality
 */

/**
 * User subscription information with favorite tarotista
 */
export interface UserSubscription {
  /** Subscription ID */
  id: number;
  /** User ID */
  userId: number;
  /** User's current plan */
  plan: 'guest' | 'free' | 'premium' | 'professional';
  /** ID of favorite tarotista (null if not set) */
  favoriteTarotistaId: number | null;
  /** Timestamp of last favorite change */
  lastFavoriteChange: string | null;
  /** Whether user can change favorite now */
  canChangeFavorite: boolean;
  /** Days remaining until can change favorite */
  daysUntilChange: number;
  /** Created at timestamp */
  createdAt: string;
  /** Updated at timestamp */
  updatedAt: string;
}

/**
 * DTO for setting favorite tarotista
 */
export interface SetFavoriteTarotistaDto {
  /** Tarotista ID to set as favorite */
  tarotistaId: number;
}

/**
 * Response after setting favorite tarotista
 */
export interface SetFavoriteTarotistaResponse {
  success: boolean;
  subscription: UserSubscription;
}
