import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { NumberCard } from './NumberCard';
import type { NumberDetailDto } from '@/types/numerology.types';

// Mock data helpers
const createMockNumber = (overrides?: Partial<NumberDetailDto>): NumberDetailDto => ({
  value: 7,
  name: 'El Buscador',
  keywords: ['Análisis', 'Introspección', 'Espiritualidad'],
  description:
    'El número 7 representa la búsqueda de la verdad interior y el conocimiento profundo.',
  isMaster: false,
  ...overrides,
});

describe('NumberCard', () => {
  describe('Rendering - Compact Variant', () => {
    it('should render card with number value', () => {
      const number = createMockNumber();
      render(<NumberCard number={number} />);

      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should display number name', () => {
      const number = createMockNumber();
      render(<NumberCard number={number} />);

      expect(screen.getByText('El Buscador')).toBeInTheDocument();
    });

    it('should show master number badge when isMaster is true', () => {
      const number = createMockNumber({ value: 11, isMaster: true, name: 'El Visionario' });
      render(<NumberCard number={number} />);

      expect(screen.getByText(/número maestro/i)).toBeInTheDocument();
    });

    it('should not show master number badge when isMaster is false', () => {
      const number = createMockNumber({ isMaster: false });
      render(<NumberCard number={number} />);

      expect(screen.queryByText(/número maestro/i)).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const number = createMockNumber();
      const { container } = render(<NumberCard number={number} className="custom-class" />);

      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });

    it('should not display keywords or description in compact mode', () => {
      const number = createMockNumber();
      render(<NumberCard number={number} variant="compact" />);

      expect(screen.queryByText('Análisis, Introspección, Espiritualidad')).not.toBeInTheDocument();
      expect(
        screen.queryByText(/representa la búsqueda de la verdad interior/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Rendering - Full Variant', () => {
    it('should display keywords in full mode', () => {
      const number = createMockNumber();
      render(<NumberCard number={number} variant="full" />);

      expect(screen.getByText('Análisis, Introspección, Espiritualidad')).toBeInTheDocument();
    });

    it('should display description in full mode', () => {
      const number = createMockNumber();
      render(<NumberCard number={number} variant="full" />);

      expect(screen.getByText(/representa la búsqueda de la verdad interior/i)).toBeInTheDocument();
    });
  });

  describe('Context Labels', () => {
    it('should display "Camino de Vida" label when context is lifePath', () => {
      const number = createMockNumber();
      render(<NumberCard number={number} context="lifePath" />);

      expect(screen.getByText('Camino de Vida')).toBeInTheDocument();
    });

    it('should display "Expresión/Destino" label when context is expression', () => {
      const number = createMockNumber();
      render(<NumberCard number={number} context="expression" />);

      expect(screen.getByText('Expresión/Destino')).toBeInTheDocument();
    });

    it('should display "Número del Alma" label when context is soulUrge', () => {
      const number = createMockNumber();
      render(<NumberCard number={number} context="soulUrge" />);

      expect(screen.getByText('Número del Alma')).toBeInTheDocument();
    });

    it('should not display context label when context is not provided', () => {
      const number = createMockNumber();
      render(<NumberCard number={number} />);

      expect(screen.queryByText('Camino de Vida')).not.toBeInTheDocument();
    });
  });

  describe('Emoji Display', () => {
    it('should display emoji for number 1', () => {
      const number = createMockNumber({ value: 1, name: 'El Líder' });
      render(<NumberCard number={number} />);

      expect(screen.getByText('👑')).toBeInTheDocument();
    });

    it('should display emoji for number 7', () => {
      const number = createMockNumber({ value: 7 });
      render(<NumberCard number={number} />);

      expect(screen.getByText('🔮')).toBeInTheDocument();
    });

    it('should display emoji for master number 11', () => {
      const number = createMockNumber({ value: 11, isMaster: true, name: 'El Visionario' });
      render(<NumberCard number={number} />);

      expect(screen.getByText('✨')).toBeInTheDocument();
    });
  });

  describe('Color Coding', () => {
    it('should apply red color class for number 1', () => {
      const number = createMockNumber({ value: 1, name: 'El Líder' });
      render(<NumberCard number={number} />);

      const numberDisplay = screen.getByText('1');
      expect(numberDisplay).toHaveClass('text-red-500');
    });

    it('should apply purple color class for number 7', () => {
      const number = createMockNumber({ value: 7 });
      render(<NumberCard number={number} />);

      const numberDisplay = screen.getByText('7');
      expect(numberDisplay).toHaveClass('text-purple-500');
    });
  });

  describe('Interactivity', () => {
    it('should call onClick when card is clicked', () => {
      const onClick = vi.fn();
      const number = createMockNumber();

      render(<NumberCard number={number} onClick={onClick} />);

      const card = screen.getByTestId('number-card-7');
      fireEvent.click(card);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should apply hover styles when onClick is provided', () => {
      const onClick = vi.fn();
      const number = createMockNumber();

      render(<NumberCard number={number} onClick={onClick} />);

      const card = screen.getByTestId('number-card-7');
      expect(card).toHaveClass('cursor-pointer');
      expect(card).toHaveClass('hover:shadow-lg');
    });

    it('should not apply hover styles when onClick is not provided', () => {
      const number = createMockNumber();

      render(<NumberCard number={number} />);

      const card = screen.getByTestId('number-card-7');
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Data-testid', () => {
    it('should have correct data-testid based on number value', () => {
      const number = createMockNumber({ value: 5 });
      render(<NumberCard number={number} />);

      expect(screen.getByTestId('number-card-5')).toBeInTheDocument();
    });

    it('should have correct data-testid for master numbers', () => {
      const number = createMockNumber({
        value: 22,
        isMaster: true,
        name: 'El Constructor Maestro',
      });
      render(<NumberCard number={number} />);

      expect(screen.getByTestId('number-card-22')).toBeInTheDocument();
    });
  });

  describe('Different Numbers', () => {
    it('should render correctly for number 3', () => {
      const number = createMockNumber({ value: 3, name: 'El Creativo', keywords: ['Creatividad'] });
      render(<NumberCard number={number} />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('El Creativo')).toBeInTheDocument();
      expect(screen.getByText('🎨')).toBeInTheDocument();
    });

    it('should render correctly for master number 33', () => {
      const number = createMockNumber({
        value: 33,
        name: 'El Maestro Sanador',
        isMaster: true,
        keywords: ['Compasión'],
      });
      render(<NumberCard number={number} />);

      expect(screen.getByText('33')).toBeInTheDocument();
      expect(screen.getByText('El Maestro Sanador')).toBeInTheDocument();
      expect(screen.getByText('💫')).toBeInTheDocument();
      expect(screen.getByText(/número maestro/i)).toBeInTheDocument();
    });
  });
});
