import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CardMetadata } from './CardMetadata';
import {
  ArcanaType,
  Suit,
  CourtRank,
  Element,
  Planet,
  ZodiacAssociation,
} from '@/types/encyclopedia.types';
import type { CardDetail } from '@/types/encyclopedia.types';

function createTestCard(overrides?: Partial<CardDetail>): CardDetail {
  return {
    id: 1,
    slug: 'the-fool',
    nameEs: 'El Loco',
    nameEn: 'The Fool',
    arcanaType: ArcanaType.MAJOR,
    number: 0,
    romanNumeral: '0',
    suit: null,
    courtRank: null,
    element: Element.AIR,
    planet: null,
    zodiacSign: null,
    meaningUpright: 'Nuevos comienzos',
    meaningReversed: 'Imprudencia',
    description: 'Un joven al borde del precipicio',
    keywords: { upright: ['Libertad'], reversed: ['Imprudencia'] },
    imageUrl: '/images/tarot/fool.jpg',
    relatedCards: null,
    thumbnailUrl: '/images/tarot/fool-thumb.jpg',
    ...overrides,
  };
}

describe('CardMetadata', () => {
  describe('Rendering', () => {
    it('should render component with data-testid', () => {
      render(<CardMetadata card={createTestCard()} />);

      expect(screen.getByTestId('card-metadata')).toBeInTheDocument();
    });

    it('should render "Información" heading', () => {
      render(<CardMetadata card={createTestCard()} />);

      expect(screen.getByText('Información')).toBeInTheDocument();
    });
  });

  describe('Arcana type', () => {
    it('should display "Mayor" for major arcana', () => {
      render(<CardMetadata card={createTestCard({ arcanaType: ArcanaType.MAJOR })} />);

      expect(screen.getByText('Mayor')).toBeInTheDocument();
    });

    it('should display "Menor" for minor arcana', () => {
      render(
        <CardMetadata card={createTestCard({ arcanaType: ArcanaType.MINOR, suit: Suit.CUPS })} />
      );

      expect(screen.getByText('Menor')).toBeInTheDocument();
    });
  });

  describe('Roman numeral', () => {
    it('should display roman numeral when present', () => {
      render(<CardMetadata card={createTestCard({ romanNumeral: 'III' })} />);

      expect(screen.getByText('III')).toBeInTheDocument();
    });

    it('should not display numeral row when romanNumeral is null', () => {
      render(<CardMetadata card={createTestCard({ romanNumeral: null })} />);

      // Only "Mayor" should appear in dd, not a numeral
      expect(screen.queryByText('Número')).not.toBeInTheDocument();
    });
  });

  describe('Suit', () => {
    it('should display suit name for minor arcana', () => {
      render(
        <CardMetadata card={createTestCard({ arcanaType: ArcanaType.MINOR, suit: Suit.CUPS })} />
      );

      expect(screen.getByText(/Copas/)).toBeInTheDocument();
    });

    it('should not display suit row for major arcana', () => {
      render(<CardMetadata card={createTestCard({ suit: null })} />);

      expect(screen.queryByText('Palo')).not.toBeInTheDocument();
    });
  });

  describe('Court rank', () => {
    it('should display court rank name when present', () => {
      render(
        <CardMetadata
          card={createTestCard({
            arcanaType: ArcanaType.MINOR,
            suit: Suit.CUPS,
            courtRank: CourtRank.QUEEN,
          })}
        />
      );

      expect(screen.getByText('Reina')).toBeInTheDocument();
    });

    it('should not display rank row when courtRank is null', () => {
      render(<CardMetadata card={createTestCard({ courtRank: null })} />);

      expect(screen.queryByText('Rango')).not.toBeInTheDocument();
    });
  });

  describe('Element', () => {
    it('should display element name when present', () => {
      render(<CardMetadata card={createTestCard({ element: Element.FIRE })} />);

      expect(screen.getByText('Fuego')).toBeInTheDocument();
    });

    it('should not display element row when element is null', () => {
      render(<CardMetadata card={createTestCard({ element: null })} />);

      expect(screen.queryByText('Elemento')).not.toBeInTheDocument();
    });
  });

  describe('Planet', () => {
    it('should display planet name when present', () => {
      render(<CardMetadata card={createTestCard({ planet: Planet.MERCURY })} />);

      expect(screen.getByText('Mercurio')).toBeInTheDocument();
    });

    it('should not display planet row when planet is null', () => {
      render(<CardMetadata card={createTestCard({ planet: null })} />);

      expect(screen.queryByText('Planeta')).not.toBeInTheDocument();
    });
  });

  describe('Zodiac sign', () => {
    it('should display zodiac sign name when present', () => {
      render(<CardMetadata card={createTestCard({ zodiacSign: ZodiacAssociation.AQUARIUS })} />);

      expect(screen.getByText('Acuario')).toBeInTheDocument();
    });

    it('should not display zodiac sign row when zodiacSign is null', () => {
      render(<CardMetadata card={createTestCard({ zodiacSign: null })} />);

      expect(screen.queryByText('Signo Zodiacal')).not.toBeInTheDocument();
    });
  });
});
