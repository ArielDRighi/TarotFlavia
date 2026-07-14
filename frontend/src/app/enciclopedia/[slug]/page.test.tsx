import { describe, it, expect, vi, beforeEach } from 'vitest';

import CardDetailRedirectPage from './page';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPermanentRedirect = vi.fn();

vi.mock('next/navigation', () => ({
  permanentRedirect: (path: string) => mockPermanentRedirect(path),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

/**
 * /enciclopedia/[slug] servía EXACTAMENTE el mismo contenido que
 * /enciclopedia/tarot/[slug] (mismo `useCard`, mismo `CardDetailView`) en otra
 * URL: contenido duplicado ante Google. Nadie la enlaza, así que ahora redirige
 * de forma permanente a la canónica (T-PROD-018).
 */
describe('CardDetailRedirectPage (/enciclopedia/[slug])', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirige de forma permanente a la URL canónica de la carta', async () => {
    await CardDetailRedirectPage({ params: Promise.resolve({ slug: 'el-loco' }) });

    expect(mockPermanentRedirect).toHaveBeenCalledWith('/enciclopedia/tarot/el-loco');
  });

  it('preserva el slug pedido (no manda a todos al hub)', async () => {
    await CardDetailRedirectPage({ params: Promise.resolve({ slug: 'la-emperatriz' }) });

    expect(mockPermanentRedirect).toHaveBeenCalledWith('/enciclopedia/tarot/la-emperatriz');
  });
});
