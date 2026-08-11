import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import SignosPage from './page';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';

/**
 * Integración del sembrado servidor → cliente (T-SEO-003).
 *
 * A diferencia de `page.test.tsx`, acá NO se mockea el hook: corre la ruta real,
 * `useArticlesByCategory` real y un `QueryClient` real, con la API mockeada como
 * único borde. Es lo que verifica de punta a punta que el dato que resuelve el
 * servidor termina en el HTML —y no solo que la cañería se llame bien—, que es
 * exactamente lo que el crawler mide.
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const mockGetArticlesByCategory = vi.fn();

vi.mock('@/lib/api/encyclopedia-articles-api', () => ({
  getArticlesByCategory: (category: ArticleCategory) => mockGetArticlesByCategory(category),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const aries: ArticleSummary = {
  id: 1,
  slug: 'aries',
  nameEs: 'Aries',
  category: ArticleCategory.ZODIAC_SIGN,
  snippet: 'El primer signo del zodiaco, regido por Marte.',
  imageUrl: null,
  sortOrder: 1,
};

function renderWithRealQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('/enciclopedia/astrologia/signos — sembrado de punta a punta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('⚠️ T-SEO-003: el artículo resuelto en el servidor aparece en el HTML del primer render', async () => {
    mockGetArticlesByCategory.mockResolvedValue([aries]);

    renderWithRealQueryClient(await SignosPage());

    // Sin esperar a ningún fetch del cliente: ya está en el árbol renderizado.
    expect(screen.getByText('Aries')).toBeInTheDocument();
    expect(screen.getByText('El primer signo del zodiaco, regido por Marte.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /aries/i })).toHaveAttribute(
      'href',
      '/enciclopedia/astrologia/signos/aries'
    );
  });

  it('⚠️ T-SEO-003: con la API caída sirve igual la introducción editorial', async () => {
    mockGetArticlesByCategory.mockRejectedValue(new Error('API caída'));

    renderWithRealQueryClient(await SignosPage());

    expect(
      screen.getByRole('heading', { level: 2, name: 'Cómo se ordenan los doce signos' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Fuego —Aries, Leo y Sagitario— aporta iniciativa/)
    ).toBeInTheDocument();
  });

  it('⚠️ un 200 con lista vacía no congela la página: el cliente vuelve a pedir', async () => {
    // Sin `initialDataUpdatedAt: 0` (contenido estático), sembrar un `[]` lo
    // estamparía como recién traído y el `staleTime` bloquearía el refetch.
    mockGetArticlesByCategory.mockResolvedValueOnce([]).mockResolvedValueOnce([aries]);

    renderWithRealQueryClient(await SignosPage());

    await waitFor(() => expect(screen.getByText('Aries')).toBeInTheDocument());
    expect(mockGetArticlesByCategory).toHaveBeenCalledTimes(2);
  });
});
