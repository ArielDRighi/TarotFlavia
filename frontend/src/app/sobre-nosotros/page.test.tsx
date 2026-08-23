import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SobreNosotrosPage, { metadata } from './page';
import { ABOUT_PAGE } from '@/lib/constants/about-page.data';
import { ROUTES } from '@/lib/constants/routes';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

/**
 * `/sobre-nosotros` (T-SEO-011): la página que dice quién está detrás del sitio.
 *
 * Es estática y server-rendered a propósito — nada de lo que muestra depende de
 * la API ni de la sesión, así que el crawler recibe el contenido completo en el
 * HTML inicial.
 */
describe('SobreNosotrosPage', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://auguriatarot.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renderiza el contenido editorial de la página', () => {
    render(<SobreNosotrosPage />);

    expect(screen.getByTestId('about-content')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(ABOUT_PAGE.title);
  });

  it('emite los dos bloques de JSON-LD (Organization y AboutPage)', () => {
    const { container } = render(<SobreNosotrosPage />);

    const blocks = container.querySelectorAll('script[type="application/ld+json"]');

    expect(blocks).toHaveLength(2);

    const types = Array.from(blocks).map(
      (block) => (JSON.parse(block.textContent ?? '{}') as { '@type'?: string })['@type']
    );

    expect(types).toContain('Organization');
    expect(types).toContain('AboutPage');
  });

  it('declara metadata propia con su canonical', () => {
    expect(metadata.title).toBeTruthy();
    expect(metadata.description).toBeTruthy();
    expect(metadata.alternates?.canonical).toBe(ROUTES.SOBRE_NOSOTROS);
  });
});
