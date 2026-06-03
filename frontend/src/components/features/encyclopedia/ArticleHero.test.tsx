import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ArticleHero } from './ArticleHero';

// Mock next/image (render a plain img so we can assert src/alt)
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    'data-testid': dataTestId,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    'data-testid'?: string;
  } & Record<string, unknown>) => (
    <a href={href} data-testid={dataTestId} {...rest}>
      {children}
    </a>
  ),
}));

describe('ArticleHero', () => {
  it('should render with data-testid', () => {
    render(<ArticleHero category="Guía del Tarot" title="Guía del Tarot" />);

    expect(screen.getByTestId('article-hero')).toBeInTheDocument();
  });

  it('should render the title as the page h1', () => {
    render(<ArticleHero category="Guía del Tarot" title="Guía del Tarot" />);

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Guía del Tarot');
  });

  it('should render the category label', () => {
    render(<ArticleHero category="Guía del Tarot" title="El Espejo del Alma" />);

    expect(screen.getByTestId('article-category-badge')).toHaveTextContent('Guía del Tarot');
  });

  it('should render the lead when provided', () => {
    render(
      <ArticleHero category="Guía del Tarot" title="Tarot" lead="Descubre el antiguo arte." />
    );

    expect(screen.getByText('Descubre el antiguo arte.')).toBeInTheDocument();
  });

  it('should not render a lead paragraph when no lead is provided', () => {
    render(<ArticleHero category="Guía del Tarot" title="Tarot" />);

    expect(screen.queryByTestId('article-hero-lead')).not.toBeInTheDocument();
  });

  it('should render a breadcrumb linking to the encyclopedia and showing the current title', () => {
    render(<ArticleHero category="Guía del Tarot" title="Guía del Tarot" />);

    const link = screen.getByTestId('breadcrumb-enciclopedia');
    expect(link).toHaveAttribute('href', '/enciclopedia');
    expect(screen.getByTestId('breadcrumb-current')).toHaveTextContent('Guía del Tarot');
  });

  it('should render the hero image with its alt when an image is provided', () => {
    render(
      <ArticleHero
        category="Guía del Tarot"
        title="Tarot"
        image={{ src: '/images/enciclopedia/guia-tarot-hero.webp', alt: 'Tres cartas de Tarot' }}
      />
    );

    const img = screen.getByTestId('next-image');
    expect(img).toHaveAttribute('src', '/images/enciclopedia/guia-tarot-hero.webp');
    expect(img).toHaveAttribute('alt', 'Tres cartas de Tarot');
  });

  it('should fall back to the gradient band (no image) when no image is provided', () => {
    render(<ArticleHero category="Guía del Tarot" title="Tarot" />);

    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
    // The hero still renders (fallback band)
    expect(screen.getByTestId('article-hero')).toBeInTheDocument();
  });

  it('should render reading time and section count when provided', () => {
    render(
      <ArticleHero
        category="Guía del Tarot"
        title="Tarot"
        readingTimeMinutes={8}
        sectionCount={5}
      />
    );

    const meta = screen.getByTestId('article-hero-meta');
    expect(meta).toHaveTextContent('8 min de lectura');
    expect(meta).toHaveTextContent('5 secciones');
  });

  it('should use the singular "sección" for a single section', () => {
    render(
      <ArticleHero
        category="Guía del Tarot"
        title="Tarot"
        readingTimeMinutes={1}
        sectionCount={1}
      />
    );

    expect(screen.getByTestId('article-hero-meta')).toHaveTextContent('1 sección');
  });

  it('should not render the meta row when no meta is provided', () => {
    render(<ArticleHero category="Guía del Tarot" title="Tarot" />);

    expect(screen.queryByTestId('article-hero-meta')).not.toBeInTheDocument();
  });

  it('should apply additional className', () => {
    render(<ArticleHero category="Guía del Tarot" title="Tarot" className="extra-test-class" />);

    expect(screen.getByTestId('article-hero')).toHaveClass('extra-test-class');
  });

  // Accesibilidad (T-ENC-009)
  describe('Accesibilidad', () => {
    it('should use dark night text on the gold category chip for AA contrast', () => {
      render(<ArticleHero category="Guía del Tarot" title="Tarot" />);

      const chip = screen.getByTestId('article-category-badge');
      // Texto blanco sobre dorado (#d69e2e) ≈ 2.4:1 (falla AA); el texto noche
      // profunda (token --color-bg-hero = #1a0a2e) ≈ 7:1 (cumple AA).
      expect(chip).toHaveClass('text-bg-hero');
      expect(chip).not.toHaveClass('text-secondary-foreground');
    });

    it('should give the breadcrumb link a visible keyboard focus ring', () => {
      render(<ArticleHero category="Guía del Tarot" title="Tarot" />);

      const link = screen.getByTestId('breadcrumb-enciclopedia');
      expect(link.className).toMatch(/focus-visible:ring/);
    });
  });
});
