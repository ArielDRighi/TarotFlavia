import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AnimalCalculator } from './AnimalCalculator';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';
import type { CalculateAnimalResponse } from '@/types/chinese-horoscope.types';

// Mock the hook
const mockUseCalculateAnimal = vi.fn();
vi.mock('@/hooks/api/useChineseHoroscope', () => ({
  useCalculateAnimal: () => mockUseCalculateAnimal(),
}));

// Factory function for test data
function createMockCalculateResponse(
  overrides?: Partial<CalculateAnimalResponse>
): CalculateAnimalResponse {
  return {
    animal: ChineseZodiacAnimal.DRAGON,
    animalInfo: {
      animal: ChineseZodiacAnimal.DRAGON,
      nameEs: 'Dragón',
      nameEn: 'Dragon',
      emoji: '🐉',
      element: 'Tierra',
      characteristics: ['Confiado', 'Inteligente', 'Entusiasta'],
    },
    chineseYear: 1988,
    ...overrides,
  };
}

describe('AnimalCalculator', () => {
  const mockOnAnimalFound = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no data yet (initial state)
    mockUseCalculateAnimal.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render the calculator card', () => {
      render(<AnimalCalculator />);

      expect(screen.getByTestId('animal-calculator')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<AnimalCalculator />);

      expect(screen.getByText('Descubre tu Animal del Zodiaco Chino')).toBeInTheDocument();
    });

    it('should render date input', () => {
      render(<AnimalCalculator />);

      expect(screen.getByTestId('animal-calculator-input')).toBeInTheDocument();
      expect(screen.getByLabelText('Tu fecha de nacimiento')).toBeInTheDocument();
    });

    it('should render calculate button', () => {
      render(<AnimalCalculator />);

      expect(screen.getByTestId('animal-calculator-button')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Calcular' })).toBeInTheDocument();
    });

    it('should disable button when no date entered', () => {
      render(<AnimalCalculator />);

      const button = screen.getByTestId('animal-calculator-button');
      expect(button).toBeDisabled();
    });

    it('should apply custom className', () => {
      render(<AnimalCalculator className="custom-class" />);

      const card = screen.getByTestId('animal-calculator');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('User Interactions', () => {
    it('should enable button when date is entered', async () => {
      const user = userEvent.setup();
      render(<AnimalCalculator />);

      const input = screen.getByTestId('animal-calculator-input');
      await user.type(input, '1988-03-15');

      const button = screen.getByTestId('animal-calculator-button');
      expect(button).not.toBeDisabled();
    });

    it('should trigger calculation on button click', async () => {
      const user = userEvent.setup();
      render(<AnimalCalculator />);

      const input = screen.getByTestId('animal-calculator-input');
      await user.type(input, '1988-03-15');

      const button = screen.getByTestId('animal-calculator-button');
      await user.click(button);

      // The hook should have been called (queryDate set)
      expect(mockUseCalculateAnimal).toHaveBeenCalled();
    });

    it('should trigger calculation on Enter key', async () => {
      const user = userEvent.setup();
      render(<AnimalCalculator />);

      const input = screen.getByTestId('animal-calculator-input');
      await user.type(input, '1988-03-15');
      await user.keyboard('{Enter}');

      expect(mockUseCalculateAnimal).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading text when calculating', () => {
      mockUseCalculateAnimal.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<AnimalCalculator />);

      expect(screen.getByRole('button', { name: 'Calculando...' })).toBeInTheDocument();
    });

    it('should disable button while loading', () => {
      mockUseCalculateAnimal.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<AnimalCalculator />);

      const button = screen.getByTestId('animal-calculator-button');
      expect(button).toBeDisabled();
    });
  });

  describe('Error State', () => {
    it('should show error message when calculation fails', () => {
      mockUseCalculateAnimal.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API Error'),
      });

      render(<AnimalCalculator />);

      expect(screen.getByTestId('animal-calculator-error')).toBeInTheDocument();
      expect(screen.getByText('Error al calcular tu animal')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should show result card when calculation succeeds', () => {
      mockUseCalculateAnimal.mockReturnValue({
        data: createMockCalculateResponse(),
        isLoading: false,
        error: null,
      });

      render(<AnimalCalculator />);

      expect(screen.getByTestId('animal-calculator-result')).toBeInTheDocument();
    });

    it('should display animal emoji', () => {
      mockUseCalculateAnimal.mockReturnValue({
        data: createMockCalculateResponse(),
        isLoading: false,
        error: null,
      });

      render(<AnimalCalculator />);

      expect(screen.getByText('🐉')).toBeInTheDocument();
    });

    it('should display animal name in Spanish', () => {
      mockUseCalculateAnimal.mockReturnValue({
        data: createMockCalculateResponse(),
        isLoading: false,
        error: null,
      });

      render(<AnimalCalculator />);

      expect(screen.getByText('Eres Dragón')).toBeInTheDocument();
    });

    it('should display Chinese year', () => {
      mockUseCalculateAnimal.mockReturnValue({
        data: createMockCalculateResponse({ chineseYear: 1988 }),
        isLoading: false,
        error: null,
      });

      render(<AnimalCalculator />);

      expect(screen.getByText('Año chino: 1988')).toBeInTheDocument();
    });

    // TODO: Re-enable when TASK-119-121 implement birthElement
    it.skip('should display element (pending Wu Xing implementation)', () => {
      mockUseCalculateAnimal.mockReturnValue({
        data: createMockCalculateResponse(),
        isLoading: false,
        error: null,
      });

      render(<AnimalCalculator />);

      // Will use data.birthElementEs when available
      expect(screen.getByText('Elemento: Tierra')).toBeInTheDocument();
    });

    it('should display characteristics', () => {
      mockUseCalculateAnimal.mockReturnValue({
        data: createMockCalculateResponse(),
        isLoading: false,
        error: null,
      });

      render(<AnimalCalculator />);

      expect(screen.getByText('Confiado')).toBeInTheDocument();
      expect(screen.getByText('Inteligente')).toBeInTheDocument();
      expect(screen.getByText('Entusiasta')).toBeInTheDocument();
    });
  });

  describe('Callback', () => {
    it('should show "Ver mi horóscopo" button when onAnimalFound is provided', () => {
      mockUseCalculateAnimal.mockReturnValue({
        data: createMockCalculateResponse(),
        isLoading: false,
        error: null,
      });

      render(<AnimalCalculator onAnimalFound={mockOnAnimalFound} />);

      expect(screen.getByTestId('animal-calculator-view-button')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ver mi horóscopo' })).toBeInTheDocument();
    });

    it('should NOT show "Ver mi horóscopo" button when onAnimalFound is not provided', () => {
      mockUseCalculateAnimal.mockReturnValue({
        data: createMockCalculateResponse(),
        isLoading: false,
        error: null,
      });

      render(<AnimalCalculator />);

      expect(screen.queryByTestId('animal-calculator-view-button')).not.toBeInTheDocument();
    });

    it('should call onAnimalFound with animal when button is clicked', async () => {
      const user = userEvent.setup();
      mockUseCalculateAnimal.mockReturnValue({
        data: createMockCalculateResponse({ animal: ChineseZodiacAnimal.RAT }),
        isLoading: false,
        error: null,
      });

      render(<AnimalCalculator onAnimalFound={mockOnAnimalFound} />);

      const button = screen.getByTestId('animal-calculator-view-button');
      await user.click(button);

      expect(mockOnAnimalFound).toHaveBeenCalledTimes(1);
      expect(mockOnAnimalFound).toHaveBeenCalledWith(ChineseZodiacAnimal.RAT);
    });
  });

  describe('Different Animals', () => {
    it('should display correct info for Rat', () => {
      mockUseCalculateAnimal.mockReturnValue({
        data: createMockCalculateResponse({
          animal: ChineseZodiacAnimal.RAT,
          animalInfo: {
            animal: ChineseZodiacAnimal.RAT,
            nameEs: 'Rata',
            nameEn: 'Rat',
            emoji: '🐀',
            element: 'Agua',
            characteristics: ['Inteligente', 'Adaptable'],
          },
          chineseYear: 2020,
        }),
        isLoading: false,
        error: null,
      });

      render(<AnimalCalculator />);

      expect(screen.getByText('🐀')).toBeInTheDocument();
      expect(screen.getByText('Eres Rata')).toBeInTheDocument();
      expect(screen.getByText('Año chino: 2020')).toBeInTheDocument();
      // TODO: Add element assertion when Wu Xing feature is implemented (TASK-119-121)
    });

    it('should display correct info for Snake', () => {
      mockUseCalculateAnimal.mockReturnValue({
        data: createMockCalculateResponse({
          animal: ChineseZodiacAnimal.SNAKE,
          animalInfo: {
            animal: ChineseZodiacAnimal.SNAKE,
            nameEs: 'Serpiente',
            nameEn: 'Snake',
            emoji: '🐍',
            element: 'Fuego',
            characteristics: ['Enigmático', 'Sabio'],
          },
          chineseYear: 2025,
        }),
        isLoading: false,
        error: null,
      });

      render(<AnimalCalculator />);

      expect(screen.getByText('🐍')).toBeInTheDocument();
      expect(screen.getByText('Eres Serpiente')).toBeInTheDocument();
      expect(screen.getByText('Año chino: 2025')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label for date input', () => {
      render(<AnimalCalculator />);

      const input = screen.getByLabelText('Tu fecha de nacimiento');
      expect(input).toBeInTheDocument();
    });

    it('should have accessible heading', () => {
      render(<AnimalCalculator />);

      expect(
        screen.getByRole('heading', { level: 3, name: 'Descubre tu Animal del Zodiaco Chino' })
      ).toBeInTheDocument();
    });
  });
});
