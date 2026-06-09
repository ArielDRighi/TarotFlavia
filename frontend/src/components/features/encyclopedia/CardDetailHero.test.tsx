import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CardDetailHero } from './CardDetailHero';
import { ArcanaType, Suit, Element } from '@/types/encyclopedia.types';
import type { CardDetail } from '@/types/encyclopedia.types';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function makeCard(overrides?: Partial<CardDetail>): CardDetail {
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
    meaningUpright: 'Nuevos comienzos.',
    meaningReversed: 'Imprudencia.',
    description: 'Un joven al borde del precipicio.',
    keywords: { upright: ['Libertad'], reversed: ['Riesgo'] },
    imageUrl: '/images/tarot/the-fool.webp',
    thumbnailUrl: '/images/tarot/the-fool.webp',
    relatedCards: null,
    ...overrides,
  };
}

describe('CardDetailHero', () => {
  describe('estructura', () => {
    it('renderiza con data-testid="card-detail-hero"', () => {
      render(<CardDetailHero card={makeCard()} />);
      expect(screen.getByTestId('card-detail-hero')).toBeInTheDocument();
    });

    it('renderiza el nombre de la carta en h1', () => {
      render(<CardDetailHero card={makeCard()} />);
      expect(screen.getByRole('heading', { level: 1, name: 'El Loco' })).toBeInTheDocument();
    });
  });

  describe('imagen de la carta', () => {
    it('renderiza la imagen con el src correcto', () => {
      render(<CardDetailHero card={makeCard()} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/images/tarot/the-fool.webp');
    });

    it('el alt de la imagen es el nombre en español', () => {
      render(<CardDetailHero card={makeCard()} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'El Loco');
    });
  });

  describe('breadcrumb', () => {
    it('renderiza enlace a /enciclopedia', () => {
      render(<CardDetailHero card={makeCard()} />);
      const link = screen.getByTestId('breadcrumb-enciclopedia');
      expect(link).toHaveAttribute('href', '/enciclopedia');
    });

    it('renderiza enlace a /enciclopedia/tarot', () => {
      render(<CardDetailHero card={makeCard()} />);
      const link = screen.getByTestId('breadcrumb-tarot');
      expect(link).toHaveAttribute('href', '/enciclopedia/tarot');
    });

    it('renderiza el nombre de la carta como página actual', () => {
      render(<CardDetailHero card={makeCard()} />);
      const current = screen.getByTestId('breadcrumb-current');
      expect(current).toHaveTextContent('El Loco');
    });
  });

  describe('chip de arcano', () => {
    it('muestra "Arcano Mayor" para arcanos mayores', () => {
      render(<CardDetailHero card={makeCard({ arcanaType: ArcanaType.MAJOR })} />);
      expect(screen.getByTestId('card-arcana-chip')).toHaveTextContent('Arcano Mayor');
    });

    it('muestra "Arcano Menor · Bastos" para arcanos menores de bastos', () => {
      render(
        <CardDetailHero
          card={makeCard({ arcanaType: ArcanaType.MINOR, suit: Suit.WANDS, number: 1 })}
        />
      );
      expect(screen.getByTestId('card-arcana-chip')).toHaveTextContent('Arcano Menor · Bastos');
    });

    it('muestra "Arcano Menor · Copas" para arcanos menores de copas', () => {
      render(
        <CardDetailHero
          card={makeCard({ arcanaType: ArcanaType.MINOR, suit: Suit.CUPS, number: 2 })}
        />
      );
      expect(screen.getByTestId('card-arcana-chip')).toHaveTextContent('Arcano Menor · Copas');
    });

    it('muestra "Arcano Menor · Espadas" para arcanos menores de espadas', () => {
      render(
        <CardDetailHero
          card={makeCard({ arcanaType: ArcanaType.MINOR, suit: Suit.SWORDS, number: 3 })}
        />
      );
      expect(screen.getByTestId('card-arcana-chip')).toHaveTextContent('Arcano Menor · Espadas');
    });

    it('muestra "Arcano Menor · Oros" para arcanos menores de oros', () => {
      render(
        <CardDetailHero
          card={makeCard({ arcanaType: ArcanaType.MINOR, suit: Suit.PENTACLES, number: 5 })}
        />
      );
      expect(screen.getByTestId('card-arcana-chip')).toHaveTextContent('Arcano Menor · Oros');
    });

    it('muestra "Arcano Menor" sin palo cuando suit es null (caso defensivo)', () => {
      render(
        <CardDetailHero
          card={makeCard({ arcanaType: ArcanaType.MINOR, suit: null, number: 1 })}
        />
      );
      expect(screen.getByTestId('card-arcana-chip')).toHaveTextContent('Arcano Menor');
    });
  });
});
