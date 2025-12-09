import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    isReversed: false,
    interpretationSummary:
      'El Mago simboliza el poder de la voluntad y la manifestación. Hoy tienes todas las herramientas necesarias para lograr tus metas.',
    wasRegenerated: false,
    createdAt: new Date('2025-12-02T08:30:00Z'),
    ...overrides,
  };
}

describe('DailyReadingCard', () => {
  const mockOnView = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the formatted date prominently', () => {
      const reading = createTestDailyReading();

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      expect(screen.getByText('Lunes 2 de Diciembre')).toBeInTheDocument();
    });

    it('should render the card name', () => {
      const reading = createTestDailyReading({ cardName: 'La Emperatriz' });

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      expect(screen.getByText('La Emperatriz')).toBeInTheDocument();
    });

    it('should render the interpretation preview', () => {
      const reading = createTestDailyReading({
        interpretationSummary: 'Esta es la interpretación de prueba.',
      });

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      expect(screen.getByText('Esta es la interpretación de prueba.')).toBeInTheDocument();
    });

    it('should show reversed indicator when card is reversed', () => {
      const reading = createTestDailyReading({ isReversed: true });

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      expect(screen.getByText(/invertida/i)).toBeInTheDocument();
    });

    it('should not show reversed indicator when card is upright', () => {
      const reading = createTestDailyReading({ isReversed: false });

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      expect(screen.queryByText(/invertida/i)).not.toBeInTheDocument();
    });

    it('should render "Ver completa" button', () => {
      const reading = createTestDailyReading();

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      // Use getByText to target the actual button element text, avoiding the Card with role="button"
      expect(screen.getByText('Ver completa')).toBeInTheDocument();
    });

    it('should truncate long interpretation text', () => {
      const longInterpretation =
        'Esta es una interpretación muy larga que debería ser truncada después de dos líneas para mantener un diseño consistente en las tarjetas del historial de la carta del día. Contiene muchas palabras adicionales para asegurar que excede el límite.';
      const reading = createTestDailyReading({
        interpretationSummary: longInterpretation,
      });

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      const interpretationElement = screen.getByTestId('interpretation-preview');
      expect(interpretationElement).toHaveClass('line-clamp-2');
    });

    it('should show regenerated badge when wasRegenerated is true', () => {
      const reading = createTestDailyReading({ wasRegenerated: true });

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      expect(screen.getByText(/regenerada/i)).toBeInTheDocument();
    });

    it('should not show regenerated badge when wasRegenerated is false', () => {
      const reading = createTestDailyReading({ wasRegenerated: false });

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      expect(screen.queryByText(/regenerada/i)).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onView with reading id when "Ver completa" button is clicked', async () => {
      const user = userEvent.setup();
      const reading = createTestDailyReading({ id: 42 });

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      // Click on the "Ver completa" text link button
      const viewButton = screen.getByText('Ver completa').closest('button');
      expect(viewButton).not.toBeNull();
      await user.click(viewButton!);

      expect(mockOnView).toHaveBeenCalledTimes(1);
      expect(mockOnView).toHaveBeenCalledWith(42);
    });

    it('should call onView when clicking on the card', async () => {
      const user = userEvent.setup();
      const reading = createTestDailyReading({ id: 123 });

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      const card = screen.getByTestId('daily-reading-card');
      await user.click(card);

      expect(mockOnView).toHaveBeenCalledTimes(1);
      expect(mockOnView).toHaveBeenCalledWith(123);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button', () => {
      const reading = createTestDailyReading();

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      const viewButton = screen.getByText('Ver completa').closest('button');
      expect(viewButton).toBeVisible();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      const reading = createTestDailyReading({ id: 1 });

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      const viewButton = screen.getByText('Ver completa').closest('button');
      expect(viewButton).not.toBeNull();
      viewButton!.focus();

      await user.keyboard('{Enter}');

      expect(mockOnView).toHaveBeenCalledWith(1);
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const reading = createTestDailyReading();

      render(<DailyReadingCard reading={reading} onView={mockOnView} className="custom-class" />);

      const card = screen.getByTestId('daily-reading-card');
      expect(card).toHaveClass('custom-class');
    });

    it('should have hover effects', () => {
      const reading = createTestDailyReading();

      render(<DailyReadingCard reading={reading} onView={mockOnView} />);

      const card = screen.getByTestId('daily-reading-card');
      expect(card).toHaveClass('hover:shadow-lg');
    });
  });
});
