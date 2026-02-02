import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { RitualGrid } from './RitualGrid';
import type { RitualSummary } from '@/types/ritual.types';
import { RitualCategory, RitualDifficulty, LunarPhase } from '@/types/ritual.types';

/**
 * Factory function to create test ritual data
 */
function createTestRitual(overrides?: Partial<RitualSummary>): RitualSummary {
  return {
    id: 1,
    slug: 'test-ritual',
    title: 'Test Ritual',
    description: 'Test description',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 30,
    stepsCount: 5,
    materialsCount: 3,
    imageUrl: '/test-image.jpg',
    bestLunarPhase: LunarPhase.FULL_MOON,
    ...overrides,
  };
}

describe('RitualGrid', () => {
  describe('Loading state', () => {
    it('should render loading skeleton when isLoading is true', () => {
      render(<RitualGrid rituals={[]} isLoading={true} />);

      const skeleton = screen.getByTestId('rituals-skeleton');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render skeleton with grid variant', () => {
      render(<RitualGrid rituals={[]} isLoading={true} />);

      const skeleton = screen.getByTestId('rituals-skeleton');
      expect(skeleton).toHaveAttribute('data-variant', 'grid');
    });

    it('should not render rituals when loading', () => {
      const rituals = [createTestRitual({ id: 1 }), createTestRitual({ id: 2 })];

      render(<RitualGrid rituals={rituals} isLoading={true} />);

      const cards = screen.queryAllByTestId(/ritual-card-/);
      expect(cards).toHaveLength(0);
    });
  });

  describe('Empty state', () => {
    it('should show default empty message when rituals array is empty', () => {
      render(<RitualGrid rituals={[]} />);

      const emptyMessage = screen.getByText('No se encontraron rituales');
      expect(emptyMessage).toBeInTheDocument();
    });

    it('should show custom empty message when provided', () => {
      render(<RitualGrid rituals={[]} emptyMessage="No hay rituales disponibles" />);

      const emptyMessage = screen.getByText('No hay rituales disponibles');
      expect(emptyMessage).toBeInTheDocument();
    });

    it('should apply correct styles to empty message', () => {
      render(<RitualGrid rituals={[]} />);

      const emptyMessage = screen.getByText('No se encontraron rituales');
      expect(emptyMessage).toHaveClass('text-center', 'py-12', 'text-muted-foreground');
    });

    it('should not show empty message when isLoading is true', () => {
      render(<RitualGrid rituals={[]} isLoading={true} />);

      const emptyMessage = screen.queryByText('No se encontraron rituales');
      expect(emptyMessage).not.toBeInTheDocument();
    });
  });

  describe('Rendering rituals', () => {
    it('should render grid of ritual cards', () => {
      const rituals = [
        createTestRitual({ id: 1, slug: 'ritual-1' }),
        createTestRitual({ id: 2, slug: 'ritual-2' }),
        createTestRitual({ id: 3, slug: 'ritual-3' }),
      ];

      render(<RitualGrid rituals={rituals} />);

      const card1 = screen.getByTestId('ritual-card-ritual-1');
      const card2 = screen.getByTestId('ritual-card-ritual-2');
      const card3 = screen.getByTestId('ritual-card-ritual-3');

      expect(card1).toBeInTheDocument();
      expect(card2).toBeInTheDocument();
      expect(card3).toBeInTheDocument();
    });

    it('should render correct number of cards', () => {
      const rituals = [
        createTestRitual({ id: 1, slug: 'ritual-1' }),
        createTestRitual({ id: 2, slug: 'ritual-2' }),
        createTestRitual({ id: 3, slug: 'ritual-3' }),
        createTestRitual({ id: 4, slug: 'ritual-4' }),
        createTestRitual({ id: 5, slug: 'ritual-5' }),
      ];

      render(<RitualGrid rituals={rituals} />);

      const cards = screen.getAllByTestId(/ritual-card-/);
      expect(cards).toHaveLength(5);
    });

    it('should render single ritual', () => {
      const rituals = [createTestRitual({ id: 1, slug: 'single-ritual' })];

      render(<RitualGrid rituals={rituals} />);

      const card = screen.getByTestId('ritual-card-single-ritual');
      expect(card).toBeInTheDocument();
    });

    it('should use ritual id as key (verifiable through proper rendering)', () => {
      const rituals = [
        createTestRitual({ id: 100, slug: 'ritual-100' }),
        createTestRitual({ id: 200, slug: 'ritual-200' }),
      ];

      render(<RitualGrid rituals={rituals} />);

      // If keys weren't unique, React would warn. We verify proper rendering.
      const cards = screen.getAllByTestId(/ritual-card-/);
      expect(cards).toHaveLength(2);
    });
  });

  describe('Grid layout', () => {
    it('should apply responsive grid classes', () => {
      const rituals = [createTestRitual()];

      const { container } = render(<RitualGrid rituals={rituals} />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid', 'gap-6', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should apply custom className to grid container', () => {
      const rituals = [createTestRitual()];

      const { container } = render(<RitualGrid rituals={rituals} className="custom-grid" />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('custom-grid');
    });

    it('should merge custom className with default classes', () => {
      const rituals = [createTestRitual()];

      const { container } = render(
        <RitualGrid rituals={rituals} className="custom-spacing mt-8" />
      );

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass(
        'grid',
        'gap-6',
        'sm:grid-cols-2',
        'lg:grid-cols-3',
        'mt-8',
        'custom-spacing'
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle large number of rituals', () => {
      const rituals = Array.from({ length: 50 }, (_, i) =>
        createTestRitual({ id: i + 1, slug: `ritual-${i + 1}` })
      );

      render(<RitualGrid rituals={rituals} />);

      const cards = screen.getAllByTestId(/ritual-card-/);
      expect(cards).toHaveLength(50);
    });

    it('should handle rituals with different categories', () => {
      const rituals = [
        createTestRitual({ id: 1, slug: 'lunar', category: RitualCategory.LUNAR }),
        createTestRitual({ id: 2, slug: 'tarot', category: RitualCategory.TAROT }),
        createTestRitual({ id: 3, slug: 'cleansing', category: RitualCategory.CLEANSING }),
        createTestRitual({ id: 4, slug: 'protection', category: RitualCategory.PROTECTION }),
      ];

      render(<RitualGrid rituals={rituals} />);

      const cards = screen.getAllByTestId(/ritual-card-/);
      expect(cards).toHaveLength(4);
    });

    it('should handle rituals with minimal data', () => {
      const rituals = [
        createTestRitual({
          id: 1,
          slug: 'minimal',
          stepsCount: 0,
          materialsCount: 0,
          bestLunarPhase: null,
        }),
      ];

      render(<RitualGrid rituals={rituals} />);

      const card = screen.getByTestId('ritual-card-minimal');
      expect(card).toBeInTheDocument();
    });
  });

  describe('State transitions', () => {
    it('should transition from loading to loaded state', () => {
      const rituals = [createTestRitual({ id: 1, slug: 'ritual-1' })];

      const { rerender } = render(<RitualGrid rituals={[]} isLoading={true} />);

      // Initially loading
      expect(screen.getByTestId('rituals-skeleton')).toBeInTheDocument();

      // Then loaded
      rerender(<RitualGrid rituals={rituals} isLoading={false} />);

      expect(screen.queryByTestId('rituals-skeleton')).not.toBeInTheDocument();
      expect(screen.getByTestId('ritual-card-ritual-1')).toBeInTheDocument();
    });

    it('should transition from empty to populated state', () => {
      const rituals = [createTestRitual({ id: 1, slug: 'ritual-1' })];

      const { rerender } = render(<RitualGrid rituals={[]} />);

      // Initially empty
      expect(screen.getByText('No se encontraron rituales')).toBeInTheDocument();

      // Then populated
      rerender(<RitualGrid rituals={rituals} />);

      expect(screen.queryByText('No se encontraron rituales')).not.toBeInTheDocument();
      expect(screen.getByTestId('ritual-card-ritual-1')).toBeInTheDocument();
    });

    it('should transition from populated to empty state', () => {
      const rituals = [createTestRitual({ id: 1, slug: 'ritual-1' })];

      const { rerender } = render(<RitualGrid rituals={rituals} />);

      // Initially populated
      expect(screen.getByTestId('ritual-card-ritual-1')).toBeInTheDocument();

      // Then empty
      rerender(<RitualGrid rituals={[]} />);

      expect(screen.queryByTestId('ritual-card-ritual-1')).not.toBeInTheDocument();
      expect(screen.getByText('No se encontraron rituales')).toBeInTheDocument();
    });
  });
});
