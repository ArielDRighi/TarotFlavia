import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuthorByline } from './AuthorByline';
import { ROUTES } from '@/lib/constants/routes';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

/**
 * Firma de autoría del contenido editorial (T-SEO-011).
 *
 * Sin firma, las guías son texto sin dueño: para las guías de calidad de Google
 * eso es una señal negativa en un sitio de consejo personal. La firma no nombra
 * personas — el sitio se presenta como equipo — pero sí lleva a la página donde
 * se explica quién lo escribe y con qué criterio.
 */
describe('AuthorByline', () => {
  it('firma el contenido como equipo editorial de Auguria', () => {
    render(<AuthorByline />);

    expect(screen.getByTestId('author-byline')).toHaveTextContent(/equipo editorial de auguria/i);
  });

  it('enlaza a /sobre-nosotros con un <a href> real', () => {
    render(<AuthorByline />);

    expect(screen.getByRole('link', { name: /equipo editorial de auguria/i })).toHaveAttribute(
      'href',
      ROUTES.SOBRE_NOSOTROS
    );
  });

  it('declara la revisión editorial del contenido', () => {
    render(<AuthorByline />);

    expect(screen.getByTestId('author-byline')).toHaveTextContent(/revisad/i);
  });

  it('⚠️ no nombra personas', () => {
    render(<AuthorByline />);

    expect(screen.getByTestId('author-byline').textContent ?? '').not.toMatch(/flavia/i);
  });

  it('acepta clases adicionales para adaptarse al layout que la usa', () => {
    render(<AuthorByline className="mt-10" />);

    expect(screen.getByTestId('author-byline')).toHaveClass('mt-10');
  });
});
