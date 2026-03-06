import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { RelatedCards } from './RelatedCards';
import { ArcanaType } from '@/types/encyclopedia.types';
import type { CardSummary } from '@/types/encyclopedia.types';

// Mock the useRelatedCards hook
vi.mock('@/hooks/api/useEncyclopedia', () => ({
  useRelatedCards: vi.fn(),
}));

import { useRelatedCards } from '@/hooks/api/useEncyclopedia';

const mockUseRelatedCards = vi.mocked(useRelatedCards);

function createRelatedCard(overrides?: Partial<CardSummary>): CardSummary {
  return {
    id: 1,
    slug: 'the-magician',
    nameEs: 'El Mago',
    arcanaType: ArcanaType.MAJOR,
    number: 1,
    suit: null,
    thumbnailUrl: '/images/tarot/magician.jpg',
    ...overrides,
  };
}

describe('RelatedCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should render skeleton while loading', () => {
      mockUseRelatedCards.mockReturnValue({
        data: undefined,
        isLoading: true,
      } as ReturnType<typeof useRelatedCards>);

      render(<RelatedCards slug="the-fool" />);

      expect(screen.getByTestId('related-cards-skeleton')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should render nothing when no related cards', () => {
      mockUseRelatedCards.mockReturnValue({
        data: [] as CardSummary[],
        isLoading: false,
      } as ReturnType<typeof useRelatedCards>);

      const { container } = render(<RelatedCards slug="the-fool" />);

      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when data is undefined', () => {
      mockUseRelatedCards.mockReturnValue({
        data: undefined,
        isLoading: false,
      } as ReturnType<typeof useRelatedCards>);

      const { container } = render(<RelatedCards slug="the-fool" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('With related cards', () => {
    it('should render component with data-testid', () => {
      mockUseRelatedCards.mockReturnValue({
        data: [createRelatedCard()],
        isLoading: false,
      } as ReturnType<typeof useRelatedCards>);

      render(<RelatedCards slug="the-fool" />);

      expect(screen.getByTestId('related-cards')).toBeInTheDocument();
    });

    it('should render "Cartas Relacionadas" heading', () => {
      mockUseRelatedCards.mockReturnValue({
        data: [createRelatedCard()],
        isLoading: false,
      } as ReturnType<typeof useRelatedCards>);

      render(<RelatedCards slug="the-fool" />);

      expect(screen.getByText('Cartas Relacionadas')).toBeInTheDocument();
    });

    it('should render all related card thumbnails', () => {
      const cards = [
        createRelatedCard({ id: 1, slug: 'the-magician', nameEs: 'El Mago' }),
        createRelatedCard({ id: 2, slug: 'the-empress', nameEs: 'La Emperatriz' }),
      ];

      mockUseRelatedCards.mockReturnValue({
        data: cards,
        isLoading: false,
      } as ReturnType<typeof useRelatedCards>);

      render(<RelatedCards slug="the-fool" />);

      expect(screen.getByTestId('card-thumbnail-the-magician')).toBeInTheDocument();
      expect(screen.getByTestId('card-thumbnail-the-empress')).toBeInTheDocument();
    });
  });
});
