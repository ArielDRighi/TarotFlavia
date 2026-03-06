import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CardListItem } from './CardListItem';
import { ArcanaType, Suit } from '@/types/encyclopedia.types';
import type { CardSummary } from '@/types/encyclopedia.types';

function createTestCard(overrides?: Partial<CardSummary>): CardSummary {
  return {
    id: 1,
    slug: 'the-fool',
    nameEs: 'El Loco',
    arcanaType: ArcanaType.MAJOR,
    number: 0,
    suit: null,
    thumbnailUrl: '/cards/the-fool.jpg',
    ...overrides,
  };
}

describe('CardListItem', () => {
  describe('Rendering', () => {
    it('should render card name', () => {
      render(<CardListItem card={createTestCard()} />);

      expect(screen.getByText('El Loco')).toBeInTheDocument();
    });

    it('should render link to card detail page', () => {
      render(<CardListItem card={createTestCard({ slug: 'the-fool' })} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/enciclopedia/the-fool');
    });

    it('should have data-testid attribute', () => {
      render(<CardListItem card={createTestCard({ slug: 'the-fool' })} />);

      expect(screen.getByTestId('card-list-item-the-fool')).toBeInTheDocument();
    });

    it('should render card thumbnail image', () => {
      render(<CardListItem card={createTestCard({ nameEs: 'El Loco' })} />);

      expect(screen.getByAltText('El Loco')).toBeInTheDocument();
    });
  });

  describe('Arcana type display', () => {
    it('should display Arcanos Mayores for major arcana', () => {
      render(<CardListItem card={createTestCard({ arcanaType: ArcanaType.MAJOR })} />);

      expect(screen.getByText('Arcanos Mayores')).toBeInTheDocument();
    });

    it('should display suit name for minor arcana', () => {
      render(
        <CardListItem
          card={createTestCard({
            arcanaType: ArcanaType.MINOR,
            suit: Suit.CUPS,
            nameEs: 'As de Copas',
          })}
        />
      );

      expect(screen.getByText('Copas')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className when provided', () => {
      render(<CardListItem card={createTestCard()} className="custom-class" />);

      const item = screen.getByTestId('card-list-item-the-fool');
      expect(item).toHaveClass('custom-class');
    });
  });
});
