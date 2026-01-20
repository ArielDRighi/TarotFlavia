import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChineseHoroscopeDetail } from './ChineseHoroscopeDetail';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';
import type { ChineseHoroscope } from '@/types/chinese-horoscope.types';

// Mock ChineseCompatibility component
vi.mock('./ChineseCompatibility', () => ({
  ChineseCompatibility: ({ compatibility }: { compatibility: { best: string[] } }) => (
    <div data-testid="chinese-compatibility-mock">Best: {compatibility.best.join(',')}</div>
  ),
}));

// Factory function for test data
function createMockHoroscope(overrides?: Partial<ChineseHoroscope>): ChineseHoroscope {
  return {
    id: 1,
    animal: ChineseZodiacAnimal.DRAGON,
    year: 2026,
    generalOverview: 'Este será un año de grandes oportunidades para el Dragón.',
    areas: {
      love: {
        content: 'El amor florecerá en primavera.',
        score: 8,
      },
      career: {
        content: 'Excelente año para avances profesionales.',
        score: 9,
      },
      wellness: {
        content: 'Mantén el equilibrio entre trabajo y descanso.',
        score: 7,
      },
      finance: {
        content: 'Las inversiones serán favorables.',
        score: 8,
      },
    },
    luckyElements: {
      numbers: [3, 7, 9],
      colors: ['Rojo', 'Dorado'],
      directions: ['Sur', 'Este'],
      months: [3, 6, 9, 12],
    },
    compatibility: {
      best: [ChineseZodiacAnimal.RAT, ChineseZodiacAnimal.MONKEY],
      good: [ChineseZodiacAnimal.ROOSTER],
      challenging: [ChineseZodiacAnimal.DOG],
    },
    monthlyHighlights: 'Marzo y septiembre serán meses clave para tomar decisiones importantes.',
    ...overrides,
  };
}

