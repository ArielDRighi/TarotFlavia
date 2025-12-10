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
 * Matches backend PredefinedQuestion entity
 */
export interface PredefinedQuestion {
  id: number;
  questionText: string;
  categoryId: number;
  order: number;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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
 * Matches backend Spread entity
 */
export interface Spread {
  id: number;
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
  isBeginnerFriendly?: boolean;
  whenToUse?: string;
  createdAt?: string;
  updatedAt?: string;
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
 * Card position for reading creation
 */
export interface CardPositionDto {
  cardId: number;
  position: string;
  isReversed: boolean;
}

/**
 * DTO for creating a new reading
 * Matches backend CreateReadingDto
 */
export interface CreateReadingDto {
  spreadId: number;
  deckId: number;
  cardIds: number[];
  cardPositions: CardPositionDto[];
  predefinedQuestionId?: number;
  customQuestion?: string;
  generateInterpretation?: boolean;
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

// ============================================================================
// Daily Reading Types
// ============================================================================

/**
 * Tarot card data (matches backend TarotCard entity)
 * Used in DailyReading responses
 */
export interface TarotCard {
  id: number;
  name: string;
  number: number;
  category: string;
  imageUrl: string;
  reversedImageUrl?: string;
  meaningUpright: string;
  meaningReversed: string;
  description: string;
  keywords: string;
  deckId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Daily reading (carta del día)
 * Matches backend DailyReadingResponseDto contract
 */
export interface DailyReading {
  id: number;
  userId: number;
  tarotistaId: number;
  card: TarotCard;
  isReversed: boolean;
  interpretation: string;
  readingDate: string;
  wasRegenerated: boolean;
  createdAt: Date;
}

/**
 * Daily reading history item (simplified for history list)
 * Matches backend DailyReadingHistoryItemDto contract
 */
export interface DailyReadingHistoryItem {
  id: number;
  readingDate: string;
  cardName: string;
  isReversed: boolean;
  interpretationSummary: string;
  wasRegenerated: boolean;
  createdAt: Date;
}

/**
 * Paginated daily readings response (for history)
 * Matches backend DailyReadingHistoryDto contract (flat structure)
 */
export interface PaginatedDailyReadings {
  items: DailyReadingHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
