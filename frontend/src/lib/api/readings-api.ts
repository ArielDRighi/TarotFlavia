/**
 * Readings API Service
 *
 * Functions for all readings-related API calls.
 * These are pure API functions - use TanStack Query hooks in hooks/api/ for data fetching.
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  Category,
  PredefinedQuestion,
  Spread,
  ReadingDetail,
  ReadingCard,
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
    const response = await apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.BASE);
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
    const response = await apiClient.get<PredefinedQuestion[]>(
      API_ENDPOINTS.PREDEFINED_QUESTIONS.BASE,
      {
        params: categoryId ? { categoryId } : undefined,
      }
    );
    return response.data;
  } catch {
    throw new Error('Error al obtener preguntas predefinidas');
  }
}

// ============================================================================
// Spreads
// ============================================================================

/**
 * Fetch all available spreads (anonymous access - only basic spreads)
 * @returns Promise<Spread[]> Array of spreads
 * @throws Error with clear message on failure
 */
export async function getSpreads(): Promise<Spread[]> {
  try {
    const response = await apiClient.get<Spread[]>(API_ENDPOINTS.SPREADS.BASE);
    return response.data;
  } catch {
    throw new Error('Error al obtener tiradas');
  }
}

/**
 * Fetch spreads available for the authenticated user based on their plan
 * @returns Promise<Spread[]> Array of spreads available to the user
 * @throws Error with clear message on failure
 */
export async function getMyAvailableSpreads(): Promise<Spread[]> {
  try {
    const response = await apiClient.get<Spread[]>(API_ENDPOINTS.SPREADS.MY_AVAILABLE);
    return response.data;
  } catch {
    throw new Error('Error al obtener tiradas disponibles');
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
    const response = await apiClient.post<ApiReadingResponse>(API_ENDPOINTS.READINGS.BASE, data);
    return transformReadingResponse(response.data);
  } catch {
    throw new Error('Error al crear lectura');
  }
}

/**
 * Raw API response type (before transformation)
 */
interface ApiReadingResponse {
  id: number;
  userId?: number;
  spreadId?: number;
  tarotistaId?: number;
  question?: string;
  predefinedQuestionId?: number;
  customQuestion?: string;
  cards: Array<{
    id: number;
    name: string;
    number: number;
    category: string;
    imageUrl: string;
  }>;
  cardPositions: Array<{
    cardId: number;
    position: string;
    isReversed: boolean;
  }>;
  interpretation: string | null;
  createdAt: string;
  deletedAt?: string | null;
  sharedToken?: string | null;
  user?: { id: number };
}

/**
 * Transform raw API response to frontend ReadingDetail format
 */
function transformReadingResponse(raw: ApiReadingResponse): ReadingDetail {
  // Create a map of cardId -> position info for quick lookup
  const positionMap = new Map(raw.cardPositions.map((cp) => [cp.cardId, cp]));

  // Transform cards array to include position info
  const transformedCards: ReadingCard[] = raw.cards.map((card, index) => {
    const posInfo = positionMap.get(card.id);
    // Determine arcana from category, not number (Minor Arcana have numbers 1-14 per suit)
    const isMajorArcana = card.category === 'arcanos_mayores';
    return {
      id: card.id,
      name: card.name,
      arcana: (isMajorArcana ? 'major' : 'minor') as 'major' | 'minor',
      number: card.number,
      suit: !isMajorArcana ? card.category : null,
      orientation: (posInfo?.isReversed ? 'reversed' : 'upright') as 'upright' | 'reversed',
      position: index,
      positionName: posInfo?.position || `Posición ${index + 1}`,
      imageUrl: card.imageUrl,
    };
  });

  return {
    id: raw.id,
    userId: raw.user?.id || raw.userId || 0,
    spreadId: raw.spreadId || 0,
    tarotistaId: raw.tarotistaId,
    question: raw.customQuestion || raw.question || '',
    cards: transformedCards,
    interpretation: raw.interpretation,
    createdAt: raw.createdAt,
    deletedAt: raw.deletedAt,
    shareToken: raw.sharedToken,
  };
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
    const response = await apiClient.get<PaginatedReadings>(API_ENDPOINTS.READINGS.BASE, {
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
    const response = await apiClient.get<ApiReadingResponse>(API_ENDPOINTS.READINGS.BY_ID(id));
    return transformReadingResponse(response.data);
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
    await apiClient.delete(API_ENDPOINTS.READINGS.BY_ID(id));
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
    const response = await apiClient.post<ApiReadingResponse>(
      API_ENDPOINTS.READINGS.REGENERATE(readingId)
    );
    return transformReadingResponse(response.data);
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
    const response = await apiClient.post<ShareReadingResponse>(
      API_ENDPOINTS.READINGS.SHARE(readingId)
    );
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
    await apiClient.delete(API_ENDPOINTS.READINGS.SHARE(readingId));
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
    const response = await apiClient.get<TrashedReading[]>(API_ENDPOINTS.READINGS.TRASH);
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
    const response = await apiClient.post<Reading>(API_ENDPOINTS.READINGS.RESTORE(readingId));
    return response.data;
  } catch {
    throw new Error('Error al restaurar lectura');
  }
}
