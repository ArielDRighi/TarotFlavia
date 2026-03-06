import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CardThumbnail } from './CardThumbnail';
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

describe('CardThumbnail', () => {
  describe('Rendering', () => {
    it('should render card name', () => {
      render(<CardThumbnail card={createTestCard()} />);

      expect(screen.getByText('El Loco')).toBeInTheDocument();
    });

    it('should render card image', () => {
      render(<CardThumbnail card={createTestCard()} />);

      const img = screen.getByAltText('El Loco');
      expect(img).toBeInTheDocument();
    });

    it('should render link to card detail page', () => {
      render(<CardThumbnail card={createTestCard({ slug: 'the-fool' })} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/enciclopedia/the-fool');
    });

    it('should have data-testid attribute', () => {
      render(<CardThumbnail card={createTestCard({ slug: 'the-fool' })} />);

      expect(screen.getByTestId('card-thumbnail-the-fool')).toBeInTheDocument();
    });
  });

  describe('Major Arcana badge', () => {
    it('should show Arcanos Mayores badge for major arcana cards', () => {
      render(<CardThumbnail card={createTestCard({ arcanaType: ArcanaType.MAJOR })} />);

      expect(screen.getByText('Arcanos Mayores')).toBeInTheDocument();
    });

    it('should not show Arcanos Mayores badge for minor arcana cards', () => {
      render(
        <CardThumbnail card={createTestCard({ arcanaType: ArcanaType.MINOR, suit: Suit.WANDS })} />
      );

      expect(screen.queryByText('Arcanos Mayores')).not.toBeInTheDocument();
    });

    it('should show suit name badge for minor arcana cards', () => {
      render(
        <CardThumbnail
          card={createTestCard({
            arcanaType: ArcanaType.MINOR,
            suit: Suit.CUPS,
            nameEs: 'As de Copas',
          })}
        />
      );

      expect(screen.getByText('Copas')).toBeInTheDocument();
    });

    it('should show Bastos badge for wands suit', () => {
      render(
        <CardThumbnail
          card={createTestCard({
            arcanaType: ArcanaType.MINOR,
            suit: Suit.WANDS,
            nameEs: 'As de Bastos',
          })}
        />
      );

      expect(screen.getByText('Bastos')).toBeInTheDocument();
    });

    it('should show Espadas badge for swords suit', () => {
      render(
        <CardThumbnail
          card={createTestCard({
            arcanaType: ArcanaType.MINOR,
            suit: Suit.SWORDS,
            nameEs: 'As de Espadas',
          })}
        />
      );

      expect(screen.getByText('Espadas')).toBeInTheDocument();
    });

    it('should show Oros badge for pentacles suit', () => {
      render(
        <CardThumbnail
          card={createTestCard({
            arcanaType: ArcanaType.MINOR,
            suit: Suit.PENTACLES,
            nameEs: 'As de Oros',
          })}
        />
      );

      expect(screen.getByText('Oros')).toBeInTheDocument();
    });
  });

  describe('Hover effects', () => {
    it('should have group class for hover effects', () => {
      const { container } = render(<CardThumbnail card={createTestCard()} />);

      const link = container.querySelector('a');
      expect(link).toHaveClass('group');
    });
  });

  describe('Styling', () => {
    it('should apply custom className when provided', () => {
      render(<CardThumbnail card={createTestCard()} className="custom-class" />);

      const thumbnail = screen.getByTestId('card-thumbnail-the-fool');
      expect(thumbnail).toHaveClass('custom-class');
    });
  });
});