describe('ChineseHoroscopeDetail', () => {
  describe('Rendering', () => {
    it('should render the component with main container', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      const container = screen.getByTestId('chinese-horoscope-detail');
      expect(container).toBeInTheDocument();
    });

    it('should display animal emoji', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('🐉')).toBeInTheDocument();
    });

    it('should display animal name in Spanish when no element provided', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('Dragón')).toBeInTheDocument();
    });

    it('should display animal name with element when element prop is provided', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} element="earth" />);

      expect(screen.getByText('Dragón de Tierra')).toBeInTheDocument();
    });

    it('should display animal name with fire element', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} element="fire" />);

      expect(screen.getByText('Dragón de Fuego')).toBeInTheDocument();
    });

    it('should prefer fullZodiacType from horoscope over calculated name', () => {
      const horoscope = createMockHoroscope({ fullZodiacType: 'Dragón de Metal' });
      render(<ChineseHoroscopeDetail horoscope={horoscope} element="earth" />);

      // Should use fullZodiacType, not "Dragón de Tierra"
      expect(screen.getByText('Dragón de Metal')).toBeInTheDocument();
    });

    it('should display year badge', () => {
      const horoscope = createMockHoroscope({ year: 2027 });
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('Horóscopo 2027')).toBeInTheDocument();
    });

    it('should display general overview', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(
        screen.getByText('Este será un año de grandes oportunidades para el Dragón.')
      ).toBeInTheDocument();
    });
  });

  describe('Areas Section', () => {
    it('should render all four area cards', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByTestId('area-card-love')).toBeInTheDocument();
      expect(screen.getByTestId('area-card-career')).toBeInTheDocument();
      expect(screen.getByTestId('area-card-wellness')).toBeInTheDocument();
      expect(screen.getByTestId('area-card-finance')).toBeInTheDocument();
    });

    it('should display area labels in Spanish', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('Amor')).toBeInTheDocument();
      expect(screen.getByText('Carrera')).toBeInTheDocument();
      expect(screen.getByText('Bienestar')).toBeInTheDocument();
      expect(screen.getByText('Finanzas')).toBeInTheDocument();
    });

    it('should display area icons', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('❤️')).toBeInTheDocument();
      expect(screen.getByText('💼')).toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
      expect(screen.getByText('💰')).toBeInTheDocument();
    });

    it('should display area scores', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getAllByText('8/10').length).toBeGreaterThan(0); // love and finance both have 8/10
      expect(screen.getByText('9/10')).toBeInTheDocument(); // career
      expect(screen.getByText('7/10')).toBeInTheDocument(); // wellness
    });

    it('should display area content', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('El amor florecerá en primavera.')).toBeInTheDocument();
      expect(screen.getByText('Excelente año para avances profesionales.')).toBeInTheDocument();
      expect(
        screen.getByText('Mantén el equilibrio entre trabajo y descanso.')
      ).toBeInTheDocument();
      expect(screen.getByText('Las inversiones serán favorables.')).toBeInTheDocument();
    });
  });

  describe('Lucky Elements Section', () => {
    it('should render lucky elements section', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('Elementos de Suerte')).toBeInTheDocument();
    });

    it('should display lucky numbers', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('Números')).toBeInTheDocument();
      expect(screen.getByText('3, 7, 9')).toBeInTheDocument();
    });

    it('should display lucky colors', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('Colores')).toBeInTheDocument();
      expect(screen.getByText('Rojo, Dorado')).toBeInTheDocument();
    });

    it('should display lucky directions', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('Direcciones')).toBeInTheDocument();
      expect(screen.getByText('Sur, Este')).toBeInTheDocument();
    });

    it('should display lucky months', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('Meses')).toBeInTheDocument();
      expect(screen.getByText('3, 6, 9, 12')).toBeInTheDocument();
    });

    it('should handle single lucky element', () => {
      const horoscope = createMockHoroscope({
        luckyElements: {
          numbers: [7],
          colors: ['Verde'],
          directions: ['Norte'],
          months: [5],
        },
      });
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('Verde')).toBeInTheDocument();
      expect(screen.getByText('Norte')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Compatibility Section', () => {
    it('should render ChineseCompatibility component', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByTestId('chinese-compatibility-mock')).toBeInTheDocument();
    });

    it('should pass compatibility data to ChineseCompatibility', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      const mockComponent = screen.getByTestId('chinese-compatibility-mock');
      expect(mockComponent).toHaveTextContent('Best: rat,monkey');
    });
  });

  describe('Monthly Highlights Section', () => {
    it('should render monthly highlights when provided', () => {
      const horoscope = createMockHoroscope({
        monthlyHighlights: 'Enero será un mes de nuevos comienzos.',
      });
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('Aspectos Destacados del Año')).toBeInTheDocument();
      expect(screen.getByText('Enero será un mes de nuevos comienzos.')).toBeInTheDocument();
    });

    it('should not render monthly highlights section when null', () => {
      const horoscope = createMockHoroscope({ monthlyHighlights: null });
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.queryByText('Aspectos Destacados del Año')).not.toBeInTheDocument();
    });

    it('should not render monthly highlights section when undefined', () => {
      const horoscope = createMockHoroscope({ monthlyHighlights: undefined });
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.queryByText('Aspectos Destacados del Año')).not.toBeInTheDocument();
    });

    it('should not render monthly highlights section when empty string', () => {
      const horoscope = createMockHoroscope({ monthlyHighlights: '' });
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.queryByText('Aspectos Destacados del Año')).not.toBeInTheDocument();
    });
  });

  describe('Different Animals', () => {
    it('should display correct info for RAT', () => {
      const horoscope = createMockHoroscope({ animal: ChineseZodiacAnimal.RAT });
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('🐀')).toBeInTheDocument();
      expect(screen.getByText('Rata')).toBeInTheDocument();
    });

    it('should display correct info for TIGER', () => {
      const horoscope = createMockHoroscope({ animal: ChineseZodiacAnimal.TIGER });
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('🐅')).toBeInTheDocument();
      expect(screen.getByText('Tigre')).toBeInTheDocument();
    });

    it('should display correct info for SNAKE', () => {
      const horoscope = createMockHoroscope({ animal: ChineseZodiacAnimal.SNAKE });
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('🐍')).toBeInTheDocument();
      expect(screen.getByText('Serpiente')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should have space-y-6 class on main container', () => {
      const horoscope = createMockHoroscope();
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      const container = screen.getByTestId('chinese-horoscope-detail');
      expect(container).toHaveClass('space-y-6');
    });

    it('should center align header text', () => {
      const horoscope = createMockHoroscope();
      const { container } = render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      const header = container.querySelector('.text-center');
      expect(header).toBeInTheDocument();
    });

    it('should use serif font for animal name', () => {
      const horoscope = createMockHoroscope();
      const { container } = render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      const heading = container.querySelector('h1');
      expect(heading).toHaveClass('font-serif');
    });

    it('should use grid layout for areas with md:grid-cols-2', () => {
      const horoscope = createMockHoroscope();
      const { container } = render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      const areasGrid = container.querySelector('.grid.gap-4.md\\:grid-cols-2');
      expect(areasGrid).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty lucky elements arrays gracefully', () => {
      const horoscope = createMockHoroscope({
        luckyElements: {
          numbers: [],
          colors: [],
          directions: [],
          months: [],
        },
      });
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('Elementos de Suerte')).toBeInTheDocument();
      // Should render empty strings without errors
      expect(screen.getByText('Números')).toBeInTheDocument();
    });

    it('should handle very long overview text', () => {
      const longText = 'A'.repeat(500);
      const horoscope = createMockHoroscope({ generalOverview: longText });
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle score of 10', () => {
      const horoscope = createMockHoroscope({
        areas: {
          love: { content: 'Perfecto', score: 10 },
          career: { content: 'Bien', score: 5 },
          wellness: { content: 'Bien', score: 5 },
          finance: { content: 'Bien', score: 5 },
        },
      });
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('10/10')).toBeInTheDocument();
    });

    it('should handle score of 1', () => {
      const horoscope = createMockHoroscope({
        areas: {
          love: { content: 'Desafiante', score: 1 },
          career: { content: 'Bien', score: 5 },
          wellness: { content: 'Bien', score: 5 },
          finance: { content: 'Bien', score: 5 },
        },
      });
      render(<ChineseHoroscopeDetail horoscope={horoscope} />);

      expect(screen.getByText('1/10')).toBeInTheDocument();
    });
  });
});
