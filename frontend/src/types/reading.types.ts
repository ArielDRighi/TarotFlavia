/**
 * Reading Types
 *
 * Types for readings, categories, spreads, and related API responses
 */

import type { SpreadTypeValue } from '@/lib/validations/reading.schemas';

// ============================================================================
// Category Types
// ============================================================================

/**
 * Category for predefined questions
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

// ============================================================================
// Question Types
// ============================================================================

/**
 * Predefined question for readings
 */
export interface PredefinedQuestion {
  id: number;
  question: string;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  usageCount: number;
}

// ============================================================================
// Spread Types
// ============================================================================

/**
 * Position within a spread
 */
export interface SpreadPosition {
  position: number;
  name: string;
  description: string;
}

/**
 * Spread (tirada) configuration
 */
export interface Spread {
  id: number;
  name: string;
  slug: string;
  description: string;
  cardsCount: number;
  positions: SpreadPosition[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
}

// ============================================================================
// Card Types
// ============================================================================

/**
 * Card in a reading
 */
export interface ReadingCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  number: number;
  suit: string | null;
  orientation: 'upright' | 'reversed';
  position: number;
  positionName: string;
  imageUrl?: string;
}

// ============================================================================
// Interpretation Types
// ============================================================================

/**
 * Individual card interpretation within a reading
 */
export interface CardInterpretation {
  cardId: number;
  interpretation: string;
}

/**
 * Full interpretation from AI
 */
export interface Interpretation {
  id: number;
  generalInterpretation: string;
  cardInterpretations: CardInterpretation[];
  aiProvider: string;
  model: string;
}

// ============================================================================
// Reading Types
// ============================================================================

/**
 * Reading summary (for lists)
 */
export interface Reading {
  id: number;
  spreadId: number;
  spreadName?: string;
  question: string;
  createdAt: string;
  cardsCount?: number;
  deletedAt?: string | null;
  shareToken?: string | null;
}

/**
 * Full reading detail
 */
export interface ReadingDetail {
  id: number;
  userId: number;
  spreadId: number;
  tarotistaId?: number;
  question: string;
  cards: ReadingCard[];
  interpretation: Interpretation;
  createdAt: string;
  deletedAt?: string | null;
  shareToken?: string | null;
}

/**
 * Trashed reading (soft-deleted)
 */
export interface TrashedReading extends Reading {
  deletedAt: string;
  restorable: boolean;
}

// ============================================================================
// DTO Types (for API requests)
// ============================================================================

/**
 * DTO for creating a new reading
 */
export interface CreateReadingDto {
  spreadId: number;
  predefinedQuestionId?: number;
  customQuestion?: string;
  tarotistaId?: number;
}

// ============================================================================
// Paginated Response Types
// ============================================================================

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Paginated readings response
 */
export interface PaginatedReadings {
  data: Reading[];
  meta: PaginationMeta;
}

// ============================================================================
// Share Types
// ============================================================================

/**
 * Response from sharing a reading
 */
export interface ShareReadingResponse {
  shareToken: string;
}

// ============================================================================
// Filter Types (Legacy - kept for compatibility)
// ============================================================================

/**
 * @deprecated Use specific filter types instead
 */
export interface ReadingFilters {
  spreadType?: SpreadTypeValue;
  isPrivate?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}
