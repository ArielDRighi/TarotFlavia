import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

// Mock ChineseAnimalCard component
vi.mock('./ChineseAnimalCard', () => ({
  ChineseAnimalCard: ({
    animalInfo,
    isSelected,
    isUserAnimal,
    onClick,
  }: {
    animalInfo: { animal: ChineseZodiacAnimal; nameEs: string };
    isSelected?: boolean;
    isUserAnimal?: boolean;
    onClick?: (animal: ChineseZodiacAnimal) => void;
  }) => (
    <div
      data-testid={`chinese-animal-${animalInfo.animal}`}
      onClick={() => onClick?.(animalInfo.animal)}
      className={`${isSelected ? 'selected' : ''} ${isUserAnimal ? 'user-animal' : ''}`}
    >
      {animalInfo.nameEs}
    </div>
  ),
}));

// Mock chinese-zodiac utils
vi.mock('@/lib/utils/chinese-zodiac', () => ({
  CHINESE_ZODIAC_INFO: {
    [ChineseZodiacAnimal.RAT]: {
      animal: ChineseZodiacAnimal.RAT,
      nameEs: 'Rata',
      nameEn: 'Rat',
      emoji: '🐀',
      element: 'Agua',
      characteristics: ['Inteligente'],
    },
    [ChineseZodiacAnimal.OX]: {
      animal: ChineseZodiacAnimal.OX,
      nameEs: 'Buey',
      nameEn: 'Ox',
      emoji: '🐂',
      element: 'Tierra',
      characteristics: ['Diligente'],
    },
    [ChineseZodiacAnimal.TIGER]: {
      animal: ChineseZodiacAnimal.TIGER,
      nameEs: 'Tigre',
      nameEn: 'Tiger',
      emoji: '🐅',
      element: 'Madera',
      characteristics: ['Valiente'],
    },
    [ChineseZodiacAnimal.RABBIT]: {
      animal: ChineseZodiacAnimal.RABBIT,
      nameEs: 'Conejo',
      nameEn: 'Rabbit',
      emoji: '🐇',
      element: 'Madera',
      characteristics: ['Gentil'],
    },
    [ChineseZodiacAnimal.DRAGON]: {
      animal: ChineseZodiacAnimal.DRAGON,
      nameEs: 'Dragón',
      nameEn: 'Dragon',
      emoji: '🐉',
      element: 'Tierra',
      characteristics: ['Confiado'],
    },
    [ChineseZodiacAnimal.SNAKE]: {
      animal: ChineseZodiacAnimal.SNAKE,
      nameEs: 'Serpiente',
      nameEn: 'Snake',
      emoji: '🐍',
      element: 'Fuego',
      characteristics: ['Enigmático'],
    },
    [ChineseZodiacAnimal.HORSE]: {
      animal: ChineseZodiacAnimal.HORSE,
      nameEs: 'Caballo',
      nameEn: 'Horse',
      emoji: '🐴',
      element: 'Fuego',
      characteristics: ['Animado'],
    },
    [ChineseZodiacAnimal.GOAT]: {
      animal: ChineseZodiacAnimal.GOAT,
      nameEs: 'Cabra',
      nameEn: 'Goat',
      emoji: '🐐',
      element: 'Tierra',
      characteristics: ['Calmado'],
    },
    [ChineseZodiacAnimal.MONKEY]: {
      animal: ChineseZodiacAnimal.MONKEY,
      nameEs: 'Mono',
      nameEn: 'Monkey',
      emoji: '🐒',
      element: 'Metal',
      characteristics: ['Agudo'],
    },
    [ChineseZodiacAnimal.ROOSTER]: {
      animal: ChineseZodiacAnimal.ROOSTER,
      nameEs: 'Gallo',
      nameEn: 'Rooster',
      emoji: '🐓',
      element: 'Metal',
      characteristics: ['Observador'],
    },
    [ChineseZodiacAnimal.DOG]: {
      animal: ChineseZodiacAnimal.DOG,
      nameEs: 'Perro',
      nameEn: 'Dog',
      emoji: '🐕',
      element: 'Tierra',
      characteristics: ['Leal'],
    },
    [ChineseZodiacAnimal.PIG]: {
      animal: ChineseZodiacAnimal.PIG,
      nameEs: 'Cerdo',
      nameEn: 'Pig',
      emoji: '🐖',
      element: 'Agua',
      characteristics: ['Compasivo'],
    },
  },
}));

// Import component after mocks
import { ChineseAnimalSelector } from './ChineseAnimalSelector';

