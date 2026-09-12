import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PoliticaEditorialPage, { metadata } from './page';
import { EDITORIAL_POLICY } from '@/lib/constants/editorial-policy.data';
import { ROUTES } from '@/lib/constants/routes';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

/**
 * `/politica-editorial` (T-SEO-017): cómo se produce, revisa y corrige el
 * contenido del sitio. Estática y server-rendered: el crawler recibe el texto
 * completo en el HTML inicial.
 */
describe('PoliticaEditorialPage', () => {
  it('renderiza el contenido editorial de la página', () => {
    render(<PoliticaEditorialPage />);

    expect(screen.getByTestId('editorial-policy-content')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(EDITORIAL_POLICY.title);
  });

  it('declara metadata propia con su canonical, indexable', () => {
    expect(metadata.title).toBeTruthy();
    expect(metadata.description).toBeTruthy();
    expect(metadata.alternates?.canonical).toBe(ROUTES.POLITICA_EDITORIAL);
    expect(metadata.robots).toBeUndefined();
  });
});
