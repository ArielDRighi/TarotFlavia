import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ZodiacSignCard } from './ZodiacSignCard';
import { ZodiacSign } from '@/types/horoscope.types';
import type { ZodiacSignInfo } from '@/types/horoscope.types';

// Factory function for creating test sign info
function createTestSignInfo(overrides: Partial<ZodiacSignInfo> = {}): ZodiacSignInfo {
  return {
    sign: ZodiacSign.ARIES,
    nameEs: 'Aries',
    nameEn: 'Aries',
    symbol: '♈',
    element: 'fire',
    ...overrides,
  };
}

describe('ZodiacSignCard', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render zodiac sign symbol', () => {
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} />);

      expect(screen.getByText('♈')).toBeInTheDocument();
    });

    it('should render zodiac sign name in Spanish', () => {
      const signInfo = createTestSignInfo({ nameEs: 'Tauro' });

      render(<ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} />);

      expect(screen.getByText('Tauro')).toBeInTheDocument();
    });

    it('should have appropriate aria-label with Spanish name', () => {
      const signInfo = createTestSignInfo({ nameEs: 'Aries', symbol: '♈' });

      render(<ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} />);

      const symbol = screen.getByLabelText('Aries');
      expect(symbol).toBeInTheDocument();
    });

    it('should have correct testid with sign value', () => {
      const signInfo = createTestSignInfo({ sign: ZodiacSign.LEO });

      render(<ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} />);

      expect(screen.getByTestId('zodiac-card-leo')).toBeInTheDocument();
    });

    it('should show "Tu signo" label when isUserSign is true', () => {
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} isUserSign={true} onClick={mockOnClick} />);

      expect(screen.getByText('Tu signo')).toBeInTheDocument();
    });

    it('should not show "Tu signo" label when isUserSign is false', () => {
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} isUserSign={false} onClick={mockOnClick} />);

      expect(screen.queryByText('Tu signo')).not.toBeInTheDocument();
    });

    it('should not show "Tu signo" label by default', () => {
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} />);

      expect(screen.queryByText('Tu signo')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have ring-2 ring-primary when isSelected is true', () => {
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} isSelected={true} onClick={mockOnClick} />);

      const card = screen.getByTestId(`zodiac-card-${signInfo.sign}`);
      expect(card).toHaveClass('ring-2');
      expect(card).toHaveClass('ring-primary');
    });

    it('should not have ring classes when isSelected is false', () => {
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} isSelected={false} onClick={mockOnClick} />);

      const card = screen.getByTestId(`zodiac-card-${signInfo.sign}`);
      expect(card).not.toHaveClass('ring-2');
      expect(card).not.toHaveClass('ring-primary');
    });

    it('should have border-accent border-2 when isUserSign is true', () => {
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} isUserSign={true} onClick={mockOnClick} />);

      const card = screen.getByTestId(`zodiac-card-${signInfo.sign}`);
      expect(card).toHaveClass('border-accent');
      expect(card).toHaveClass('border-2');
    });

    it('should have hover effects', () => {
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} />);

      const card = screen.getByTestId(`zodiac-card-${signInfo.sign}`);
      expect(card).toHaveClass('hover:shadow-md');
      expect(card).toHaveClass('hover:scale-105');
    });

    it('should have cursor-pointer class', () => {
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} />);

      const card = screen.getByTestId(`zodiac-card-${signInfo.sign}`);
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should have transition-all class for smooth animations', () => {
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} />);

      const card = screen.getByTestId(`zodiac-card-${signInfo.sign}`);
      expect(card).toHaveClass('transition-all');
    });
  });

  describe('Interactions', () => {
    it('should call onClick with sign when card is clicked', async () => {
      const user = userEvent.setup();
      const signInfo = createTestSignInfo({ sign: ZodiacSign.GEMINI });

      render(<ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} />);

      await user.click(screen.getByTestId('zodiac-card-gemini'));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(ZodiacSign.GEMINI);
    });

    it('should not call onClick if onClick is not provided', async () => {
      const user = userEvent.setup();
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} />);

      // Should not throw error when clicking without onClick
      await user.click(screen.getByTestId(`zodiac-card-${signInfo.sign}`));

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should be keyboard accessible with Enter key', async () => {
      const user = userEvent.setup();
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} />);

      const card = screen.getByTestId(`zodiac-card-${signInfo.sign}`);

      // Simulate clicking via Enter key
      card.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(signInfo.sign);
    });

    it('should be keyboard accessible with Space key', async () => {
      const user = userEvent.setup();
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} />);

      const card = screen.getByTestId(`zodiac-card-${signInfo.sign}`);

      // Simulate clicking via Space key
      card.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(signInfo.sign);
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const signInfo = createTestSignInfo();

      render(<ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} className="custom-class" />);

      const card = screen.getByTestId(`zodiac-card-${signInfo.sign}`);
      expect(card).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      const signInfo = createTestSignInfo();

      render(
        <ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} className="custom-padding" />
      );

      const card = screen.getByTestId(`zodiac-card-${signInfo.sign}`);
      expect(card).toHaveClass('custom-padding');
      expect(card).toHaveClass('cursor-pointer');
    });
  });

  describe('All zodiac signs', () => {
    it('should render correctly for all 12 zodiac signs', () => {
      const signs: Array<{ sign: ZodiacSign; nameEs: string; symbol: string }> = [
        { sign: ZodiacSign.ARIES, nameEs: 'Aries', symbol: '♈' },
        { sign: ZodiacSign.TAURUS, nameEs: 'Tauro', symbol: '♉' },
        { sign: ZodiacSign.GEMINI, nameEs: 'Géminis', symbol: '♊' },
        { sign: ZodiacSign.CANCER, nameEs: 'Cáncer', symbol: '♋' },
        { sign: ZodiacSign.LEO, nameEs: 'Leo', symbol: '♌' },
        { sign: ZodiacSign.VIRGO, nameEs: 'Virgo', symbol: '♍' },
        { sign: ZodiacSign.LIBRA, nameEs: 'Libra', symbol: '♎' },
        { sign: ZodiacSign.SCORPIO, nameEs: 'Escorpio', symbol: '♏' },
        { sign: ZodiacSign.SAGITTARIUS, nameEs: 'Sagitario', symbol: '♐' },
        { sign: ZodiacSign.CAPRICORN, nameEs: 'Capricornio', symbol: '♑' },
        { sign: ZodiacSign.AQUARIUS, nameEs: 'Acuario', symbol: '♒' },
        { sign: ZodiacSign.PISCES, nameEs: 'Piscis', symbol: '♓' },
      ];

      signs.forEach(({ sign, nameEs, symbol }) => {
        const signInfo = createTestSignInfo({ sign, nameEs, symbol });
        const { unmount } = render(<ZodiacSignCard signInfo={signInfo} onClick={mockOnClick} />);

        expect(screen.getByText(symbol)).toBeInTheDocument();
        expect(screen.getByText(nameEs)).toBeInTheDocument();
        expect(screen.getByTestId(`zodiac-card-${sign}`)).toBeInTheDocument();

        unmount();
      });
    });
  });
});
