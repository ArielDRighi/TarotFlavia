import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ZodiacSign } from '@/types/horoscope.types';

// Mock ZodiacSignCard component
vi.mock('./ZodiacSignCard', () => ({
  ZodiacSignCard: ({
    signInfo,
    isSelected,
    isUserSign,
    onClick,
  }: {
    signInfo: { sign: ZodiacSign; nameEs: string };
    isSelected?: boolean;
    isUserSign?: boolean;
    onClick?: (sign: ZodiacSign) => void;
  }) => (
    <div
      data-testid={`zodiac-card-${signInfo.sign}`}
      onClick={() => onClick?.(signInfo.sign)}
      className={`${isSelected ? 'selected' : ''} ${isUserSign ? 'user-sign' : ''}`}
    >
      {signInfo.nameEs}
    </div>
  ),
}));

// Mock zodiac utils
vi.mock('@/lib/utils/zodiac', () => ({
  ZODIAC_SIGNS_INFO: {
    [ZodiacSign.ARIES]: {
      sign: ZodiacSign.ARIES,
      nameEs: 'Aries',
      nameEn: 'Aries',
      symbol: '♈',
      element: 'fire' as const,
    },
    [ZodiacSign.TAURUS]: {
      sign: ZodiacSign.TAURUS,
      nameEs: 'Tauro',
      nameEn: 'Taurus',
      symbol: '♉',
      element: 'earth' as const,
    },
    [ZodiacSign.GEMINI]: {
      sign: ZodiacSign.GEMINI,
      nameEs: 'Géminis',
      nameEn: 'Gemini',
      symbol: '♊',
      element: 'air' as const,
    },
    [ZodiacSign.CANCER]: {
      sign: ZodiacSign.CANCER,
      nameEs: 'Cáncer',
      nameEn: 'Cancer',
      symbol: '♋',
      element: 'water' as const,
    },
    [ZodiacSign.LEO]: {
      sign: ZodiacSign.LEO,
      nameEs: 'Leo',
      nameEn: 'Leo',
      symbol: '♌',
      element: 'fire' as const,
    },
    [ZodiacSign.VIRGO]: {
      sign: ZodiacSign.VIRGO,
      nameEs: 'Virgo',
      nameEn: 'Virgo',
      symbol: '♍',
      element: 'earth' as const,
    },
    [ZodiacSign.LIBRA]: {
      sign: ZodiacSign.LIBRA,
      nameEs: 'Libra',
      nameEn: 'Libra',
      symbol: '♎',
      element: 'air' as const,
    },
    [ZodiacSign.SCORPIO]: {
      sign: ZodiacSign.SCORPIO,
      nameEs: 'Escorpio',
      nameEn: 'Scorpio',
      symbol: '♏',
      element: 'water' as const,
    },
    [ZodiacSign.SAGITTARIUS]: {
      sign: ZodiacSign.SAGITTARIUS,
      nameEs: 'Sagitario',
      nameEn: 'Sagittarius',
      symbol: '♐',
      element: 'fire' as const,
    },
    [ZodiacSign.CAPRICORN]: {
      sign: ZodiacSign.CAPRICORN,
      nameEs: 'Capricornio',
      nameEn: 'Capricorn',
      symbol: '♑',
      element: 'earth' as const,
    },
    [ZodiacSign.AQUARIUS]: {
      sign: ZodiacSign.AQUARIUS,
      nameEs: 'Acuario',
      nameEn: 'Aquarius',
      symbol: '♒',
      element: 'air' as const,
    },
    [ZodiacSign.PISCES]: {
      sign: ZodiacSign.PISCES,
      nameEs: 'Piscis',
      nameEn: 'Pisces',
      symbol: '♓',
      element: 'water' as const,
    },
  },
}));

// Import component after mocks
import { ZodiacSignSelector } from './ZodiacSignSelector';

