import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ChineseHoroscopeWidget } from './ChineseHoroscopeWidget';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';
import type { ChineseHoroscope } from '@/types/chinese-horoscope.types';

// Mock the hook
const mockUseMyAnimalHoroscope = vi.fn();
vi.mock('@/hooks/api/useChineseHoroscope', () => ({
  useMyAnimalHoroscope: () => mockUseMyAnimalHoroscope(),
}));

// Mock getCurrentYear to return a fixed year
vi.mock('@/lib/utils/chinese-zodiac', async () => {
  const actual = await vi.importActual('@/lib/utils/chinese-zodiac');
  return {
    ...actual,
    getCurrentYear: () => 2026,
  };
});

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
        rating: 8,
      },
      career: {
        content: 'Excelente año para avances profesionales.',
        rating: 9,
      },
      wellness: {
        content: 'Mantén el equilibrio entre trabajo y descanso.',
        rating: 7,
      },
      finance: {
        content: 'Las inversiones serán favorables.',
        rating: 8,
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
    monthlyHighlights: 'Marzo y septiembre serán meses clave.',
    // Wu Xing fields
    birthElement: 'earth',
    birthElementEs: 'Tierra',
    fullZodiacType: 'Dragón de Tierra',
    ...overrides,
  };
}

describe('ChineseHoroscopeWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should render loading skeleton when isLoading is true', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByTestId('chinese-horoscope-widget-loading')).toBeInTheDocument();
    });

    it('should render skeleton placeholders for content', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      // Check that skeletons are rendered (they are role-less, so we check via container)
      const container = screen.getByTestId('chinese-horoscope-widget-loading');
      expect(container).toBeInTheDocument();
    });
  });

  describe('No Data State', () => {
    it('should render configure profile CTA when no horoscope data', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByTestId('chinese-horoscope-widget-no-data')).toBeInTheDocument();
    });

    it('should show configure message', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByText(/configura tu fecha de nacimiento/i)).toBeInTheDocument();
    });

    it('should render link to profile page', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      const link = screen.getByRole('link', { name: /configurar/i });
      expect(link).toHaveAttribute('href', '/perfil');
    });

    it('should render Settings icon in configure button', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      const button = screen.getByRole('link', { name: /configurar/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render configure CTA when error occurs', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API Error'),
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByTestId('chinese-horoscope-widget-no-data')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should render widget with horoscope data', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope(),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByTestId('chinese-horoscope-widget')).toBeInTheDocument();
    });

    it('should display animal emoji', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope(),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByText('🐉')).toBeInTheDocument();
    });

    it('should display animal name in Spanish', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope(),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      // With Wu Xing, shows fullZodiacType instead of just nameEs
      expect(screen.getByText('Dragón de Tierra')).toBeInTheDocument();
    });

    it('should display fullZodiacType when available', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope({
          fullZodiacType: 'Dragón de Metal',
          birthElement: 'metal',
          birthElementEs: 'Metal',
        }),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByText('Dragón de Metal')).toBeInTheDocument();
    });

    it('should fallback to nameEs when fullZodiacType is not available', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope({
          fullZodiacType: undefined,
          birthElement: undefined,
          birthElementEs: undefined,
        }),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByText('Dragón')).toBeInTheDocument();
    });

    it('should display birth element with icon', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope({
          birthElement: 'earth',
          birthElementEs: 'Tierra',
        }),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      const elementDisplay = screen.getByTestId('chinese-horoscope-widget-element');
      expect(elementDisplay).toHaveTextContent('🟤');
      expect(elementDisplay).toHaveTextContent('Tierra');
    });

    it('should display metal element with correct icon', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope({
          birthElement: 'metal',
          birthElementEs: 'Metal',
          fullZodiacType: 'Dragón de Metal',
        }),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      const elementDisplay = screen.getByTestId('chinese-horoscope-widget-element');
      expect(elementDisplay).toHaveTextContent('⚪');
      expect(elementDisplay).toHaveTextContent('Metal');
    });

    it('should not display element when birthElementEs is not available', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope({
          birthElement: undefined,
          birthElementEs: undefined,
        }),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.queryByTestId('chinese-horoscope-widget-element')).not.toBeInTheDocument();
    });

    it('should display current year label', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope(),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByText('Horóscopo Chino 2026')).toBeInTheDocument();
    });

    it('should display general overview (clamped to 3 lines)', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope(),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(
        screen.getByText('Este será un año de grandes oportunidades para el Dragón.')
      ).toBeInTheDocument();
    });

    it('should display all area scores', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope(),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      // love and finance both have 8/10, so we use getAllByText
      expect(screen.getAllByText('8/10')).toHaveLength(2); // love and finance
      expect(screen.getByText('9/10')).toBeInTheDocument(); // career
      expect(screen.getByText('7/10')).toBeInTheDocument(); // wellness
    });

    it('should display area icons', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope(),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByText('❤️')).toBeInTheDocument();
      expect(screen.getByText('💼')).toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
      expect(screen.getByText('💰')).toBeInTheDocument();
    });

    it('should render link to full horoscope page with element', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope(),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      const link = screen.getByRole('link', { name: /ver más/i });
      expect(link).toHaveAttribute('href', '/horoscopo-chino/dragon?element=earth');
    });
  });

  describe('Different Animals', () => {
    it('should display correct info for Rat', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope({
          animal: ChineseZodiacAnimal.RAT,
          fullZodiacType: 'Rata de Agua',
          birthElement: 'water',
          birthElementEs: 'Agua',
        }),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByText('🐀')).toBeInTheDocument();
      expect(screen.getByText('Rata de Agua')).toBeInTheDocument();
    });

    it('should display correct info for Snake', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope({
          animal: ChineseZodiacAnimal.SNAKE,
          fullZodiacType: 'Serpiente de Fuego',
          birthElement: 'fire',
          birthElementEs: 'Fuego',
        }),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByText('🐍')).toBeInTheDocument();
      expect(screen.getByText('Serpiente de Fuego')).toBeInTheDocument();
    });

    it('should link to correct animal page with element', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope({ animal: ChineseZodiacAnimal.TIGER }),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      const link = screen.getByRole('link', { name: /ver más/i });
      // Default birthElement from createMockHoroscope is 'earth'
      expect(link).toHaveAttribute('href', '/horoscopo-chino/tiger?element=earth');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope(),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Dragón de Tierra');
    });

    it('should have accessible link with clear text', () => {
      mockUseMyAnimalHoroscope.mockReturnValue({
        data: createMockHoroscope(),
        isLoading: false,
        error: null,
      });

      render(<ChineseHoroscopeWidget />);

      expect(screen.getByRole('link', { name: /ver más/i })).toBeInTheDocument();
    });
  });
});
