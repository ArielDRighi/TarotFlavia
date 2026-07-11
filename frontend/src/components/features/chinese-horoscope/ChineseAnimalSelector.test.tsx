import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

// Mock ChineseAnimalCard component
vi.mock('./ChineseAnimalCard', () => ({
  ChineseAnimalCard: ({
    animalInfo,
    isSelected,
    isUserAnimal,
    compact,
    onClick,
    className,
  }: {
    animalInfo: { animal: ChineseZodiacAnimal; nameEs: string };
    isSelected?: boolean;
    isUserAnimal?: boolean;
    compact?: boolean;
    onClick?: (animal: ChineseZodiacAnimal) => void;
    className?: string;
  }) => (
    <div
      data-testid={`chinese-animal-${animalInfo.animal}`}
      data-compact={compact ? 'true' : 'false'}
      onClick={() => onClick?.(animalInfo.animal)}
      className={`${isSelected ? 'selected' : ''} ${isUserAnimal ? 'user-animal' : ''} ${className ?? ''}`}
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

  afterEach(() => {
    vi.restoreAllMocks();
    // No dejar scrollIntoView pisado en el prototipo para el resto de la suite.
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
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

  // T-PROD-010: en móvil la grilla forzada a 6 columnas dejaba tarjetas de ~55px
  // y los nombres largos ("Serpiente", "Caballo") se cortaban. La variante
  // carousel es una fila real con scroll horizontal intencional.
  describe('Variant carousel (T-PROD-010)', () => {
    it('should default to the grid variant when no variant is given', () => {
      render(<ChineseAnimalSelector onSelect={mockOnSelect} />);

      const selector = screen.getByTestId('chinese-animal-selector');
      expect(selector).toHaveClass('grid');
      expect(selector).not.toHaveClass('flex');
    });

    it('should render a single-row flex carousel with intentional horizontal scroll', () => {
      render(<ChineseAnimalSelector onSelect={mockOnSelect} variant="carousel" />);

      const selector = screen.getByTestId('chinese-animal-selector');
      expect(selector).toHaveClass('flex');
      expect(selector).toHaveClass('overflow-x-auto');
      expect(selector).not.toHaveClass('grid');
      expect(selector).not.toHaveClass('grid-cols-3');
    });

    it('should give each card a fixed width so names are not squeezed', () => {
      render(<ChineseAnimalSelector onSelect={mockOnSelect} variant="carousel" />);

      const card = screen.getByTestId('chinese-animal-snake');
      expect(card).toHaveClass('w-28');
      expect(card).toHaveClass('shrink-0');
    });

    it('should render the cards in compact mode', () => {
      render(<ChineseAnimalSelector onSelect={mockOnSelect} variant="carousel" />);

      const card = screen.getByTestId('chinese-animal-snake');
      expect(card).toHaveAttribute('data-compact', 'true');
    });

    it('should NOT render cards in compact mode in the grid variant', () => {
      render(<ChineseAnimalSelector onSelect={mockOnSelect} />);

      const card = screen.getByTestId('chinese-animal-snake');
      expect(card).toHaveAttribute('data-compact', 'false');
    });

    it('should still render the 12 animal names in full', () => {
      render(<ChineseAnimalSelector onSelect={mockOnSelect} variant="carousel" />);

      expect(screen.getByText('Serpiente')).toBeInTheDocument();
      expect(screen.getByText('Caballo')).toBeInTheDocument();
      expect(
        screen.getAllByTestId(
          /^chinese-animal-(rat|ox|tiger|rabbit|dragon|snake|horse|goat|monkey|rooster|dog|pig)$/
        )
      ).toHaveLength(12);
    });

    it('should keep selection working in the carousel variant', async () => {
      const user = userEvent.setup();

      render(<ChineseAnimalSelector onSelect={mockOnSelect} variant="carousel" />);

      await user.click(screen.getByTestId('chinese-animal-horse'));

      expect(mockOnSelect).toHaveBeenCalledWith(ChineseZodiacAnimal.HORSE);
    });

    it('should keep the desktop row of 12 columns untouched', () => {
      // El Delta pidió explícitamente NO tocar desktop, donde se ve bien: en `lg:` se
      // restaura la fila de 12 columnas original. El carrusel es solo para móvil.
      render(<ChineseAnimalSelector onSelect={mockOnSelect} variant="carousel" />);

      const selector = screen.getByTestId('chinese-animal-selector');
      expect(selector).toHaveClass('lg:grid');
      expect(selector).toHaveClass('lg:grid-cols-12');
    });

    // REGRESIÓN: la primera versión de este auto-scroll usaba scrollIntoView, que por
    // spec desplaza TODAS las cajas scrolleables ancestras, incluida la del documento.
    // Como el body tiene desborde horizontal preexistente, la página entera cargaba
    // corrida (hasta 64px en tablet). Ahora se escribe scrollLeft sobre el contenedor.
    // El centrado real se verifica en tests/e2e (jsdom no tiene layout).
    it('should NOT use scrollIntoView (arrastraría la página entera)', () => {
      // jsdom no implementa scrollIntoView, así que hay que definirlo para poder
      // espiarlo. El afterEach de este bloque lo quita del prototipo.
      const scrollIntoView = vi.fn();
      Object.defineProperty(Element.prototype, 'scrollIntoView', {
        value: scrollIntoView,
        configurable: true,
        writable: true,
      });

      render(
        <ChineseAnimalSelector
          selectedAnimal={ChineseZodiacAnimal.GOAT}
          onSelect={mockOnSelect}
          variant="carousel"
        />
      );

      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });
});
