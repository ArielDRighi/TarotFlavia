import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { CardDetailView } from './CardDetailView';
import {
  CARD_COMBINATIONS_SECTION,
  CARD_TEXT_SECTIONS,
  MIN_CARD_DETAIL_WORDS,
} from '@/lib/constants/card-content-sections.data';
import { countWords } from '@/lib/utils/text';
import { createMockCardDetail, MOCK_COMBINATION_CARD_NAMES } from '@/test/factories';
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
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// Mock next/link
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

    it('should render card name in Spanish as heading', () => {
      render(<CardDetailView card={createTestCard()} />);

      expect(screen.getByRole('heading', { level: 1, name: 'El Loco' })).toBeInTheDocument();
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

  describe('Breadcrumb navigation', () => {
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

  /**
   * T-SEO-011: desde T-SEO-009 las 78 fichas promedian 676 palabras de texto de
   * autor, así que son contenido editorial y llevan firma — no son datos de
   * referencia como las fichas de signos o planetas.
   */
  describe('Author byline (T-SEO-011)', () => {
    it('firma la ficha y enlaza a /sobre-nosotros', () => {
      render(<CardDetailView card={createTestCard()} />);

      const byline = screen.getByTestId('author-byline');

      expect(byline).toBeInTheDocument();
      expect(byline).toHaveTextContent(/equipo editorial de auguria/i);
      expect(within(byline).getByRole('link')).toHaveAttribute('href', '/sobre-nosotros');
    });
  });
});

/**
 * T-SEO-010: hasta esta tarea la ficha servía `H1 → H3 Información → H3 Palabras
 * Clave` y 166 palabras. Las siete secciones que cargó T-SEO-009 no aparecían en
 * el HTML porque nadie las renderizaba.
 */
describe('CardDetailView · secciones extendidas (T-SEO-010)', () => {
  it('renderiza las seis secciones de texto con su h2', () => {
    render(<CardDetailView card={createMockCardDetail()} />);

    CARD_TEXT_SECTIONS.forEach((section) => {
      expect(screen.getByRole('heading', { level: 2, name: section.heading })).toBeInTheDocument();
    });
  });

  it('renderiza el cuerpo de cada sección', () => {
    const card = createMockCardDetail();
    render(<CardDetailView card={card} />);

    CARD_TEXT_SECTIONS.forEach((section) => {
      const texto = card[section.key];
      expect(texto).toBeDefined();
      expect(screen.getByTestId(section.testId)).toHaveTextContent(String(texto));
    });
  });

  it('renderiza las combinaciones como enlaces internos a otras fichas', () => {
    render(
      <CardDetailView
        card={createMockCardDetail()}
        combinationCardNames={MOCK_COMBINATION_CARD_NAMES}
      />
    );

    const seccion = screen.getByTestId(CARD_COMBINATIONS_SECTION.testId);
    const enlaces = within(seccion).getAllByRole('link');

    expect(enlaces).toHaveLength(4);
    expect(enlaces[0]).toHaveAttribute('href', '/enciclopedia/tarot/seven-of-swords');
    expect(enlaces[0]).toHaveTextContent('Siete de Espadas');
  });

  describe('degradación por sección', () => {
    it('una ficha sin contenido extendido no deja encabezados vacíos', () => {
      render(<CardDetailView card={createTestCard()} />);

      CARD_TEXT_SECTIONS.forEach((section) => {
        expect(screen.queryByTestId(section.testId)).not.toBeInTheDocument();
        expect(
          screen.queryByRole('heading', { level: 2, name: section.heading })
        ).not.toBeInTheDocument();
      });
      expect(screen.queryByTestId(CARD_COMBINATIONS_SECTION.testId)).not.toBeInTheDocument();
    });

    it('renderiza las secciones que sí llegaron y omite el resto', () => {
      render(<CardDetailView card={createTestCard({ advice: 'Confía en el primer paso.' })} />);

      expect(screen.getByTestId('card-section-advice')).toHaveTextContent(
        'Confía en el primer paso.'
      );
      expect(screen.queryByTestId('card-section-love')).not.toBeInTheDocument();
    });

    it('omite la sección cuando la API mandó un string en blanco', () => {
      render(<CardDetailView card={createTestCard({ symbolism: '   ' })} />);

      expect(screen.queryByTestId('card-section-symbolism')).not.toBeInTheDocument();
    });
  });

  describe('jerarquía de encabezados', () => {
    it('va de h1 a h2 sin saltos', () => {
      const { container } = render(
        <CardDetailView
          card={createMockCardDetail()}
          combinationCardNames={MOCK_COMBINATION_CARD_NAMES}
        />
      );

      const niveles = [...container.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((heading) =>
        Number(heading.tagName[1])
      );

      expect(niveles[0]).toBe(1);
      niveles.slice(1).forEach((nivel, i) => {
        expect(nivel).toBeLessThanOrEqual(niveles[i] + 1);
      });
    });

    it('tiene un único h1', () => {
      const { container } = render(<CardDetailView card={createMockCardDetail()} />);

      expect(container.querySelectorAll('h1')).toHaveLength(1);
    });
  });

  /**
   * Guardarraíl de largo. `five-of-swords` es la ficha más corta de las 78 (579
   * palabras propias): si el render deja de sacar una sección a la página, es la
   * primera que cae por debajo del piso de AdSense.
   */
  describe('guardarraíl de largo', () => {
    it(`la ficha más corta del corpus renderiza más de ${MIN_CARD_DETAIL_WORDS} palabras`, () => {
      const { container } = render(
        <CardDetailView
          card={createMockCardDetail()}
          combinationCardNames={MOCK_COMBINATION_CARD_NAMES}
        />
      );

      expect(countWords([container.textContent ?? ''])).toBeGreaterThanOrEqual(
        MIN_CARD_DETAIL_WORDS
      );
    });

    it('sin las secciones nuevas la misma ficha no llega al piso', () => {
      const { container } = render(
        <CardDetailView
          card={createMockCardDetail({
            meaningLove: undefined,
            meaningWork: undefined,
            meaningWellbeing: undefined,
            symbolism: undefined,
            advice: undefined,
            yesNo: undefined,
            combinations: undefined,
          })}
        />
      );

      expect(countWords([container.textContent ?? ''])).toBeLessThan(MIN_CARD_DETAIL_WORDS);
    });
  });
});