describe('ChineseAnimalSelector', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render 12 Chinese zodiac animal cards', () => {
      render(<ChineseAnimalSelector onSelect={mockOnSelect} />);

      // Get only animal cards, not the selector container
      const cards = screen.getAllByTestId(
        /^chinese-animal-(rat|ox|tiger|rabbit|dragon|snake|horse|goat|monkey|rooster|dog|pig)$/
      );
      expect(cards).toHaveLength(12);
    });

    it('should render all Chinese zodiac animals', () => {
      render(<ChineseAnimalSelector onSelect={mockOnSelect} />);

      expect(screen.getByTestId('chinese-animal-rat')).toBeInTheDocument();
      expect(screen.getByTestId('chinese-animal-ox')).toBeInTheDocument();
      expect(screen.getByTestId('chinese-animal-tiger')).toBeInTheDocument();
      expect(screen.getByTestId('chinese-animal-rabbit')).toBeInTheDocument();
      expect(screen.getByTestId('chinese-animal-dragon')).toBeInTheDocument();
      expect(screen.getByTestId('chinese-animal-snake')).toBeInTheDocument();
      expect(screen.getByTestId('chinese-animal-horse')).toBeInTheDocument();
      expect(screen.getByTestId('chinese-animal-goat')).toBeInTheDocument();
      expect(screen.getByTestId('chinese-animal-monkey')).toBeInTheDocument();
      expect(screen.getByTestId('chinese-animal-rooster')).toBeInTheDocument();
      expect(screen.getByTestId('chinese-animal-dog')).toBeInTheDocument();
      expect(screen.getByTestId('chinese-animal-pig')).toBeInTheDocument();
    });

    it('should have testid chinese-animal-selector', () => {
      render(<ChineseAnimalSelector onSelect={mockOnSelect} />);

      expect(screen.getByTestId('chinese-animal-selector')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<ChineseAnimalSelector onSelect={mockOnSelect} className="custom-class" />);

      const selector = screen.getByTestId('chinese-animal-selector');
      expect(selector).toHaveClass('custom-class');
    });
  });

  describe('Selection state', () => {
    it('should mark selected animal', () => {
      render(
        <ChineseAnimalSelector
          selectedAnimal={ChineseZodiacAnimal.DRAGON}
          onSelect={mockOnSelect}
        />
      );

      const dragonCard = screen.getByTestId('chinese-animal-dragon');
      expect(dragonCard).toHaveClass('selected');
    });

    it('should not mark non-selected animals', () => {
      render(
        <ChineseAnimalSelector
          selectedAnimal={ChineseZodiacAnimal.DRAGON}
          onSelect={mockOnSelect}
        />
      );

      const ratCard = screen.getByTestId('chinese-animal-rat');
      expect(ratCard).not.toHaveClass('selected');
    });

    it('should mark user animal', () => {
      render(
        <ChineseAnimalSelector userAnimal={ChineseZodiacAnimal.TIGER} onSelect={mockOnSelect} />
      );

      const tigerCard = screen.getByTestId('chinese-animal-tiger');
      expect(tigerCard).toHaveClass('user-animal');
    });
  });

  describe('Interactions', () => {
    it('should call onSelect when animal card is clicked', async () => {
      const user = userEvent.setup();

      render(<ChineseAnimalSelector onSelect={mockOnSelect} />);

      await user.click(screen.getByTestId('chinese-animal-dragon'));

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(ChineseZodiacAnimal.DRAGON);
    });

    it('should call onSelect with correct animal for each card', async () => {
      const user = userEvent.setup();

      render(<ChineseAnimalSelector onSelect={mockOnSelect} />);

      await user.click(screen.getByTestId('chinese-animal-rat'));
      expect(mockOnSelect).toHaveBeenLastCalledWith(ChineseZodiacAnimal.RAT);

      await user.click(screen.getByTestId('chinese-animal-ox'));
      expect(mockOnSelect).toHaveBeenLastCalledWith(ChineseZodiacAnimal.OX);

      expect(mockOnSelect).toHaveBeenCalledTimes(2);
    });
  });

  describe('Layout', () => {
    it('should have grid layout classes', () => {
      render(<ChineseAnimalSelector onSelect={mockOnSelect} />);

      const selector = screen.getByTestId('chinese-animal-selector');
      expect(selector).toHaveClass('grid');
      expect(selector).toHaveClass('grid-cols-3');
      expect(selector).toHaveClass('gap-4');
    });

    it('should have responsive grid classes', () => {
      render(<ChineseAnimalSelector onSelect={mockOnSelect} />);

      const selector = screen.getByTestId('chinese-animal-selector');
      expect(selector).toHaveClass('md:grid-cols-4');
      expect(selector).toHaveClass('lg:grid-cols-6');
    });
  });
});
