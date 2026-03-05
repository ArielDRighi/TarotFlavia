/**
 * Encyclopedia API Functions
 *
 * API functions for the Tarot Encyclopedia module.
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  CardSummary,
  CardDetail,
  CardNavigation,
  CardFilters,
} from '@/types/encyclopedia.types';

export async function getCards(filters?: CardFilters): Promise<CardSummary[]> {
  if (!filters) {
    const response = await apiClient.get<CardSummary[]>(API_ENDPOINTS.ENCYCLOPEDIA.CARDS);
    return response.data;
  }

  const params = new URLSearchParams();
  if (filters.arcanaType) params.append('arcanaType', filters.arcanaType);
  if (filters.suit) params.append('suit', filters.suit);
  if (filters.element) params.append('element', filters.element);
  if (filters.search) params.append('search', filters.search);
  if (filters.courtOnly !== undefined) params.append('courtOnly', String(filters.courtOnly));

  const query = params.toString();
  const url = query
    ? `${API_ENDPOINTS.ENCYCLOPEDIA.CARDS}?${query}`
    : API_ENDPOINTS.ENCYCLOPEDIA.CARDS;

  const response = await apiClient.get<CardSummary[]>(url);
  return response.data;
}

export async function getMajorArcana(): Promise<CardSummary[]> {
  const response = await apiClient.get<CardSummary[]>(API_ENDPOINTS.ENCYCLOPEDIA.MAJOR);
  return response.data;
}

export async function getCardsBySuit(suit: string): Promise<CardSummary[]> {
  const response = await apiClient.get<CardSummary[]>(API_ENDPOINTS.ENCYCLOPEDIA.BY_SUIT(suit));
  return response.data;
}

export async function searchCards(query: string): Promise<CardSummary[]> {
  const params = new URLSearchParams({ q: query });
  const response = await apiClient.get<CardSummary[]>(
    `${API_ENDPOINTS.ENCYCLOPEDIA.SEARCH}?${params.toString()}`
  );
  return response.data;
}

export async function getCardBySlug(slug: string): Promise<CardDetail> {
  const response = await apiClient.get<CardDetail>(API_ENDPOINTS.ENCYCLOPEDIA.CARD_DETAIL(slug));
  return response.data;
}

export async function getRelatedCards(slug: string): Promise<CardSummary[]> {
  const response = await apiClient.get<CardSummary[]>(
    API_ENDPOINTS.ENCYCLOPEDIA.CARD_RELATED(slug)
  );
  return response.data;
}

export async function getCardNavigation(slug: string): Promise<CardNavigation> {
  const response = await apiClient.get<CardNavigation>(
    API_ENDPOINTS.ENCYCLOPEDIA.CARD_NAVIGATION(slug)
  );
  return response.data;
}
