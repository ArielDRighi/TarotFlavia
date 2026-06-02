import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { MarkdownArticle } from './MarkdownArticle';

// NOTE: react-markdown is intentionally NOT mocked here. The whole point of this
// component is the node-to-element mapping, so we render real Markdown and assert
// on the produced DOM (roles + brand classes).

// next/image is mocked so editorial section images render as a plain <img> we
// can assert on (src/alt) without Next's runtime in jsdom.
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}));

describe('MarkdownArticle', () => {
  describe('Rendering', () => {
    it('should render wrapper with data-testid', () => {
      render(<MarkdownArticle content="Texto simple." />);

      expect(screen.getByTestId('markdown-article')).toBeInTheDocument();
    });

    it('should constrain the reading measure (max-w-[68ch]) on the wrapper', () => {
      render(<MarkdownArticle content="Texto simple." />);

      expect(screen.getByTestId('markdown-article')).toHaveClass('max-w-[68ch]');
    });

    it('should apply additional className to the wrapper', () => {
      render(<MarkdownArticle content="Texto." className="custom-class" />);

      expect(screen.getByTestId('markdown-article')).toHaveClass('custom-class');
    });
  });

  describe('Visual hierarchy (headings vs body)', () => {
    it('should render an h1 with serif display styles', () => {
      render(<MarkdownArticle content="# Título Principal" />);

      const h1 = screen.getByRole('heading', { level: 1, name: 'Título Principal' });
      expect(h1).toHaveClass('font-serif');
      expect(h1.className).toMatch(/text-(4xl|5xl)/);
      expect(h1.className).toMatch(/font-(bold|semibold)/);
    });

    it('should render an h2 with serif styles smaller than h1', () => {
      render(<MarkdownArticle content="## Sección" />);

      const h2 = screen.getByRole('heading', { level: 2, name: 'Sección' });
      expect(h2).toHaveClass('font-serif');
      expect(h2.className).toMatch(/text-3xl/);
    });

    it('should render an h3 with serif styles', () => {
      render(<MarkdownArticle content="### Subsección" />);

      const h3 = screen.getByRole('heading', { level: 3, name: 'Subsección' });
      expect(h3).toHaveClass('font-serif');
      expect(h3.className).toMatch(/text-2xl/);
    });

    it('should render paragraphs in the readable body style (text-lg, relaxed leading)', () => {
      render(<MarkdownArticle content="Un párrafo de cuerpo." />);

      const paragraph = screen.getByText('Un párrafo de cuerpo.');
      expect(paragraph.tagName).toBe('P');
      expect(paragraph).toHaveClass('text-lg');
      expect(paragraph).toHaveClass('leading-relaxed');
    });

    it('should differentiate heading size from body size', () => {
      render(<MarkdownArticle content={'# Encabezado\n\nCuerpo del texto.'} />);

      const heading = screen.getByRole('heading', { level: 1 });
      const body = screen.getByText('Cuerpo del texto.');

      // Hierarchy must be visually distinct: heading is not the body size.
      expect(heading.className).not.toMatch(/\btext-lg\b/);
      expect(body.className).not.toMatch(/text-4xl|text-5xl/);
    });
  });

  describe('Inline elements', () => {
    it('should render links with the brand lila color and a valid href', () => {
      render(<MarkdownArticle content="[Auguria](https://example.com)" />);

      const link = screen.getByRole('link', { name: 'Auguria' });
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveClass('text-primary');
    });

    it('should render strong text in bold', () => {
      render(<MarkdownArticle content="Texto con **énfasis fuerte**." />);

      const strong = screen.getByText('énfasis fuerte');
      expect(strong.tagName).toBe('STRONG');
      expect(strong.className).toMatch(/font-(bold|semibold)/);
    });

    it('should render emphasis in italic', () => {
      render(<MarkdownArticle content="Texto con *matiz*." />);

      const em = screen.getByText('matiz');
      expect(em.tagName).toBe('EM');
      expect(em).toHaveClass('italic');
    });

    it('should render inline code with the lila accent', () => {
      render(<MarkdownArticle content="Usa `font-serif` aquí." />);

      const code = screen.getByText('font-serif');
      expect(code.tagName).toBe('CODE');
      expect(code).toHaveClass('text-primary');
    });
  });

  describe('Lists', () => {
    it('should render unordered list items with gold markers', () => {
      render(<MarkdownArticle content={'- Primero\n- Segundo'} />);

      const list = screen.getByRole('list');
      expect(list.tagName).toBe('UL');
      expect(list.className).toMatch(/marker:text-secondary/);
      expect(screen.getByText('Primero')).toBeInTheDocument();
      expect(screen.getByText('Segundo')).toBeInTheDocument();
    });

    it('should render ordered lists as decimal lists', () => {
      render(<MarkdownArticle content={'1. Uno\n2. Dos'} />);

      const list = screen.getByRole('list');
      expect(list.tagName).toBe('OL');
      expect(list).toHaveClass('list-decimal');
    });
  });

  describe('Block elements (GFM)', () => {
    it('should render blockquotes with a gold accent border', () => {
      render(<MarkdownArticle content="> Una cita inspiradora." />);

      const quote = screen.getByText('Una cita inspiradora.').closest('blockquote');
      expect(quote).not.toBeNull();
      expect(quote?.className).toMatch(/border-secondary/);
    });

    it('should render GFM tables', () => {
      const md = ['| Carta | Significado |', '| --- | --- |', '| El Mago | Acción |'].join('\n');
      render(<MarkdownArticle content={md} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Carta' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'El Mago' })).toBeInTheDocument();
    });

    it('should render a decorative separator for thematic breaks', () => {
      render(<MarkdownArticle content={'Antes\n\n---\n\nDespués'} />);

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  describe('Editorial mode', () => {
    it('should render a numbered gold badge on "## N. …" headings', () => {
      render(<MarkdownArticle content="## 1. ¿Qué es el Tarot?" editorial />);

      const badge = screen.getByTestId('section-number');
      expect(badge).toHaveTextContent('1');
      // The heading's accessible name stays clean (badge is aria-hidden).
      expect(
        screen.getByRole('heading', { level: 2, name: '¿Qué es el Tarot?' })
      ).toBeInTheDocument();
    });

    it('should not render a badge for headings without a leading number', () => {
      render(<MarkdownArticle content="## Sección sin número" editorial />);

      expect(screen.queryByTestId('section-number')).not.toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: 'Sección sin número' })
      ).toBeInTheDocument();
    });

    it('should give the first paragraph a drop-cap, but not the following ones', () => {
      render(<MarkdownArticle content={'Primer párrafo intro.\n\nSegundo párrafo.'} editorial />);

      const first = screen.getByText('Primer párrafo intro.');
      const second = screen.getByText('Segundo párrafo.');
      expect(first.className).toMatch(/first-letter:/);
      expect(second.className).not.toMatch(/first-letter:/);
    });

    it('should render the ✦ decorative separator for thematic breaks', () => {
      render(<MarkdownArticle content={'Antes\n\n---\n\nDespués'} editorial />);

      const separator = screen.getByTestId('editorial-separator');
      expect(separator).toHaveTextContent('✦');
    });

    it('should inject the section image after its matching heading', () => {
      render(
        <MarkdownArticle
          content="## 2. Los 78 Arcanos"
          editorial
          sections={{
            2: {
              image: { src: '/images/enciclopedia/tarot-arcanos-mayores.webp', alt: 'Arcanos' },
            },
          }}
        />
      );

      const figure = screen.getByTestId('section-image');
      expect(figure).toBeInTheDocument();
      const img = screen.getByTestId('next-image');
      expect(img).toHaveAttribute('src', '/images/enciclopedia/tarot-arcanos-mayores.webp');
      expect(img).toHaveAttribute('alt', 'Arcanos');
    });

    it('should inject the section callout after its matching heading', () => {
      render(
        <MarkdownArticle
          content="## 1. ¿Qué es el Tarot?"
          editorial
          sections={{
            1: { callout: { variant: 'clave', text: 'Una idea clave.' } },
          }}
        />
      );

      expect(screen.getByTestId('article-callout')).toHaveTextContent('Una idea clave.');
      expect(screen.getByText('Clave')).toBeInTheDocument();
    });

    it('should not inject assets for sections without a configured entry', () => {
      render(
        <MarkdownArticle
          content="## 3. Otra sección"
          editorial
          sections={{ 1: { callout: { variant: 'clave', text: 'Solo en la 1.' } } }}
        />
      );

      expect(screen.queryByTestId('section-image')).not.toBeInTheDocument();
      expect(screen.queryByTestId('article-callout')).not.toBeInTheDocument();
    });

    it('should not apply editorial treatment when editorial is off (default)', () => {
      render(<MarkdownArticle content="## 1. ¿Qué es el Tarot?" />);

      // Plain mode keeps the number inline in the heading text and adds no badge.
      expect(screen.queryByTestId('section-number')).not.toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: '1. ¿Qué es el Tarot?' })
      ).toBeInTheDocument();
    });
  });
});
