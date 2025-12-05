/**
 * Readings API Service
 *
 * Functions for all readings-related API calls.
 * These are pure API functions - use TanStack Query hooks in hooks/api/ for data fetching.
 */
import { apiClient } from './axios-config';
import type {
  Category,
  PredefinedQuestion,
  Spread,
  ReadingDetail,
  CreateReadingDto,
  PaginatedReadings,
  Reading,
  TrashedReading,
  ShareReadingResponse,
} from '@/types';

// ============================================================================
// Categories
// ============================================================================

/**
 * Fetch all categories
 * @returns Promise<Category[]> Array of categories
 * @throws Error with clear message on failure
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  } catch {
    throw new Error('Error al obtener categorías');
  }
}

// ============================================================================
// Predefined Questions
// ============================================================================

/**
 * Fetch predefined questions, optionally filtered by category
 * @param categoryId - Optional category ID to filter by
 * @returns Promise<PredefinedQuestion[]> Array of predefined questions
 * @throws Error with clear message on failure
 */
export async function getPredefinedQuestions(categoryId?: number): Promise<PredefinedQuestion[]> {
  try {
    const response = await apiClient.get<PredefinedQuestion[]>('/predefined-questions', {
      params: categoryId ? { categoryId } : undefined,
    });
    return response.data;
  } catch {
    throw new Error('Error al obtener preguntas predefinidas');
  }
}

// ============================================================================
// Spreads
// ============================================================================

/**
 * Fetch all available spreads
 * @returns Promise<Spread[]> Array of spreads
 * @throws Error with clear message on failure
 */
export async function getSpreads(): Promise<Spread[]> {
  try {
    const response = await apiClient.get<Spread[]>('/spreads');
    return response.data;
  } catch {
    throw new Error('Error al obtener tiradas');
  }
}

// ============================================================================
// Readings CRUD
// ============================================================================

/**
 * Create a new reading
 * @param data - CreateReadingDto with spreadId and question info
 * @returns Promise<ReadingDetail> The created reading with interpretation
 * @throws Error with clear message on failure
 */
export async function createReading(data: CreateReadingDto): Promise<ReadingDetail> {
  try {
    const response = await apiClient.post<ReadingDetail>('/readings', data);
    return response.data;
  } catch {
    throw new Error('Error al crear lectura');
  }
}

/**
 * Fetch paginated list of user's readings
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Promise<PaginatedReadings> Paginated response with readings and meta
 * @throws Error with clear message on failure
 */
export async function getMyReadings(page: number, limit: number): Promise<PaginatedReadings> {
  try {
    const response = await apiClient.get<PaginatedReadings>('/readings', {
      params: { page, limit },
    });
    return response.data;
  } catch {
    throw new Error('Error al obtener lecturas');
  }
}

/**
 * Fetch a single reading by ID
 * @param id - Reading ID
 * @returns Promise<ReadingDetail> Full reading details with cards and interpretation
 * @throws Error with clear message on failure
 */
export async function getReadingById(id: number): Promise<ReadingDetail> {
  try {
    const response = await apiClient.get<ReadingDetail>(`/readings/${id}`);
    return response.data;
  } catch {
    throw new Error('Error al obtener lectura');
  }
}

/**
 * Soft delete a reading
 * @param id - Reading ID to delete
 * @throws Error with clear message on failure
 */
export async function deleteReading(id: number): Promise<void> {
  try {
    await apiClient.delete(`/readings/${id}`);
  } catch {
    throw new Error('Error al eliminar lectura');
  }
}

// ============================================================================
// Interpretation Regeneration
// ============================================================================

/**
 * Regenerate the AI interpretation for a reading
 * @param readingId - Reading ID to regenerate
 * @returns Promise<ReadingDetail> Updated reading with new interpretation
 * @throws Error with clear message on failure
 */
export async function regenerateInterpretation(readingId: number): Promise<ReadingDetail> {
  try {
    const response = await apiClient.post<ReadingDetail>(`/readings/${readingId}/regenerate`);
    return response.data;
  } catch {
    throw new Error('Error al regenerar interpretación');
  }
}

// ============================================================================
// Sharing
// ============================================================================

/**
 * Share a reading publicly
 * @param readingId - Reading ID to share
 * @returns Promise<ShareReadingResponse> Object with shareToken
 * @throws Error with clear message on failure
 */
export async function shareReading(readingId: number): Promise<ShareReadingResponse> {
  try {
    const response = await apiClient.post<ShareReadingResponse>(`/readings/${readingId}/share`);
    return response.data;
  } catch {
    throw new Error('Error al compartir lectura');
  }
}

/**
 * Remove public sharing from a reading
 * @param readingId - Reading ID to unshare
 * @throws Error with clear message on failure
 */
export async function unshareReading(readingId: number): Promise<void> {
  try {
    await apiClient.delete(`/readings/${readingId}/share`);
  } catch {
    throw new Error('Error al dejar de compartir lectura');
  }
}

// ============================================================================
// Trash (Soft Delete)
// ============================================================================

/**
 * Fetch all trashed (soft-deleted) readings
 * @returns Promise<TrashedReading[]> Array of trashed readings
 * @throws Error with clear message on failure
 */
export async function getTrashedReadings(): Promise<TrashedReading[]> {
  try {
    const response = await apiClient.get<TrashedReading[]>('/readings/trash');
    return response.data;
  } catch {
    throw new Error('Error al obtener lecturas eliminadas');
  }
}

/**
 * Restore a soft-deleted reading
 * @param readingId - Reading ID to restore
 * @returns Promise<Reading> The restored reading
 * @throws Error with clear message on failure
 */
export async function restoreReading(readingId: number): Promise<Reading> {
  try {
    const response = await apiClient.post<Reading>(`/readings/${readingId}/restore`);
    return response.data;
  } catch {
    throw new Error('Error al restaurar lectura');
  }
}
