import { describe, it, expect, vi, beforeEach } from 'vitest';

import { generateMetadata, generateStaticParams } from './page';
import type { CardDetail, CardSummary } from '@/types/encyclopedia.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockGetCardBySlug = vi.fn();
const mockGetCards = vi.fn();

vi.mock('@/lib/api/encyclopedia-api', () => ({
  getCardBySlug: (slug: string) => mockGetCardBySlug(slug),
  getCards: () => mockGetCards(),
}));

const card = {
  id: 1,
  slug: 'el-loco',
  nameEs: 'El Loco',
  description: 'El Loco representa los comienzos y el salto al vacío.',
  meaningUpright: 'Nuevos comienzos, inocencia, espontaneidad.',
} as CardDetail;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('/enciclopedia/tarot/[slug] — metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('⚠️ T-PROD-020: genera title y description propios de la carta', async () => {
    mockGetCardBySlug.mockResolvedValue(card);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'el-loco' }) });

    expect(metadata.title).toContain('El Loco');
    expect(metadata.description).toContain('los comienzos');
  });

  it('⚠️ T-PROD-020: declara el canonical de la ficha, no el heredado', async () => {
    // Regresión directa del motivo de Search Console: sin canonical propio la
    // ruta dependía del default heredado del root layout.
    mockGetCardBySlug.mockResolvedValue(card);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'el-loco' }) });

    expect(metadata.alternates?.canonical).toBe('/enciclopedia/tarot/el-loco');
  });

  it('degrada a la metadata heredada si la API no responde', async () => {
    mockGetCardBySlug.mockRejectedValue(new Error('API caída'));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'el-loco' }) });

    expect(metadata).toEqual({});
  });
});

describe('/enciclopedia/tarot/[slug] — generateStaticParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prerenderiza una ruta por carta', async () => {
    mockGetCards.mockResolvedValue([
      { slug: 'el-loco' } as CardSummary,
      { slug: 'el-mago' } as CardSummary,
    ]);

    await expect(generateStaticParams()).resolves.toEqual([
      { slug: 'el-loco' },
      { slug: 'el-mago' },
    ]);
  });

  it('no rompe el build si la API no responde', async () => {
    mockGetCards.mockRejectedValue(new Error('API caída'));

    await expect(generateStaticParams()).resolves.toEqual([]);
  });
});
