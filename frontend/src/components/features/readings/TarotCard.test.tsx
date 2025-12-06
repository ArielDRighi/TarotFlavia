import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TarotCard } from './TarotCard';
import type { ReadingCard } from '@/types/reading.types';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: function MockImage({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) {
    return <img src={src} alt={alt} className={className} data-testid="next-image" />;
  },
}));

/**
 * TarotCard Component Tests
 *
 * Tests for the TarotCard component that displays a tarot card
 * with flip animation, multiple sizes, and accessibility features.
 */

// Mock card data for testing
const mockCard: ReadingCard = {
  id: 1,
  name: 'The Fool',
  arcana: 'major',
  number: 0,
  suit: null,
  orientation: 'upright',
  position: 1,
  positionName: 'Present',
  imageUrl: '/cards/the-fool.jpg',
};

describe('TarotCard', () => {
  describe('Rendering', () => {
    it('should render the card back when not revealed', () => {
      render(<TarotCard isRevealed={false} />);

      const cardBack = screen.getByTestId('card-back');
      expect(cardBack).toBeInTheDocument();
    });

    it('should render the card front when revealed with card data', () => {
      render(<TarotCard card={mockCard} isRevealed={true} />);

      expect(screen.getByText('The Fool')).toBeInTheDocument();
    });

    it('should not visually show card name when card is not revealed', () => {
      render(<TarotCard card={mockCard} isRevealed={false} />);

      // The card front exists in DOM but is hidden via backface-visibility
      // and the flip container is not rotated
      const flipContainer = screen.getByTestId('flip-container');
      expect(flipContainer).not.toHaveClass('rotate-y-180');
    });
  });

  describe('Sizes', () => {
    it('should render with small size when size="sm"', () => {
      render(<TarotCard isRevealed={false} size="sm" />);

      const cardContainer = screen.getByTestId('tarot-card');
      expect(cardContainer).toHaveClass('w-32', 'h-48');
    });

    it('should render with medium size by default', () => {
      render(<TarotCard isRevealed={false} />);

      const cardContainer = screen.getByTestId('tarot-card');
      expect(cardContainer).toHaveClass('w-40', 'h-60');
    });

    it('should render with medium size when size="md"', () => {
      render(<TarotCard isRevealed={false} size="md" />);

      const cardContainer = screen.getByTestId('tarot-card');
      expect(cardContainer).toHaveClass('w-40', 'h-60');
    });

    it('should render with large size when size="lg"', () => {
      render(<TarotCard isRevealed={false} size="lg" />);

      const cardContainer = screen.getByTestId('tarot-card');
      expect(cardContainer).toHaveClass('w-48', 'h-72');
    });
  });

  describe('Interaction', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<TarotCard isRevealed={false} onClick={handleClick} />);

      const cardContainer = screen.getByTestId('tarot-card');
      fireEvent.click(cardContainer);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not throw when clicked without onClick handler', () => {
      render(<TarotCard isRevealed={false} />);

      const cardContainer = screen.getByTestId('tarot-card');

      expect(() => fireEvent.click(cardContainer)).not.toThrow();
    });

    it('should have cursor-pointer class when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<TarotCard isRevealed={false} onClick={handleClick} />);

      const cardContainer = screen.getByTestId('tarot-card');
      expect(cardContainer).toHaveClass('cursor-pointer');
    });

    it('should not have cursor-pointer class when onClick is not provided', () => {
      render(<TarotCard isRevealed={false} />);

      const cardContainer = screen.getByTestId('tarot-card');
      expect(cardContainer).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Flip Animation', () => {
    it('should have the flip container with preserve-3d', () => {
      render(<TarotCard isRevealed={false} />);

      const flipContainer = screen.getByTestId('flip-container');
      expect(flipContainer).toHaveStyle({ transformStyle: 'preserve-3d' });
    });

    it('should rotate when revealed', () => {
      render(<TarotCard card={mockCard} isRevealed={true} />);

      const flipContainer = screen.getByTestId('flip-container');
      expect(flipContainer).toHaveClass('rotate-y-180');
    });

    it('should not rotate when not revealed', () => {
      render(<TarotCard isRevealed={false} />);

      const flipContainer = screen.getByTestId('flip-container');
      expect(flipContainer).not.toHaveClass('rotate-y-180');
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text when card is revealed', () => {
      render(<TarotCard card={mockCard} isRevealed={true} />);

      const cardImage = screen.getByRole('img', { name: /the fool/i });
      expect(cardImage).toBeInTheDocument();
    });

    it('should have role="button" when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<TarotCard isRevealed={false} onClick={handleClick} />);

      const cardContainer = screen.getByRole('button');
      expect(cardContainer).toBeInTheDocument();
    });

    it('should have aria-label describing the card state when not revealed', () => {
      render(<TarotCard isRevealed={false} />);

      const cardContainer = screen.getByTestId('tarot-card');
      expect(cardContainer).toHaveAttribute('aria-label', 'Carta de tarot boca abajo');
    });

    it('should have aria-label with card name when revealed', () => {
      render(<TarotCard card={mockCard} isRevealed={true} />);

      const cardContainer = screen.getByTestId('tarot-card');
      expect(cardContainer).toHaveAttribute('aria-label', 'Carta de tarot: The Fool');
    });
  });

  describe('Styling', () => {
    it('should have rounded-xl border radius', () => {
      render(<TarotCard isRevealed={false} />);

      const cardContainer = screen.getByTestId('tarot-card');
      expect(cardContainer).toHaveClass('rounded-xl');
    });

    it('should have shadow-lg', () => {
      render(<TarotCard isRevealed={false} />);

      const cardContainer = screen.getByTestId('tarot-card');
      expect(cardContainer).toHaveClass('shadow-lg');
    });
  });

  describe('Card Back Design', () => {
    it('should display geometric pattern on the back', () => {
      render(<TarotCard isRevealed={false} />);

      const cardBack = screen.getByTestId('card-back');
      expect(cardBack).toHaveClass('bg-secondary');
    });
  });

  describe('Reversed Cards', () => {
    it('should show reversed orientation indicator for reversed cards', () => {
      const reversedCard: ReadingCard = {
        ...mockCard,
        orientation: 'reversed',
      };

      render(<TarotCard card={reversedCard} isRevealed={true} />);

      const cardImage = screen.getByRole('img', { name: /the fool.*invertida/i });
      expect(cardImage).toHaveClass('rotate-180');
    });

    it('should not rotate upright cards', () => {
      render(<TarotCard card={mockCard} isRevealed={true} />);

      const cardImage = screen.getByRole('img', { name: /the fool/i });
      expect(cardImage).not.toHaveClass('rotate-180');
    });

    it('should include reversed indicator in alt text for reversed cards', () => {
      const reversedCard: ReadingCard = {
        ...mockCard,
        orientation: 'reversed',
      };

      render(<TarotCard card={reversedCard} isRevealed={true} />);

      const cardImage = screen.getByRole('img', { name: /the fool.*invertida/i });
      expect(cardImage).toBeInTheDocument();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should call onClick when Enter key is pressed', () => {
      const handleClick = vi.fn();
      render(<TarotCard isRevealed={false} onClick={handleClick} />);

      const cardContainer = screen.getByTestId('tarot-card');
      fireEvent.keyDown(cardContainer, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Space key is pressed', () => {
      const handleClick = vi.fn();
      render(<TarotCard isRevealed={false} onClick={handleClick} />);

      const cardContainer = screen.getByTestId('tarot-card');
      fireEvent.keyDown(cardContainer, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick for other keys', () => {
      const handleClick = vi.fn();
      render(<TarotCard isRevealed={false} onClick={handleClick} />);

      const cardContainer = screen.getByTestId('tarot-card');
      fireEvent.keyDown(cardContainer, { key: 'Tab' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have tabIndex when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<TarotCard isRevealed={false} onClick={handleClick} />);

      const cardContainer = screen.getByTestId('tarot-card');
      expect(cardContainer).toHaveAttribute('tabIndex', '0');
    });

    it('should not have tabIndex when onClick is not provided', () => {
      render(<TarotCard isRevealed={false} />);

      const cardContainer = screen.getByTestId('tarot-card');
      expect(cardContainer).not.toHaveAttribute('tabIndex');
    });
  });

  describe('Placeholder Image', () => {
    it('should show placeholder when card has no imageUrl', () => {
      const cardWithoutImage: ReadingCard = {
        ...mockCard,
        imageUrl: undefined,
      };

      render(<TarotCard card={cardWithoutImage} isRevealed={true} />);

      // Check for placeholder emoji
      expect(screen.getByText('🃏')).toBeInTheDocument();
    });

    it('should show card name in placeholder when card is provided', () => {
      const cardWithoutImage: ReadingCard = {
        ...mockCard,
        imageUrl: undefined,
      };

      render(<TarotCard card={cardWithoutImage} isRevealed={true} />);

      // The name should appear in the placeholder
      const placeholder = screen.getByRole('img', { name: mockCard.name });
      expect(placeholder).toBeInTheDocument();
    });

    it('should rotate placeholder for reversed cards', () => {
      const reversedCardWithoutImage: ReadingCard = {
        ...mockCard,
        imageUrl: undefined,
        orientation: 'reversed',
      };

      render(<TarotCard card={reversedCardWithoutImage} isRevealed={true} />);

      const placeholder = screen.getByRole('img', { name: mockCard.name });
      expect(placeholder).toHaveClass('rotate-180');
    });
  });

  describe('Custom className', () => {
    it('should accept and apply custom className', () => {
      render(<TarotCard isRevealed={false} className="custom-class" />);

      const cardContainer = screen.getByTestId('tarot-card');
      expect(cardContainer).toHaveClass('custom-class');
    });
  });
});
