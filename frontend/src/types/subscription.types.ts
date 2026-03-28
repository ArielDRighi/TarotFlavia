/**
 * Subscription Types
 *
 * Types for user subscriptions and favorite tarotista functionality
 * These types match the backend API contracts
 */

/**
 * Subscription type enum (matches backend)
 */
export type SubscriptionType = 'favorite' | 'premium_individual' | 'premium_all_access';

/**
 * Subscription status enum (matches backend)
 */
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

/**
 * User-Tarotista Subscription entity (matches backend entity)
 * Returned by POST /subscriptions/set-favorite
 */
export interface UserTarotistaSubscription {
  /** Subscription ID */
  id: number;
  /** User ID */
  userId: number;
  /** ID of tarotista (null for all-access) */
  tarotistaId: number | null;
  /** Type of subscription */
  subscriptionType: SubscriptionType;
  /** Status of subscription */
  status: SubscriptionStatus;
  /** When subscription started */
  startedAt: string;
  /** When subscription expires (null if perpetual) */
  expiresAt: string | null;
  /** When subscription was cancelled (null if active) */
  cancelledAt: string | null;
  /** When user can change favorite tarotista (null if no cooldown) */
  canChangeAt: string | null;
  /** Number of times user changed favorite */
  changeCount: number;
  /** Stripe subscription ID (null if not using Stripe) */
  stripeSubscriptionId: string | null;
  /** Created at timestamp */
  createdAt: string;
  /** Updated at timestamp */
  updatedAt: string;
}

/**
 * Subscription Info (returned by GET /subscriptions/my-subscription)
 * This is NOT the full entity, but a simplified DTO
 */
export interface SubscriptionInfo {
  /** Type of subscription */
  subscriptionType: SubscriptionType;
  /** Tarotista ID (null for all-access or no subscription) */
  tarotistaId: number | null;
  /** Tarotista public name (optional) */
  tarotistaNombre?: string;
  /** Whether user can change favorite now */
  canChange: boolean;
  /** Date when user can change favorite (null if can change now) */
  canChangeAt: string | null;
  /** Number of times user changed favorite */
  changeCount: number;
}

/**
 * DTO for setting favorite tarotista
 */
export interface SetFavoriteTarotistaDto {
  /** Tarotista ID to set as favorite */
  tarotistaId: number;
}

/**
 * Response from POST /subscriptions/set-favorite (matches backend)
 */
export interface SetFavoriteTarotistaResponse {
  /** Success message from backend */
  message: string;
  /** Updated subscription entity */
  subscription: UserTarotistaSubscription;
}

// =============================================================================
// MercadoPago Subscription Types (Premium plan)
// =============================================================================

/**
 * MercadoPago subscription status values
 * Matches backend SubscriptionStatusResponseDto
 */
export type MpSubscriptionStatusValue = 'active' | 'cancelled' | 'expired';

/**
 * Response from GET /subscriptions/status
 * Contains the current plan and MercadoPago subscription state
 */
export interface MpSubscriptionStatus {
  /** User's current plan */
  plan: 'anonymous' | 'free' | 'premium';
  /** MP subscription status — null if no subscription */
  subscriptionStatus: MpSubscriptionStatusValue | null;
  /** ISO date string when the current plan period expires — null if no expiry */
  planExpiresAt: string | null;
  /** MercadoPago preapproval ID — null if no active subscription */
  mpPreapprovalId: string | null;
}

/**
 * Response from POST /subscriptions/create-preapproval
 * Contains the redirect URL to the MercadoPago checkout
 */
export interface CreatePreapprovalResponse {
  /** MercadoPago checkout URL to redirect the user */
  initPoint: string;
}

/**
 * Response from POST /subscriptions/cancel
 * Confirms cancellation and shows until when the plan remains active
 */
export interface CancelSubscriptionResponse {
  /** Confirmation message in Spanish */
  message: string;
  /** ISO date string until when the premium plan remains active, or null if not set */
  planExpiresAt: string | null;
}
