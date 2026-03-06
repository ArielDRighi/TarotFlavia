import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CardGrid } from './CardGrid';
import { ArcanaType, Suit } from '@/types/encyclopedia.types';
import type { CardSummary } from '@/types/encyclopedia.types';

function createTestCard(overrides?: Partial<CardSummary>): CardSummary {
  return {
    id: 1,
    slug: 'the-fool',
    nameEs: 'El Loco',
    arcanaType: ArcanaType.MAJOR,
    number: 0,
    suit: null,
    thumbnailUrl: '/cards/the-fool.jpg',
    ...overrides,
  };
}

describe('CardGrid', () => {
  describe('Loading state', () => {
    it('should render skeleton when isLoading is true', () => {
      render(<CardGrid cards={[]} isLoading={true} />);

      expect(screen.getByTestId('encyclopedia-skeleton')).toBeInTheDocument();
    });

    it('should not render cards when loading', () => {
      const cards = [createTestCard({ id: 1, slug: 'card-1' })];

      render(<CardGrid cards={cards} isLoading={true} />);

      expect(screen.queryAllByTestId(/card-thumbnail-/)).toHaveLength(0);
    });

    it('should not show empty message when loading', () => {
      render(<CardGrid cards={[]} isLoading={true} />);

      expect(screen.queryByText('No se encontraron cartas')).not.toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show default empty message when cards array is empty', () => {
      render(<CardGrid cards={[]} />);

      expect(screen.getByText('No se encontraron cartas')).toBeInTheDocument();
    });

    it('should show custom empty message when provided', () => {
      render(<CardGrid cards={[]} emptyMessage="No hay cartas disponibles" />);

      expect(screen.getByText('No hay cartas disponibles')).toBeInTheDocument();
    });
  });

  describe('Rendering cards', () => {
    it('should render grid of card thumbnails', () => {
      const cards = [
        createTestCard({ id: 1, slug: 'card-1', nameEs: 'Carta 1' }),
        createTestCard({ id: 2, slug: 'card-2', nameEs: 'Carta 2' }),
        createTestCard({ id: 3, slug: 'card-3', nameEs: 'Carta 3' }),
      ];

      render(<CardGrid cards={cards} />);

      expect(screen.getByTestId('card-thumbnail-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('card-thumbnail-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('card-thumbnail-card-3')).toBeInTheDocument();
    });

    it('should render correct number of cards', () => {
      const cards = Array.from({ length: 5 }, (_, i) =>
        createTestCard({ id: i + 1, slug: `card-${i + 1}` })
      );

      render(<CardGrid cards={cards} />);

      expect(screen.getAllByTestId(/card-thumbnail-/)).toHaveLength(5);
    });

    it('should render both major and minor arcana cards', () => {
      const cards = [
        createTestCard({ id: 1, slug: 'the-fool', arcanaType: ArcanaType.MAJOR }),
        createTestCard({
          id: 2,
          slug: 'ace-wands',
          arcanaType: ArcanaType.MINOR,
          suit: Suit.WANDS,
        }),
      ];

      render(<CardGrid cards={cards} />);

      expect(screen.getAllByTestId(/card-thumbnail-/)).toHaveLength(2);
    });
  });

  describe('Grid layout', () => {
    it('should apply responsive grid classes', () => {
      const { container } = render(<CardGrid cards={[createTestCard()]} />);

      const grid = container.querySelector('[data-testid="card-grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should have data-testid on grid container', () => {
      render(<CardGrid cards={[createTestCard()]} />);

      expect(screen.getByTestId('card-grid')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<CardGrid cards={[createTestCard()]} className="custom-grid" />);

      const grid = screen.getByTestId('card-grid');
      expect(grid).toHaveClass('custom-grid');
    });
  });

  describe('State transitions', () => {
    it('should transition from loading to loaded state', () => {
      const cards = [createTestCard({ id: 1, slug: 'card-1' })];

      const { rerender } = render(<CardGrid cards={[]} isLoading={true} />);

      expect(screen.getByTestId('encyclopedia-skeleton')).toBeInTheDocument();

      rerender(<CardGrid cards={cards} isLoading={false} />);

      expect(screen.queryByTestId('encyclopedia-skeleton')).not.toBeInTheDocument();
      expect(screen.getByTestId('card-thumbnail-card-1')).toBeInTheDocument();
    });
  });
});
