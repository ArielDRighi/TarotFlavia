/**
 * Admin Readings Types
 *
 * Tipos para la gestión de lecturas desde el panel de administración.
 */

export interface CardPreviewAdmin {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface AdminReadingListItem {
  id: number;
  question: string;
  spreadId: number;
  spreadName: string;
  cardsCount: number;
  cardPreviews: CardPreviewAdmin[];
  createdAt: string;
  deletedAt?: string;
}

export interface AdminReadingsMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminReadingsResponse {
  data: AdminReadingListItem[];
  meta: AdminReadingsMeta;
}

export interface AdminReadingsFilters {
  includeDeleted?: boolean;
}
