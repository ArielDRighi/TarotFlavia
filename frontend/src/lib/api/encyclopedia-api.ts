/**
 * Encyclopedia API Functions
 *
 * API functions for the Tarot Encyclopedia module.
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import { PRERENDER_HEADER } from './prerender';
import type {
  CardSummary,
  CardCombination,
  CardDetail,
  CardNavigation,
  CardFilters,
  Suit,
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
  const trimmedSearch = filters.search?.trim();
  if (trimmedSearch && trimmedSearch.length >= 2) {
    params.append('search', trimmedSearch);
  }
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

export async function getCardsBySuit(suit: Suit): Promise<CardSummary[]> {
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

/** Opciones de `getCardBySlug`. */
export interface GetCardBySlugOptions {
  /**
   * `false` para que la API **no** cuente la request como una vista de la
   * ficha. El interceptor ya manda el header durante `next build`; esto es
   * para las lecturas server-side que tampoco son una persona mirando la
   * ficha, como la carta del día de la portada, que se resuelve en cada
   * regeneración de ISR de `/` (T-SEO-014). Default `true`.
   */
  countView?: boolean;
}

export async function getCardBySlug(
  slug: string,
  { countView = true }: GetCardBySlugOptions = {}
): Promise<CardDetail> {
  const url = API_ENDPOINTS.ENCYCLOPEDIA.CARD_DETAIL(slug);
  // El backend decide por presencia del header (`@IsPrerender()`), así que
  // sólo se manda cuando hay que suprimir la vista.
  const response = countView
    ? await apiClient.get<CardDetail>(url)
    : await apiClient.get<CardDetail>(url, { headers: { [PRERENDER_HEADER]: '1' } });
  return response.data;
}

/**
 * Nombres en español de las cartas que aparecen en las combinaciones de una
 * ficha (T-SEO-010).
 *
 * Las combinaciones traen solo el slug, y el texto del enlace tiene que viajar
 * en el HTML para que el cross-link sirva de algo: por eso se resuelve en el
 * servidor y no con un hook en el cliente. Se filtra a los 3-5 slugs de la ficha
 * en vez de mandar las 78 entradas al payload del cliente.
 */
export async function getCombinationCardNames(
  combinations: CardCombination[] | undefined
): Promise<Record<string, string>> {
  if (!combinations || combinations.length === 0) {
    return {};
  }

  const wanted = new Set(combinations.map((combination) => combination.cardSlug));
  const cards = await getCards();

  return Object.fromEntries(
    cards.filter((card) => wanted.has(card.slug)).map((card) => [card.slug, card.nameEs])
  );
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
