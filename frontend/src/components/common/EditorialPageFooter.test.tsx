import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { EditorialPageFooter } from './EditorialPageFooter';

/**
 * Pie compartido de las páginas editoriales estáticas (`/sobre-nosotros`,
 * `/politica-editorial`): la fecha de última revisión y los enlaces internos.
 */
describe('EditorialPageFooter', () => {
  const links = [
    { label: 'Sobre Nosotros', href: '/sobre-nosotros' },
    { label: 'Escribirnos', href: '/contacto' },
  ];

  it('muestra la última revisión editorial en español, con el testid del consumidor', () => {
    render(<EditorialPageFooter lastReviewed="2026-09" links={links} testIdPrefix="policy" />);

    const reviewed = screen.getByTestId('policy-last-reviewed');

    expect(reviewed).toHaveTextContent(/última revisión editorial: septiembre de 2026/i);
  });

  it('enlaza cada ruta con un <a href> real dentro de una nav con nombre', () => {
    render(<EditorialPageFooter lastReviewed="2026-09" links={links} testIdPrefix="policy" />);

    const nav = screen.getByRole('navigation', { name: /enlaces relacionados/i });

    links.forEach((link) => {
      expect(within(nav).getByRole('link', { name: link.label })).toHaveAttribute(
        'href',
        link.href
      );
    });
  });
});
