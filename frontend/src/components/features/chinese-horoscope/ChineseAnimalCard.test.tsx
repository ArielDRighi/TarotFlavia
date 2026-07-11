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
    it('should render the monochrome animal symbol (colorable with text-primary)', () => {
      const animalInfo = createTestAnimalInfo();

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      const symbol = screen.getByRole('img', { name: 'Rata' });
      expect(symbol).toBeInTheDocument();
      expect(symbol).toHaveClass('text-primary');
    });

    it('should center the animal symbol like the western zodiac card', () => {
      const animalInfo = createTestAnimalInfo();

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      // El <svg> es display:block por el preflight de Tailwind, así que `text-center`
      // no lo centra: se fuerza `block mx-auto` para alinearlo igual que el occidental.
      const symbol = screen.getByRole('img', { name: 'Rata' });
      expect(symbol).toHaveClass('block');
      expect(symbol).toHaveClass('mx-auto');
    });

    it('should render animal name in Spanish', () => {
      const animalInfo = createTestAnimalInfo({ nameEs: 'Dragón' });

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      expect(screen.getByText('Dragón')).toBeInTheDocument();
    });

    it('should have correct testid with animal value', () => {
      const animalInfo = createTestAnimalInfo({ animal: ChineseZodiacAnimal.DRAGON });

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      expect(screen.getByTestId('chinese-animal-dragon')).toBeInTheDocument();
    });

    it('should not render a visible "Tu animal" label that alters card height', () => {
      const animalInfo = createTestAnimalInfo();

      render(
        <ChineseAnimalCard animalInfo={animalInfo} isUserAnimal={true} onClick={mockOnClick} />
      );

      // El destacado se apoya solo en el borde: no debe agregarse texto visible.
      expect(screen.queryByText('Tu animal')).not.toBeInTheDocument();
    });

    it('should expose the "tu animal" state via aria-label when isUserAnimal is true', () => {
      const animalInfo = createTestAnimalInfo();

      render(
        <ChineseAnimalCard animalInfo={animalInfo} isUserAnimal={true} onClick={mockOnClick} />
      );

      expect(screen.getByRole('button', { name: /tu animal/i })).toBeInTheDocument();
    });

    it('should not expose the "tu animal" state via aria-label when isUserAnimal is false', () => {
      const animalInfo = createTestAnimalInfo();

      render(
        <ChineseAnimalCard animalInfo={animalInfo} isUserAnimal={false} onClick={mockOnClick} />
      );

      expect(screen.queryByRole('button', { name: /tu animal/i })).not.toBeInTheDocument();
    });

    it('should not expose the "tu animal" state via aria-label by default', () => {
      const animalInfo = createTestAnimalInfo();

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      expect(screen.queryByRole('button', { name: /tu animal/i })).not.toBeInTheDocument();
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

    it('should have border-accent border-2 when isUserAnimal is true', () => {
      const animalInfo = createTestAnimalInfo();

      render(
        <ChineseAnimalCard animalInfo={animalInfo} isUserAnimal={true} onClick={mockOnClick} />
      );

      const card = screen.getByTestId(`chinese-animal-${animalInfo.animal}`);
      expect(card).toHaveClass('border-accent');
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

  // T-PROD-010: el modo compacto es el que usa el carrusel móvil del selector.
  // El nombre debe entrar completo en una tarjeta angosta (w-28), sin recortarse.
  describe('Compact mode (T-PROD-010)', () => {
    it('should render the name at a size that fits a narrow card', () => {
      const animalInfo = createTestAnimalInfo({ nameEs: 'Serpiente' });

      render(<ChineseAnimalCard animalInfo={animalInfo} compact onClick={mockOnClick} />);

      const name = screen.getByText('Serpiente');
      expect(name).toHaveClass('text-sm');
      expect(name).not.toHaveClass('text-lg');
    });

    it('should let a long name wrap instead of overflowing the card', () => {
      const animalInfo = createTestAnimalInfo({ nameEs: 'Serpiente' });

      render(<ChineseAnimalCard animalInfo={animalInfo} compact onClick={mockOnClick} />);

      const name = screen.getByText('Serpiente');
      expect(name).toHaveClass('leading-tight');
      expect(name).toHaveClass('break-words');
    });

    it('should use reduced padding in compact mode', () => {
      const animalInfo = createTestAnimalInfo();

      render(<ChineseAnimalCard animalInfo={animalInfo} compact onClick={mockOnClick} />);

      const card = screen.getByTestId('chinese-animal-rat');
      expect(card).toHaveClass('p-3');
      expect(card).not.toHaveClass('p-4');
    });

    it('should keep the full-size look by default (grid variant untouched)', () => {
      const animalInfo = createTestAnimalInfo({ nameEs: 'Serpiente' });

      render(<ChineseAnimalCard animalInfo={animalInfo} onClick={mockOnClick} />);

      expect(screen.getByText('Serpiente')).toHaveClass('text-lg');
      expect(screen.getByTestId('chinese-animal-rat')).toHaveClass('p-4');
    });

    it('should still render the full name text in compact mode', () => {
      const animalInfo = createTestAnimalInfo({ nameEs: 'Serpiente' });

      render(<ChineseAnimalCard animalInfo={animalInfo} compact onClick={mockOnClick} />);

      expect(screen.getByText('Serpiente')).toBeInTheDocument();
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

        expect(screen.getByRole('img', { name: nameEs })).toBeInTheDocument();
        expect(screen.getByText(nameEs)).toBeInTheDocument();
        expect(screen.getByTestId(`chinese-animal-${animal}`)).toBeInTheDocument();

        unmount();
      });
    });
  });
});
