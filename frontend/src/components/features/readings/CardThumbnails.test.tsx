import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

import { CardThumbnails } from './CardThumbnails';
import type { CardPreview } from '@/types/reading.types';

// Mock next/image
vi.mock('next/image', () => ({
  default: function MockImage({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Factory function for creating test card previews
function createCardPreview(overrides: Partial<CardPreview> = {}): CardPreview {
  return {
    id: 1,
    name: 'El Loco',
    imageUrl: '/images/cards/fool.jpg',
    isReversed: false,
    ...overrides,
  };
}

describe('CardThumbnails', () => {
  describe('Rendering', () => {
    it('should render placeholder icon when no cards provided', () => {
      render(<CardThumbnails />);

      const placeholder = screen.getByTestId('card-thumbnails-placeholder');
      expect(placeholder).toBeInTheDocument();
    });

    it('should render placeholder icon when empty cards array provided', () => {
      render(<CardThumbnails cards={[]} />);

      const placeholder = screen.getByTestId('card-thumbnails-placeholder');
      expect(placeholder).toBeInTheDocument();
    });

    it('should render card thumbnails when cards provided', () => {
      const cards = [
        createCardPreview({ id: 1, name: 'El Loco' }),
        createCardPreview({ id: 2, name: 'El Mago' }),
      ];

      render(<CardThumbnails cards={cards} />);

      expect(screen.getByAltText('El Loco')).toBeInTheDocument();
      expect(screen.getByAltText('El Mago')).toBeInTheDocument();
    });

    it('should render maximum 3 cards by default', () => {
      const cards = [
        createCardPreview({ id: 1, name: 'Carta 1' }),
        createCardPreview({ id: 2, name: 'Carta 2' }),
        createCardPreview({ id: 3, name: 'Carta 3' }),
        createCardPreview({ id: 4, name: 'Carta 4' }),
        createCardPreview({ id: 5, name: 'Carta 5' }),
      ];

      render(<CardThumbnails cards={cards} />);

      // Should show first 3 cards
      expect(screen.getByAltText('Carta 1')).toBeInTheDocument();
      expect(screen.getByAltText('Carta 2')).toBeInTheDocument();
      expect(screen.getByAltText('Carta 3')).toBeInTheDocument();
      // Should NOT show cards 4 and 5
      expect(screen.queryByAltText('Carta 4')).not.toBeInTheDocument();
      expect(screen.queryByAltText('Carta 5')).not.toBeInTheDocument();
    });

    it('should respect custom max prop', () => {
      const cards = [
        createCardPreview({ id: 1, name: 'Carta 1' }),
        createCardPreview({ id: 2, name: 'Carta 2' }),
        createCardPreview({ id: 3, name: 'Carta 3' }),
      ];

      render(<CardThumbnails cards={cards} max={2} />);

      // Should show only first 2 cards
      expect(screen.getByAltText('Carta 1')).toBeInTheDocument();
      expect(screen.getByAltText('Carta 2')).toBeInTheDocument();
      expect(screen.queryByAltText('Carta 3')).not.toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should render stacked layout by default', () => {
      const cards = [
        createCardPreview({ id: 1, name: 'Carta 1' }),
        createCardPreview({ id: 2, name: 'Carta 2' }),
      ];

      const { container } = render(<CardThumbnails cards={cards} />);

      const wrapper = container.querySelector('[data-testid="card-thumbnails-wrapper"]');
      expect(wrapper).toHaveClass('flex');
      // Stacked layout should have negative margin (overlap)
      expect(wrapper?.querySelectorAll('img')[1]?.parentElement).toHaveClass('-ml-2');
    });

    it('should render row layout when stacked is false', () => {
      const cards = [
        createCardPreview({ id: 1, name: 'Carta 1' }),
        createCardPreview({ id: 2, name: 'Carta 2' }),
      ];

      const { container } = render(<CardThumbnails cards={cards} stacked={false} />);

      const wrapper = container.querySelector('[data-testid="card-thumbnails-wrapper"]');
      expect(wrapper).toHaveClass('flex');
      // Row layout should have gap
      expect(wrapper).toHaveClass('gap-1');
    });
  });

  describe('Size variants', () => {
    it('should render small size by default', () => {
      const cards = [createCardPreview({ id: 1, name: 'Carta 1' })];

      const { container } = render(<CardThumbnails cards={cards} />);

      const thumbnail = container.querySelector('img')?.parentElement;
      expect(thumbnail).toHaveClass('h-12', 'w-9');
    });

    it('should render medium size when specified', () => {
      const cards = [createCardPreview({ id: 1, name: 'Carta 1' })];

      const { container } = render(<CardThumbnails cards={cards} size="md" />);

      const thumbnail = container.querySelector('img')?.parentElement;
      expect(thumbnail).toHaveClass('h-16', 'w-12');
    });
  });

  describe('Reversed card indicator', () => {
    it('should show indicator for reversed cards', () => {
      const cards = [
        createCardPreview({ id: 1, name: 'Carta 1', isReversed: false }),
        createCardPreview({ id: 2, name: 'Carta 2', isReversed: true }),
      ];

      render(<CardThumbnails cards={cards} />);

      const reversedIndicators = screen.getAllByTestId('card-reversed-indicator');
      // Only one indicator (for the reversed card)
      expect(reversedIndicators).toHaveLength(1);
    });

    it('should not show indicator when no cards are reversed', () => {
      const cards = [
        createCardPreview({ id: 1, name: 'Carta 1', isReversed: false }),
        createCardPreview({ id: 2, name: 'Carta 2', isReversed: false }),
      ];

      render(<CardThumbnails cards={cards} />);

      const reversedIndicators = screen.queryAllByTestId('card-reversed-indicator');
      expect(reversedIndicators).toHaveLength(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for each card image', () => {
      const cards = [
        createCardPreview({ id: 1, name: 'El Loco' }),
        createCardPreview({ id: 2, name: 'El Mago' }),
      ];

      render(<CardThumbnails cards={cards} />);

      expect(screen.getByAltText('El Loco')).toBeInTheDocument();
      expect(screen.getByAltText('El Mago')).toBeInTheDocument();
    });

    it('should have proper aria-label for placeholder', () => {
      render(<CardThumbnails />);

      const placeholder = screen.getByTestId('card-thumbnails-placeholder');
      expect(placeholder).toHaveAttribute('aria-label', 'No hay cartas disponibles');
    });
  });

  describe('Edge cases', () => {
    it('should handle single card', () => {
      const cards = [createCardPreview({ id: 1, name: 'Carta 1' })];

      render(<CardThumbnails cards={cards} />);

      expect(screen.getByAltText('Carta 1')).toBeInTheDocument();
    });

    it('should handle max=0 by showing placeholder', () => {
      const cards = [createCardPreview({ id: 1, name: 'Carta 1' })];

      render(<CardThumbnails cards={cards} max={0} />);

      const placeholder = screen.getByTestId('card-thumbnails-placeholder');
      expect(placeholder).toBeInTheDocument();
    });

    it('should handle negative max by using default', () => {
      const cards = [
        createCardPreview({ id: 1, name: 'Carta 1' }),
        createCardPreview({ id: 2, name: 'Carta 2' }),
        createCardPreview({ id: 3, name: 'Carta 3' }),
        createCardPreview({ id: 4, name: 'Carta 4' }),
      ];

      render(<CardThumbnails cards={cards} max={-1} />);

      // Should use default (3)
      expect(screen.getByAltText('Carta 1')).toBeInTheDocument();
      expect(screen.getByAltText('Carta 2')).toBeInTheDocument();
      expect(screen.getByAltText('Carta 3')).toBeInTheDocument();
      expect(screen.queryByAltText('Carta 4')).not.toBeInTheDocument();
    });
  });
});
