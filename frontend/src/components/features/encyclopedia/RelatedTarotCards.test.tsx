import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { RelatedTarotCards } from './RelatedTarotCards';
import { ArcanaType } from '@/types/encyclopedia.types';
import type { CardSummary } from '@/types/encyclopedia.types';

// Mock the useCards hook (data source for resolving card IDs)
vi.mock('@/hooks/api/useEncyclopedia', () => ({
  useCards: vi.fn(),
}));

import { useCards } from '@/hooks/api/useEncyclopedia';

const mockUseCards = vi.mocked(useCards);

function createCard(overrides?: Partial<CardSummary>): CardSummary {
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

const ALL_CARDS: CardSummary[] = [
  createCard({ id: 1, slug: 'the-magician', nameEs: 'El Mago' }),
  createCard({ id: 3, slug: 'the-empress', nameEs: 'La Emperatriz' }),
  createCard({ id: 10, slug: 'wheel-of-fortune', nameEs: 'La Rueda de la Fortuna' }),
  createCard({ id: 5, slug: 'the-hierophant', nameEs: 'El Sumo Sacerdote' }),
];

function mockCards(cards: CardSummary[] | undefined, isLoading = false) {
  mockUseCards.mockReturnValue({
    data: cards,
    isLoading,
  } as ReturnType<typeof useCards>);
}

describe('RelatedTarotCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should render a skeleton while cards are loading', () => {
      mockCards(undefined, true);

      render(<RelatedTarotCards cardIds={[1, 3, 10]} />);

      expect(screen.getByTestId('related-tarot-cards-skeleton')).toBeInTheDocument();
    });

    it('should render one skeleton placeholder per card ID', () => {
      mockCards(undefined, true);

      render(<RelatedTarotCards cardIds={[1, 3, 10]} />);

      expect(screen.getByTestId('related-tarot-cards-skeleton').children).toHaveLength(3);
    });
  });

  describe('Section wrapper', () => {
    it('should render the section with its heading when cards resolve', () => {
      mockCards(ALL_CARDS);

      render(<RelatedTarotCards cardIds={[1, 3]} />);

      expect(screen.getByTestId('related-tarot-cards')).toBeInTheDocument();
      expect(screen.getByText('Cartas de Tarot Relacionadas')).toBeInTheDocument();
    });

    it('should not render the section heading when no IDs resolve', () => {
      mockCards(ALL_CARDS);

      render(<RelatedTarotCards cardIds={[999]} />);

      expect(screen.queryByTestId('related-tarot-cards')).not.toBeInTheDocument();
      expect(screen.queryByText('Cartas de Tarot Relacionadas')).not.toBeInTheDocument();
    });
  });

  describe('Empty / unresolved state', () => {
    it('should render nothing when no IDs resolve to a card', () => {
      mockCards(ALL_CARDS);

      const { container } = render(<RelatedTarotCards cardIds={[999, 1000]} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when cardIds is empty', () => {
      mockCards(ALL_CARDS);

      const { container } = render(<RelatedTarotCards cardIds={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when cards data is undefined and not loading', () => {
      mockCards(undefined, false);

      const { container } = render(<RelatedTarotCards cardIds={[1, 3]} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Resolved cards', () => {
    it('should render each related card name (not the raw ID)', () => {
      mockCards(ALL_CARDS);

      render(<RelatedTarotCards cardIds={[1, 3, 10]} />);

      expect(screen.getByText('El Mago')).toBeInTheDocument();
      expect(screen.getByText('La Emperatriz')).toBeInTheDocument();
      expect(screen.getByText('La Rueda de la Fortuna')).toBeInTheDocument();
      expect(screen.queryByText('#1')).not.toBeInTheDocument();
    });

    it('should render a thumbnail image for each card', () => {
      mockCards(ALL_CARDS);

      render(<RelatedTarotCards cardIds={[1, 3]} />);

      expect(screen.getByAltText('El Mago')).toBeInTheDocument();
      expect(screen.getByAltText('La Emperatriz')).toBeInTheDocument();
    });

    it('should link each card to its tarot detail page /enciclopedia/tarot/[slug]', () => {
      mockCards(ALL_CARDS);

      render(<RelatedTarotCards cardIds={[1, 3]} />);

      const links = screen.getAllByRole('link');
      const hrefs = links.map((link) => link.getAttribute('href'));
      expect(hrefs).toContain('/enciclopedia/tarot/the-magician');
      expect(hrefs).toContain('/enciclopedia/tarot/the-empress');
    });

    it('should only render cards whose IDs exist, skipping unknown IDs', () => {
      mockCards(ALL_CARDS);

      render(<RelatedTarotCards cardIds={[1, 999, 3]} />);

      expect(screen.getByText('El Mago')).toBeInTheDocument();
      expect(screen.getByText('La Emperatriz')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(2);
    });

    it('should preserve the order given by cardIds', () => {
      mockCards(ALL_CARDS);

      render(<RelatedTarotCards cardIds={[10, 1, 3]} />);

      const names = screen.getAllByTestId(/^card-thumbnail-/).map((el) => el.textContent);
      expect(names).toEqual([
        expect.stringContaining('La Rueda de la Fortuna'),
        expect.stringContaining('El Mago'),
        expect.stringContaining('La Emperatriz'),
      ]);
    });
  });
});
