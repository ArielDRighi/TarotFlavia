import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CardDetailView } from './CardDetailView';
import { ArcanaType, Element } from '@/types/encyclopedia.types';
import type { CardDetail } from '@/types/encyclopedia.types';

// Mock sub-components that rely on hooks
vi.mock('./CardNavigation', () => ({
  CardNavigation: ({ slug }: { slug: string }) => (
    <div data-testid="card-navigation-mock" data-slug={slug} />
  ),
}));

vi.mock('./RelatedCards', () => ({
  RelatedCards: ({ slug }: { slug: string }) => (
    <div data-testid="related-cards-mock" data-slug={slug} />
  ),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
     
    <img src={src} alt={alt} />
  ),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

function createTestCard(overrides?: Partial<CardDetail>): CardDetail {
  return {
    id: 0,
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
    meaningUpright: 'Nuevos comienzos, aventura y libertad.',
    meaningReversed: 'Imprudencia, ingenuidad excesiva.',
    description: 'Un joven al borde del precipicio.',
    keywords: {
      upright: ['Libertad', 'Inocencia'],
      reversed: ['Imprudencia', 'Riesgo'],
    },
    imageUrl: '/images/tarot/fool.jpg',
    thumbnailUrl: '/images/tarot/fool-thumb.jpg',
    relatedCards: null,
    ...overrides,
  };
}

describe('CardDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render component with data-testid', () => {
      render(<CardDetailView card={createTestCard()} />);

      expect(screen.getByTestId('card-detail-view')).toBeInTheDocument();
    });

    it('should render card name in Spanish', () => {
      render(<CardDetailView card={createTestCard()} />);

      expect(screen.getByText('El Loco')).toBeInTheDocument();
    });

    it('should render card name in English', () => {
      render(<CardDetailView card={createTestCard()} />);

      expect(screen.getByText('The Fool')).toBeInTheDocument();
    });

    it('should render card description when present', () => {
      render(
        <CardDetailView
          card={createTestCard({ description: 'Un joven al borde del precipicio.' })}
        />
      );

      expect(screen.getByText('Un joven al borde del precipicio.')).toBeInTheDocument();
    });

    it('should not render description when null', () => {
      render(<CardDetailView card={createTestCard({ description: null })} />);

      expect(screen.queryByTestId('card-detail-description')).not.toBeInTheDocument();
    });
  });

  describe('Back link', () => {
    it('should render a link back to /enciclopedia', () => {
      render(<CardDetailView card={createTestCard()} />);

      const link = screen.getByRole('link', { name: /enciclopedia/i });
      expect(link).toHaveAttribute('href', '/enciclopedia');
    });
  });

  describe('Sub-components', () => {
    it('should render CardNavigation with correct slug', () => {
      render(<CardDetailView card={createTestCard()} />);

      const nav = screen.getByTestId('card-navigation-mock');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('data-slug', 'the-fool');
    });

    it('should render RelatedCards with correct slug', () => {
      render(<CardDetailView card={createTestCard()} />);

      const related = screen.getByTestId('related-cards-mock');
      expect(related).toBeInTheDocument();
      expect(related).toHaveAttribute('data-slug', 'the-fool');
    });
  });
});
