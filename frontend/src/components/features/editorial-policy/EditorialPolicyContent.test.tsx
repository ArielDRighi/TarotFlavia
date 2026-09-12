import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { EditorialPolicyContent } from './EditorialPolicyContent';
import { EDITORIAL_POLICY } from '@/lib/constants/editorial-policy.data';

/**
 * `/politica-editorial` (T-SEO-017): la página que explica cómo se produce y
 * revisa el contenido. Lo que se verifica acá es que el texto llegue
 * **renderizado**, con la jerarquía `h1` → `h2` que un revisor espera.
 */
describe('EditorialPolicyContent', () => {
  it('renderiza el contenedor con su testid', () => {
    render(<EditorialPolicyContent />);

    expect(screen.getByTestId('editorial-policy-content')).toBeInTheDocument();
  });

  it('tiene un único h1, que es el título de la página', () => {
    render(<EditorialPolicyContent />);

    const headings = screen.getAllByRole('heading', { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(EDITORIAL_POLICY.title);
  });

  it('renderiza el lead editorial', () => {
    render(<EditorialPolicyContent />);

    expect(screen.getByText(EDITORIAL_POLICY.lead)).toBeInTheDocument();
  });

  it('renderiza cada sección como h2, sin saltos de jerarquía', () => {
    render(<EditorialPolicyContent />);

    const h2s = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);

    EDITORIAL_POLICY.sections.forEach((section) => {
      expect(h2s).toContain(section.heading);
    });
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
  });

  it('renderiza todos los párrafos de todas las secciones', () => {
    render(<EditorialPolicyContent />);

    EDITORIAL_POLICY.sections
      .flatMap((section) => section.paragraphs)
      .forEach((paragraph) => {
        expect(screen.getByText(paragraph)).toBeInTheDocument();
      });
  });

  it('renderiza el cierre', () => {
    render(<EditorialPolicyContent />);

    expect(screen.getByText(EDITORIAL_POLICY.closing)).toBeInTheDocument();
  });

  it('muestra la fecha de la última revisión editorial, en español', () => {
    render(<EditorialPolicyContent />);

    const reviewed = screen.getByTestId('editorial-policy-last-reviewed');
    const [year] = EDITORIAL_POLICY.lastReviewed.split('-');

    expect(reviewed).toHaveTextContent(/última revisión editorial/i);
    expect(reviewed).toHaveTextContent(year);
    expect(reviewed).not.toHaveTextContent(EDITORIAL_POLICY.lastReviewed);
  });

  it('enlaza las rutas relacionadas con <a href> reales', () => {
    render(<EditorialPolicyContent />);

    const nav = screen.getByRole('navigation', { name: /enlaces relacionados/i });

    EDITORIAL_POLICY.links.forEach((link) => {
      expect(within(nav).getByRole('link', { name: link.label })).toHaveAttribute(
        'href',
        link.href
      );
    });
  });

  it('acepta clases adicionales', () => {
    render(<EditorialPolicyContent className="mt-4" />);

    expect(screen.getByTestId('editorial-policy-content')).toHaveClass('mt-4');
  });
});
