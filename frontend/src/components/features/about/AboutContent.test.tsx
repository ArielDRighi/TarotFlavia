import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className }: Record<string, unknown>) => (
    <img
      src={String(src)}
      alt={String(alt)}
      width={String(width)}
      height={String(height)}
      className={String(className)}
    />
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { AboutContent } from './AboutContent';
import { ABOUT_PAGE } from '@/lib/constants/about-page.data';
import { LOGO } from '@/lib/constants/branding';

/**
 * `/sobre-nosotros` es la página de señales de autoría (T-SEO-011): lo que se
 * verifica acá es que el texto llegue **renderizado**, con la jerarquía de
 * encabezados que un revisor —humano o crawler— espera encontrar.
 */
describe('AboutContent', () => {
  it('renderiza el contenedor con su testid', () => {
    render(<AboutContent />);

    expect(screen.getByTestId('about-content')).toBeInTheDocument();
  });

  it('tiene un único h1, que es el título de la página', () => {
    render(<AboutContent />);

    const headings = screen.getAllByRole('heading', { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(ABOUT_PAGE.title);
  });

  it('renderiza el lead editorial', () => {
    render(<AboutContent />);

    expect(screen.getByText(ABOUT_PAGE.lead)).toBeInTheDocument();
  });

  it('renderiza cada sección como h2', () => {
    render(<AboutContent />);

    const h2s = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);

    ABOUT_PAGE.sections.forEach((section) => {
      expect(h2s).toContain(section.heading);
    });
    expect(h2s).toContain(ABOUT_PAGE.principlesHeading);
  });

  it('no salta niveles de encabezado: solo hay h1 y h2', () => {
    const { container } = render(<AboutContent />);

    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(container.querySelectorAll('h2').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('h3, h4, h5, h6')).toHaveLength(0);
  });

  it('muestra la fecha de la última revisión editorial en español', () => {
    render(<AboutContent />);

    expect(screen.getByTestId('about-last-reviewed')).toHaveTextContent(
      /Última revisión editorial: [a-zá-ú]+ de \d{4}/i
    );
  });

  it('renderiza todos los párrafos de todas las secciones', () => {
    render(<AboutContent />);

    ABOUT_PAGE.sections.forEach((section) => {
      section.paragraphs.forEach((paragraph) => {
        expect(screen.getByText(paragraph)).toBeInTheDocument();
      });
    });
  });

  it('renderiza los principios editoriales con su término y descripción', () => {
    render(<AboutContent />);

    const principles = screen.getByTestId('about-principles');

    ABOUT_PAGE.principles.forEach((principle) => {
      expect(within(principles).getByText(principle.term)).toBeInTheDocument();
      expect(within(principles).getByText(principle.description)).toBeInTheDocument();
    });
  });

  it('renderiza los enlaces internos como <a href> reales', () => {
    render(<AboutContent />);

    ABOUT_PAGE.links.forEach((link) => {
      expect(screen.getByRole('link', { name: link.label })).toHaveAttribute('href', link.href);
    });
  });

  it('renderiza el cierre de la página', () => {
    render(<AboutContent />);

    expect(screen.getByText(ABOUT_PAGE.closing)).toBeInTheDocument();
  });

  it('muestra la marca sin retratar a nadie, con las dimensiones reales del logo', () => {
    render(<AboutContent />);

    const logo = screen.getByAltText(/auguria/i);

    expect(logo).toBeInTheDocument();
    // El archivo es apaisado (655×386): declararlo cuadrado lo dibujaba
    // letterboxed dentro de la caja y se veía más chico de lo previsto.
    expect(logo).toHaveAttribute('width', String(LOGO.width));
    expect(logo).toHaveAttribute('height', String(LOGO.height));
  });
});
