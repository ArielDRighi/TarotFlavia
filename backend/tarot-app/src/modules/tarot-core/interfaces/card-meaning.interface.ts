/**
 * Result of getting a card meaning, either custom (from tarotista) or base (from card entity)
 */
export interface CardMeaningResult {
  /** The meaning text for this card */
  meaning: string;

  /** Keywords associated with this card for AI interpretation */
  keywords: string[];

  /** Whether this is a custom meaning (true) or base meaning (false) */
  isCustom: boolean;

  /** ID of the tarotista who owns this meaning */
  tarotistaId: number;

  /** ID of the tarot card */
  cardId: number;

  /** Whether this is the reversed orientation */
  isReversed: boolean;

  /** Timestamp for cache control */
  timestamp: number;
}

/**
 * DTO for requesting multiple card meanings in bulk
 */
export interface CardMeaningRequest {
  cardId: number;
  isReversed: boolean;
}
