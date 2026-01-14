import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { DailyReadingCard } from './DailyReadingCard';
import type { DailyReadingHistoryItem } from '@/types';

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date: Date, formatStr: string) => {
    if (formatStr === "EEEE d 'de' MMMM") {
      return 'Lunes 2 de Diciembre';
    }
    return '02/12/2025';
  }),
}));

// Mock date-fns locale
vi.mock('date-fns/locale', () => ({
  es: {},
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

// Factory function for creating test daily reading history items
function createTestDailyReading(
  overrides: Partial<DailyReadingHistoryItem> = {}
): DailyReadingHistoryItem {
  return {
    id: 1,
    readingDate: '2025-12-02T00:00:00Z',
    cardName: 'El Mago',
    cardImageUrl: 'https://example.com/cards/el-mago.jpg',
    isReversed: false,
    interpretationSummary:
      'El Mago simboliza el poder de la voluntad y la manifestación. Hoy tienes todas las herramientas necesarias para lograr tus metas.',
    wasRegenerated: false,
    createdAt: new Date('2025-12-02T08:30:00Z'),
    ...overrides,
  };
}

describe('DailyReadingCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the formatted date prominently', () => {
      const reading = createTestDailyReading();

      render(<DailyReadingCard reading={reading} />);

      expect(screen.getByText('Lunes 2 de Diciembre')).toBeInTheDocument();
    });

    it('should render the card name', () => {
      const reading = createTestDailyReading({ cardName: 'La Emperatriz' });

      render(<DailyReadingCard reading={reading} />);

      expect(screen.getByText('La Emperatriz')).toBeInTheDocument();
    });

    it('should render the full interpretation (not truncated)', () => {
      const reading = createTestDailyReading({
        interpretationSummary: 'Esta es la interpretación de prueba.',
      });

      render(<DailyReadingCard reading={reading} />);

      expect(screen.getByText('Esta es la interpretación de prueba.')).toBeInTheDocument();
    });

    it('should render full interpretation even when long', () => {
      const longInterpretation =
        'Esta es una interpretación muy larga que se muestra completa en el card porque es auto-contenido. Contiene muchas palabras adicionales para verificar que se muestra toda.';
      const reading = createTestDailyReading({
        interpretationSummary: longInterpretation,
      });

      render(<DailyReadingCard reading={reading} />);

      expect(screen.getByText(longInterpretation)).toBeInTheDocument();
    });

    it('should show reversed indicator when card is reversed', () => {
      const reading = createTestDailyReading({ isReversed: true });

      render(<DailyReadingCard reading={reading} />);

      expect(screen.getByText(/invertida/i)).toBeInTheDocument();
    });

    it('should not show reversed indicator when card is upright', () => {
      const reading = createTestDailyReading({ isReversed: false });

      render(<DailyReadingCard reading={reading} />);

      expect(screen.queryByText(/invertida/i)).not.toBeInTheDocument();
    });

    it('should show regenerated badge icon when wasRegenerated is true', () => {
      const reading = createTestDailyReading({ wasRegenerated: true });

      render(<DailyReadingCard reading={reading} />);

      // Badge shows refresh icon but no text
      const card = screen.getByTestId('daily-reading-card');
      expect(card.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    it('should not show regenerated badge when wasRegenerated is false', () => {
      const reading = createTestDailyReading({ wasRegenerated: false });

      render(<DailyReadingCard reading={reading} />);

      const badge = screen.queryByText(/regenerada/i);
      expect(badge).not.toBeInTheDocument();
    });

    it('should render card image when cardImageUrl is provided', () => {
      const reading = createTestDailyReading({
        cardImageUrl: 'https://example.com/cards/el-mago.jpg',
      });

      render(<DailyReadingCard reading={reading} />);

      const image = screen.getByAltText('Carta El Mago');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/cards/el-mago.jpg');
    });

    it('should rotate card image when isReversed is true', () => {
      const reading = createTestDailyReading({
        isReversed: true,
        cardImageUrl: 'https://example.com/cards/el-mago.jpg',
      });

      render(<DailyReadingCard reading={reading} />);

      const image = screen.getByAltText('Carta El Mago');
      expect(image).toHaveClass('rotate-180');
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const reading = createTestDailyReading();

      render(<DailyReadingCard reading={reading} className="custom-class" />);

      const card = screen.getByTestId('daily-reading-card');
      expect(card).toHaveClass('custom-class');
    });

    it('should have hover effects', () => {
      const reading = createTestDailyReading();

      render(<DailyReadingCard reading={reading} />);

      const card = screen.getByTestId('daily-reading-card');
      expect(card).toHaveClass('hover:shadow-md');
    });
  });
});