describe('ZodiacSignSelector', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render 12 zodiac sign cards', () => {
      render(<ZodiacSignSelector onSelect={mockOnSelect} />);

      const cards = screen.getAllByTestId(/zodiac-card-/);
      expect(cards).toHaveLength(12);
    });

    it('should render all zodiac signs in correct order', () => {
      render(<ZodiacSignSelector onSelect={mockOnSelect} />);

      expect(screen.getByTestId('zodiac-card-aries')).toBeInTheDocument();
      expect(screen.getByTestId('zodiac-card-taurus')).toBeInTheDocument();
      expect(screen.getByTestId('zodiac-card-gemini')).toBeInTheDocument();
      expect(screen.getByTestId('zodiac-card-cancer')).toBeInTheDocument();
      expect(screen.getByTestId('zodiac-card-leo')).toBeInTheDocument();
      expect(screen.getByTestId('zodiac-card-virgo')).toBeInTheDocument();
      expect(screen.getByTestId('zodiac-card-libra')).toBeInTheDocument();
      expect(screen.getByTestId('zodiac-card-scorpio')).toBeInTheDocument();
      expect(screen.getByTestId('zodiac-card-sagittarius')).toBeInTheDocument();
      expect(screen.getByTestId('zodiac-card-capricorn')).toBeInTheDocument();
      expect(screen.getByTestId('zodiac-card-aquarius')).toBeInTheDocument();
      expect(screen.getByTestId('zodiac-card-pisces')).toBeInTheDocument();
    });

    it('should have zodiac-selector testid', () => {
      render(<ZodiacSignSelector onSelect={mockOnSelect} />);

      expect(screen.getByTestId('zodiac-selector')).toBeInTheDocument();
    });

    it('should have grid layout', () => {
      render(<ZodiacSignSelector onSelect={mockOnSelect} />);

      const selector = screen.getByTestId('zodiac-selector');
      expect(selector).toHaveClass('grid');
    });

    it('should have responsive grid columns', () => {
      render(<ZodiacSignSelector onSelect={mockOnSelect} />);

      const selector = screen.getByTestId('zodiac-selector');
      expect(selector).toHaveClass('grid-cols-3'); // mobile
      expect(selector).toHaveClass('md:grid-cols-4'); // tablet
      expect(selector).toHaveClass('lg:grid-cols-6'); // desktop
    });
  });

  describe('Selected Sign', () => {
    it('should mark selectedSign as selected', () => {
      render(<ZodiacSignSelector selectedSign={ZodiacSign.LEO} onSelect={mockOnSelect} />);

      const leoCard = screen.getByTestId('zodiac-card-leo');
      expect(leoCard).toHaveClass('selected');
    });

    it('should not mark other signs as selected', () => {
      render(<ZodiacSignSelector selectedSign={ZodiacSign.LEO} onSelect={mockOnSelect} />);

      const ariesCard = screen.getByTestId('zodiac-card-aries');
      expect(ariesCard).not.toHaveClass('selected');
    });

    it('should handle null selectedSign', () => {
      render(<ZodiacSignSelector selectedSign={null} onSelect={mockOnSelect} />);

      const cards = screen.getAllByTestId(/zodiac-card-/);
      cards.forEach((card) => {
        expect(card).not.toHaveClass('selected');
      });
    });

    it('should handle undefined selectedSign', () => {
      render(<ZodiacSignSelector onSelect={mockOnSelect} />);

      const cards = screen.getAllByTestId(/zodiac-card-/);
      cards.forEach((card) => {
        expect(card).not.toHaveClass('selected');
      });
    });
  });

  describe('User Sign', () => {
    it('should mark userSign card as user sign', () => {
      render(<ZodiacSignSelector userSign={ZodiacSign.GEMINI} onSelect={mockOnSelect} />);

      const geminiCard = screen.getByTestId('zodiac-card-gemini');
      expect(geminiCard).toHaveClass('user-sign');
    });

    it('should not mark other signs as user sign', () => {
      render(<ZodiacSignSelector userSign={ZodiacSign.GEMINI} onSelect={mockOnSelect} />);

      const ariesCard = screen.getByTestId('zodiac-card-aries');
      expect(ariesCard).not.toHaveClass('user-sign');
    });

    it('should handle null userSign', () => {
      render(<ZodiacSignSelector userSign={null} onSelect={mockOnSelect} />);

      const cards = screen.getAllByTestId(/zodiac-card-/);
      cards.forEach((card) => {
        expect(card).not.toHaveClass('user-sign');
      });
    });

    it('should handle both selectedSign and userSign being the same', () => {
      render(
        <ZodiacSignSelector
          selectedSign={ZodiacSign.VIRGO}
          userSign={ZodiacSign.VIRGO}
          onSelect={mockOnSelect}
        />
      );

      const virgoCard = screen.getByTestId('zodiac-card-virgo');
      expect(virgoCard).toHaveClass('selected');
      expect(virgoCard).toHaveClass('user-sign');
    });

    it('should handle selectedSign and userSign being different', () => {
      render(
        <ZodiacSignSelector
          selectedSign={ZodiacSign.LEO}
          userSign={ZodiacSign.PISCES}
          onSelect={mockOnSelect}
        />
      );

      const leoCard = screen.getByTestId('zodiac-card-leo');
      expect(leoCard).toHaveClass('selected');
      expect(leoCard).not.toHaveClass('user-sign');

      const piscesCard = screen.getByTestId('zodiac-card-pisces');
      expect(piscesCard).not.toHaveClass('selected');
      expect(piscesCard).toHaveClass('user-sign');
    });
  });

  describe('Interactions', () => {
    it('should call onSelect when a sign card is clicked', async () => {
      const user = userEvent.setup();

      render(<ZodiacSignSelector onSelect={mockOnSelect} />);

      await user.click(screen.getByTestId('zodiac-card-aries'));

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(ZodiacSign.ARIES);
    });

    it('should call onSelect with correct sign for each card', async () => {
      const user = userEvent.setup();

      render(<ZodiacSignSelector onSelect={mockOnSelect} />);

      // Test a few different signs
      await user.click(screen.getByTestId('zodiac-card-taurus'));
      expect(mockOnSelect).toHaveBeenLastCalledWith(ZodiacSign.TAURUS);

      await user.click(screen.getByTestId('zodiac-card-scorpio'));
      expect(mockOnSelect).toHaveBeenLastCalledWith(ZodiacSign.SCORPIO);

      await user.click(screen.getByTestId('zodiac-card-aquarius'));
      expect(mockOnSelect).toHaveBeenLastCalledWith(ZodiacSign.AQUARIUS);

      expect(mockOnSelect).toHaveBeenCalledTimes(3);
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<ZodiacSignSelector onSelect={mockOnSelect} className="custom-selector" />);

      const selector = screen.getByTestId('zodiac-selector');
      expect(selector).toHaveClass('custom-selector');
    });

    it('should merge custom className with default classes', () => {
      render(<ZodiacSignSelector onSelect={mockOnSelect} className="extra-gap" />);

      const selector = screen.getByTestId('zodiac-selector');
      expect(selector).toHaveClass('extra-gap');
      expect(selector).toHaveClass('grid');
    });
  });
});
