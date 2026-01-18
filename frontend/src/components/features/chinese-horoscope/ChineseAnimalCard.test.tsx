import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ChineseAnimalCard } from './ChineseAnimalCard';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';
import type { ChineseZodiacInfo } from '@/types/chinese-horoscope.types';

// Factory function for creating test animal info
function createTestAnimalInfo(overrides: Partial<ChineseZodiacInfo> = {}): ChineseZodiacInfo {
  return {
    animal: ChineseZodiacAnimal.RAT,
    nameEs: 'Rata',
    nameEn: 'Rat',
    emoji: '🐀',
    element: 'Agua',
    characteristics: ['Inteligente', 'Adaptable', 'Ingenioso'],
    ...overrides,
  };
}

describe('ChineseAnimalCard', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render animal emoji', () => {
      const animalInfo = createTestAnimalInfo();

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      expect(screen.getByText('🐀')).toBeInTheDocument();
    });

    it('should render animal name in Spanish', () => {
      const animalInfo = createTestAnimalInfo({ nameEs: 'Dragón' });

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      expect(screen.getByText('Dragón')).toBeInTheDocument();
    });

    it('should render animal element', () => {
      const animalInfo = createTestAnimalInfo({ element: 'Fuego' });

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      expect(screen.getByText('Fuego')).toBeInTheDocument();
    });

    it('should have correct testid with animal value', () => {
      const animalInfo = createTestAnimalInfo({ animal: ChineseZodiacAnimal.DRAGON });

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      expect(screen.getByTestId('chinese-animal-dragon')).toBeInTheDocument();
    });

    it('should show "Tu animal" label when isUserAnimal is true', () => {
      const animalInfo = createTestAnimalInfo();

      render(
        <ChineseAnimalCard animalInfo={animalInfo} isUserAnimal={true} onClick={mockOnClick} />
      );

      expect(screen.getByText('Tu animal')).toBeInTheDocument();
    });

    it('should not show "Tu animal" label when isUserAnimal is false', () => {
      const animalInfo = createTestAnimalInfo();

      render(
        <ChineseAnimalCard animalInfo={animalInfo} isUserAnimal={false} onClick={mockOnClick} />
      );

      expect(screen.queryByText('Tu animal')).not.toBeInTheDocument();
    });

    it('should not show "Tu animal" label by default', () => {
      const animalInfo = createTestAnimalInfo();

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      expect(screen.queryByText('Tu animal')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have ring-2 ring-primary when isSelected is true', () => {
      const animalInfo = createTestAnimalInfo();

      render(<ChineseAnimalCard animalInfo={animalInfo} isSelected={true} onClick={mockOnClick} />);

      const card = screen.getByTestId(`chinese-animal-${animalInfo.animal}`);
      expect(card).toHaveClass('ring-2');
      expect(card).toHaveClass('ring-primary');
    });

    it('should not have ring classes when isSelected is false', () => {
      const animalInfo = createTestAnimalInfo();

      render(
        <ChineseAnimalCard animalInfo={animalInfo} isSelected={false} onClick={mockOnClick} />
      );

      const card = screen.getByTestId(`chinese-animal-${animalInfo.animal}`);
      expect(card).not.toHaveClass('ring-2');
      expect(card).not.toHaveClass('ring-primary');
    });

    it('should have border-red-500 border-2 when isUserAnimal is true', () => {
      const animalInfo = createTestAnimalInfo();

      render(
        <ChineseAnimalCard animalInfo={animalInfo} isUserAnimal={true} onClick={mockOnClick} />
      );

      const card = screen.getByTestId(`chinese-animal-${animalInfo.animal}`);
      expect(card).toHaveClass('border-red-500');
      expect(card).toHaveClass('border-2');
    });

    it('should have hover effects', () => {
      const animalInfo = createTestAnimalInfo();

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      const card = screen.getByTestId(`chinese-animal-${animalInfo.animal}`);
      expect(card).toHaveClass('hover:shadow-md');
      expect(card).toHaveClass('hover:scale-105');
    });

    it('should have cursor-pointer class', () => {
      const animalInfo = createTestAnimalInfo();

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      const card = screen.getByTestId(`chinese-animal-${animalInfo.animal}`);
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should have transition-all class for smooth animations', () => {
      const animalInfo = createTestAnimalInfo();

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      const card = screen.getByTestId(`chinese-animal-${animalInfo.animal}`);
      expect(card).toHaveClass('transition-all');
    });
  });

  describe('Interactions', () => {
    it('should call onClick with animal when card is clicked', async () => {
      const user = userEvent.setup();
      const animalInfo = createTestAnimalInfo({ animal: ChineseZodiacAnimal.TIGER });

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      await user.click(screen.getByTestId('chinese-animal-tiger'));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(ChineseZodiacAnimal.TIGER);
    });

    it('should not call onClick if onClick is not provided', async () => {
      const user = userEvent.setup();
      const animalInfo = createTestAnimalInfo();

      render(<ChineseAnimalCard animalInfo={animalInfo} />);

      // Should not throw error when clicking without onClick
      await user.click(screen.getByTestId(`chinese-animal-${animalInfo.animal}`));

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should be keyboard accessible with Enter key', async () => {
      const user = userEvent.setup();
      const animalInfo = createTestAnimalInfo();

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      const card = screen.getByTestId(`chinese-animal-${animalInfo.animal}`);

      // Simulate clicking via Enter key
      card.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(animalInfo.animal);
    });

    it('should be keyboard accessible with Space key', async () => {
      const user = userEvent.setup();
      const animalInfo = createTestAnimalInfo();

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      const card = screen.getByTestId(`chinese-animal-${animalInfo.animal}`);

      // Simulate clicking via Space key
      card.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(animalInfo.animal);
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const animalInfo = createTestAnimalInfo();

      render(
        <ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} className="custom-class" />
      );

      const card = screen.getByTestId(`chinese-animal-${animalInfo.animal}`);
      expect(card).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      const animalInfo = createTestAnimalInfo();

      render(
        <ChineseAnimalCard
          animalInfo={animalInfo}
          onClick={mockOnClick}
          className="custom-padding"
        />
      );

      const card = screen.getByTestId(`chinese-animal-${animalInfo.animal}`);
      expect(card).toHaveClass('custom-padding');
      expect(card).toHaveClass('cursor-pointer');
    });
  });

  describe('All Chinese Zodiac animals', () => {
    it('should render correctly for all 12 Chinese Zodiac animals', () => {
      const animals: Array<{
        animal: ChineseZodiacAnimal;
        nameEs: string;
        emoji: string;
      }> = [
        { animal: ChineseZodiacAnimal.RAT, nameEs: 'Rata', emoji: '🐀' },
        { animal: ChineseZodiacAnimal.OX, nameEs: 'Buey', emoji: '🐂' },
        { animal: ChineseZodiacAnimal.TIGER, nameEs: 'Tigre', emoji: '🐅' },
        { animal: ChineseZodiacAnimal.RABBIT, nameEs: 'Conejo', emoji: '🐇' },
        { animal: ChineseZodiacAnimal.DRAGON, nameEs: 'Dragón', emoji: '🐉' },
        { animal: ChineseZodiacAnimal.SNAKE, nameEs: 'Serpiente', emoji: '🐍' },
        { animal: ChineseZodiacAnimal.HORSE, nameEs: 'Caballo', emoji: '🐴' },
        { animal: ChineseZodiacAnimal.GOAT, nameEs: 'Cabra', emoji: '🐐' },
        { animal: ChineseZodiacAnimal.MONKEY, nameEs: 'Mono', emoji: '🐒' },
        { animal: ChineseZodiacAnimal.ROOSTER, nameEs: 'Gallo', emoji: '🐓' },
        { animal: ChineseZodiacAnimal.DOG, nameEs: 'Perro', emoji: '🐕' },
        { animal: ChineseZodiacAnimal.PIG, nameEs: 'Cerdo', emoji: '🐖' },
      ];

      animals.forEach(({ animal, nameEs, emoji }) => {
        const animalInfo = createTestAnimalInfo({ animal, nameEs, emoji });
        const { unmount } = render(
          <ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />
        );

        expect(screen.getByText(emoji)).toBeInTheDocument();
        expect(screen.getByText(nameEs)).toBeInTheDocument();
        expect(screen.getByTestId(`chinese-animal-${animal}`)).toBeInTheDocument();

        unmount();
      });
    });
  });
});
