/**
 * Tests for Encyclopedia API Functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import {
  getCards,
  getMajorArcana,
  getCardsBySuit,
  searchCards,
  getCardBySlug,
  getRelatedCards,
  getCardNavigation,
} from './encyclopedia-api';
import { ArcanaType, Suit, Element, Planet, ZodiacAssociation } from '@/types/encyclopedia.types';
import { API_ENDPOINTS } from './endpoints';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('encyclopedia API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCardSummary = {
    id: 1,
    slug: 'the-fool',
    nameEs: 'El Loco',
    arcanaType: ArcanaType.MAJOR,
    number: 0,
    suit: null,
    thumbnailUrl: '/images/tarot/major/00-the-fool.jpg',
  };

  const mockCardDetail = {
    id: 1,
    slug: 'the-fool',
    nameEs: 'El Loco',
    nameEn: 'The Fool',
    arcanaType: ArcanaType.MAJOR,
    number: 0,
    suit: null,
    thumbnailUrl: '/images/tarot/major/00-the-fool.jpg',
    romanNumeral: '0',
    courtRank: null,
    element: null,
    planet: Planet.URANUS,
    zodiacSign: ZodiacAssociation.AQUARIUS,
    meaningUpright: 'Nuevos comienzos e inocencia',
    meaningReversed: 'Imprudencia y decisiones precipitadas',
    description: 'Un joven al borde de un precipicio',
    keywords: {
      upright: ['Nuevos comienzos', 'Inocencia'],
      reversed: ['Imprudencia', 'Ingenuidad'],
    },
    imageUrl: '/images/tarot/major/00-the-fool.jpg',
    relatedCards: [2, 3],
  };

  const mockNavigation = {
    previous: null,
    next: {
      id: 2,
      slug: 'the-magician',
      nameEs: 'El Mago',
      arcanaType: ArcanaType.MAJOR,
      number: 1,
      suit: null,
      thumbnailUrl: '/images/tarot/major/01-the-magician.jpg',
    },
  };

  describe('getCards', () => {
    it('should call correct endpoint without filters', async () => {
      const mockData = [mockCardSummary];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getCards();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ENCYCLOPEDIA.CARDS);
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(1);
    });

    it('should call correct endpoint with arcanaType filter', async () => {
      const mockData = [mockCardSummary];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getCards({ arcanaType: ArcanaType.MAJOR });

      expect(apiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.ENCYCLOPEDIA.CARDS}?arcanaType=major`
      );
      expect(result).toEqual(mockData);
    });

    it('should call correct endpoint with suit filter', async () => {
      const mockData = [mockCardSummary];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      await getCards({ suit: Suit.CUPS });

      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('suit=cups'));
    });

    it('should call correct endpoint with multiple filters', async () => {
      const mockData = [mockCardSummary];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      await getCards({
        arcanaType: ArcanaType.MINOR,
        suit: Suit.WANDS,
        element: Element.FIRE,
        search: 'fuego',
        courtOnly: true,
      });

      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('arcanaType=minor'));
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('suit=wands'));
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('element=fire'));
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('search=fuego'));
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('courtOnly=true'));
    });
  });

  describe('getMajorArcana', () => {
    it('should call correct endpoint and return major arcana cards', async () => {
      const mockData = [mockCardSummary];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getMajorArcana();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ENCYCLOPEDIA.MAJOR);
      expect(result).toEqual(mockData);
    });
  });

  describe('getCardsBySuit', () => {
    it('should call correct endpoint with suit and return cards', async () => {
      const mockData = [{ ...mockCardSummary, arcanaType: ArcanaType.MINOR, suit: Suit.CUPS }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getCardsBySuit(Suit.CUPS);

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ENCYCLOPEDIA.BY_SUIT(Suit.CUPS));
      expect(result).toEqual(mockData);
    });

    it('should work with different suits', async () => {
      const mockData = [{ ...mockCardSummary, suit: Suit.SWORDS }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      await getCardsBySuit(Suit.SWORDS);

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ENCYCLOPEDIA.BY_SUIT(Suit.SWORDS));
    });
  });

  describe('searchCards', () => {
    it('should call correct endpoint with query', async () => {
      const mockData = [mockCardSummary];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await searchCards('loco');

      expect(apiClient.get).toHaveBeenCalledWith(`${API_ENDPOINTS.ENCYCLOPEDIA.SEARCH}?q=loco`);
      expect(result).toEqual(mockData);
    });

    it('should encode special characters in query', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

      await searchCards('copa y agua');

      expect(apiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.ENCYCLOPEDIA.SEARCH}?q=copa+y+agua`
      );
    });
  });

  describe('getCardBySlug', () => {
    it('should call correct endpoint with slug and return card detail', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCardDetail });

      const result = await getCardBySlug('the-fool');

      expect(apiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ENCYCLOPEDIA.CARD_DETAIL('the-fool')
      );
      expect(result).toEqual(mockCardDetail);
      expect(result.nameEn).toBe('The Fool');
      expect(result.keywords.upright).toHaveLength(2);
    });

    it('should work with different slugs', async () => {
      const aceOfCups = { ...mockCardDetail, slug: 'ace-of-cups', suit: Suit.CUPS };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: aceOfCups });

      const result = await getCardBySlug('ace-of-cups');

      expect(apiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ENCYCLOPEDIA.CARD_DETAIL('ace-of-cups')
      );
      expect(result.slug).toBe('ace-of-cups');
    });
  });

  describe('getRelatedCards', () => {
    it('should call correct endpoint with slug and return related cards', async () => {
      const mockData = [{ ...mockCardSummary, id: 2, slug: 'the-magician', nameEs: 'El Mago' }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getRelatedCards('the-fool');

      expect(apiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ENCYCLOPEDIA.CARD_RELATED('the-fool')
      );
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(1);
    });
  });

  describe('getCardNavigation', () => {
    it('should call correct endpoint with slug and return navigation', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockNavigation });

      const result = await getCardNavigation('the-fool');

      expect(apiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ENCYCLOPEDIA.CARD_NAVIGATION('the-fool')
      );
      expect(result).toEqual(mockNavigation);
      expect(result.previous).toBeNull();
      expect(result.next?.slug).toBe('the-magician');
    });

    it('should handle navigation with both previous and next', async () => {
      const fullNav = {
        previous: mockCardSummary,
        next: { ...mockCardSummary, id: 3, slug: 'the-high-priestess' },
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: fullNav });

      const result = await getCardNavigation('the-magician');

      expect(result.previous?.slug).toBe('the-fool');
      expect(result.next?.slug).toBe('the-high-priestess');
    });
  });
});
