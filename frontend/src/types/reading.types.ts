/**
 * Reading Types
 */

import type { SpreadTypeValue } from "@/lib/validations/reading.schemas";

export interface Reading {
  id: string;
  question: string;
  spreadType: SpreadTypeValue;
  isPrivate: boolean;
  userId: string;
  interpretation?: string;
  cards?: ReadingCard[];
  createdAt: string;
  updatedAt: string;
}

export interface ReadingCard {
  id: string;
  position: number;
  cardId: string;
  isReversed: boolean;
  meaning?: string;
}

export interface TrashedReading extends Reading {
  deletedAt: string;
  restorable: boolean;
}

export interface ReadingFilters {
  spreadType?: SpreadTypeValue;
  isPrivate?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}
