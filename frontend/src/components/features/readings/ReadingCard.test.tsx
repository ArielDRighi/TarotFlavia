import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ReadingCard } from './ReadingCard';
import type { Reading, ReadingCard as ReadingCardType } from '@/types/reading.types';

// Mock date utils
vi.mock('@/lib/utils/date', () => ({
  formatDateShort: vi.fn(() => '05/12/2025'),
}));

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

// Factory function for creating test readings
function createTestReading(overrides: Partial<Reading> = {}): Reading {
  return {
    id: 1,
    spreadId: 1,
    spreadName: 'Cruz Céltica',
    question: '¿Qué me depara el futuro en el amor?',
    createdAt: '2025-12-05T10:00:00Z',
    cardsCount: 10,
    deletedAt: null,
    shareToken: null,
    ...overrides,
  };
}

// Factory function for creating test cards
function createTestCards(count: number = 3): ReadingCardType[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Carta ${index + 1}`,
    arcana: 'major' as const,
    number: index + 1,
    suit: null,
    orientation: 'upright' as const,
    position: index + 1,
    positionName: `Posición ${index + 1}`,
    imageUrl: `/images/cards/card-${index + 1}.jpg`,
    isReversed: false,
    meaningUpright: undefined,
    meaningReversed: undefined,
    keywords: undefined,
    description: undefined,
  }));
}

describe('ReadingCard', () => {
  const mockOnView = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the reading question', () => {
      const reading = createTestReading();

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      expect(screen.getByText(reading.question)).toBeInTheDocument();
    });

    it('should render the date in short format', () => {
      const reading = createTestReading();

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      // BUGFIX: Changed from relative time to short date format to avoid UTC issues
      expect(screen.getByText('05/12/2025')).toBeInTheDocument();
    });

    it('should render the spread type badge in right section', () => {
      const reading = createTestReading({ spreadName: 'Tres Cartas' });

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      const badge = screen.getByTestId('spread-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Tres Cartas');
    });

    it('should truncate long questions to one line', () => {
      const longQuestion =
        'Esta es una pregunta muy larga que debería ser truncada después de una línea para mantener un diseño consistente en las tarjetas del historial de lecturas';
      const reading = createTestReading({ question: longQuestion });

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      const questionElement = screen.getByText(longQuestion);
      expect(questionElement).toHaveClass('line-clamp-1');
    });

    it('should render a card icon when no cards are available', () => {
      const reading = createTestReading({ cardsCount: 0 });

      render(<ReadingCard reading={reading} cards={[]} onView={mockOnView} />);

      expect(screen.getByTestId('card-placeholder-icon')).toBeInTheDocument();
    });

    it('should render the first card thumbnail when cards are provided', () => {
      const reading = createTestReading();
      const cards = createTestCards(3);

      render(<ReadingCard reading={reading} cards={cards} onView={mockOnView} />);

      const thumbnail = screen.getByTestId('card-thumbnail');
      expect(thumbnail).toBeInTheDocument();
    });

    it('should render view button', () => {
      const reading = createTestReading();

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      expect(screen.getByRole('button', { name: /ver/i })).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onView with reading id when view button is clicked', async () => {
      const user = userEvent.setup();
      const reading = createTestReading({ id: 42 });

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      await user.click(screen.getByRole('button', { name: /ver/i }));

      expect(mockOnView).toHaveBeenCalledTimes(1);
      expect(mockOnView).toHaveBeenCalledWith(42);
    });
  });

  describe('Responsive Design', () => {
    it('should have correct responsive layout classes', () => {
      const reading = createTestReading();

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      const card = screen.getByTestId('reading-card');
      // Should have flex-row layout (horizontal) with items-center
      expect(card).toHaveClass('flex');
      expect(card).toHaveClass('flex-row');
      expect(card).toHaveClass('items-center');
    });
  });

  describe('Styling', () => {
    it('should have shadow-soft class for soft shadow', () => {
      const reading = createTestReading();

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      const card = screen.getByTestId('reading-card');
      expect(card).toHaveClass('shadow-sm');
    });

    it('should have hover effects', () => {
      const reading = createTestReading();

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      const card = screen.getByTestId('reading-card');
      expect(card).toHaveClass('hover:shadow-md');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button label', () => {
      const reading = createTestReading();

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      expect(screen.getByRole('button', { name: /ver lectura/i })).toBeInTheDocument();
    });

    it('should be focusable via keyboard', async () => {
      const user = userEvent.setup();
      const reading = createTestReading();

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      // Tab to view button
      await user.tab();
      expect(screen.getByRole('button', { name: /ver/i })).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle reading without spreadName gracefully', () => {
      const reading = createTestReading({ spreadName: '' });

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      // Should not show empty badge
      expect(screen.queryByTestId('spread-badge')).not.toBeInTheDocument();
    });

    it('should handle reading with empty cardPreviews', () => {
      const reading = createTestReading({ cardPreviews: [] });

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      // Should show placeholder icon when no cardPreviews
      expect(screen.getByTestId('card-placeholder-icon')).toBeInTheDocument();
    });

    it('should render card thumbnail from cardPreviews if available', () => {
      const reading = createTestReading({
        cardPreviews: [
          {
            id: 1,
            name: 'El Loco',
            imageUrl: '/images/cards/the-fool.jpg',
            isReversed: false,
          },
        ],
      });

      render(<ReadingCard reading={reading} onView={mockOnView} />);

      const thumbnail = screen.getByTestId('card-thumbnail');
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute('src', '/images/cards/the-fool.jpg');
    });
  });
});
