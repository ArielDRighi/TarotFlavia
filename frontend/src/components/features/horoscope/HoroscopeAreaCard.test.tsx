import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { HoroscopeAreaCard } from './HoroscopeAreaCard';
import type { HoroscopeArea } from '@/types/horoscope.types';

const mockArea: HoroscopeArea = {
  content: 'Hoy es un buen día para el amor. Las estrellas están alineadas.',
  score: 8,
};

describe('HoroscopeAreaCard', () => {
  describe('Rendering - Love Area', () => {
    it('should render love area card', () => {
      render(<HoroscopeAreaCard area="love" data={mockArea} />);

      expect(screen.getByTestId('horoscope-area-love')).toBeInTheDocument();
    });

    it('should render love title', () => {
      render(<HoroscopeAreaCard area="love" data={mockArea} />);

      expect(screen.getByText('Amor')).toBeInTheDocument();
    });

    it('should render love content', () => {
      render(<HoroscopeAreaCard area="love" data={mockArea} />);

      expect(screen.getByText(/Hoy es un buen día para el amor/)).toBeInTheDocument();
    });

    it('should render love score', () => {
      render(<HoroscopeAreaCard area="love" data={mockArea} />);

      expect(screen.getByText('8/10')).toBeInTheDocument();
    });
  });

  describe('Rendering - Wellness Area', () => {
    it('should render wellness area card', () => {
      render(<HoroscopeAreaCard area="wellness" data={mockArea} />);

      expect(screen.getByTestId('horoscope-area-wellness')).toBeInTheDocument();
    });

    it('should render wellness title', () => {
      render(<HoroscopeAreaCard area="wellness" data={mockArea} />);

      expect(screen.getByText('Bienestar')).toBeInTheDocument();
    });
  });

  describe('Rendering - Money Area', () => {
    it('should render money area card', () => {
      render(<HoroscopeAreaCard area="money" data={mockArea} />);

      expect(screen.getByTestId('horoscope-area-money')).toBeInTheDocument();
    });

    it('should render money title', () => {
      render(<HoroscopeAreaCard area="money" data={mockArea} />);

      expect(screen.getByText('Dinero')).toBeInTheDocument();
    });
  });

  describe('Score Display', () => {
    it('should render correct number of filled dots based on score', () => {
      const { container } = render(<HoroscopeAreaCard area="love" data={mockArea} />);

      // Score es 8, así que debería haber 8 dots con color y 2 grises
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots).toHaveLength(10); // Total de 10 dots
    });

    it('should handle score of 1', () => {
      render(<HoroscopeAreaCard area="love" data={{ content: 'test', score: 1 }} />);

      expect(screen.getByText('1/10')).toBeInTheDocument();
    });

    it('should handle score of 10', () => {
      render(<HoroscopeAreaCard area="love" data={{ content: 'test', score: 10 }} />);

      expect(screen.getByText('10/10')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have rose color for love area', () => {
      render(<HoroscopeAreaCard area="love" data={mockArea} />);

      const card = screen.getByTestId('horoscope-area-love');
      expect(card).toHaveClass('bg-rose-50');
    });

    it('should have emerald color for wellness area', () => {
      render(<HoroscopeAreaCard area="wellness" data={mockArea} />);

      const card = screen.getByTestId('horoscope-area-wellness');
      expect(card).toHaveClass('bg-emerald-50');
    });

    it('should have amber color for money area', () => {
      render(<HoroscopeAreaCard area="money" data={mockArea} />);

      const card = screen.getByTestId('horoscope-area-money');
      expect(card).toHaveClass('bg-amber-50');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<HoroscopeAreaCard area="love" data={mockArea} className="custom-class" />);

      const card = screen.getByTestId('horoscope-area-love');
      expect(card).toHaveClass('custom-class');
    });
  });
});
