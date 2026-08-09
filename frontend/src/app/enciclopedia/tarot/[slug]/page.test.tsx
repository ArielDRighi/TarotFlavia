import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';

import { generateMetadata, generateStaticParams } from './page';
import type { CardDetail, CardSummary } from '@/types/encyclopedia.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockGetCardBySlug = vi.fn();
const mockGetCards = vi.fn();

vi.mock('@/lib/api/encyclopedia-api', () => ({
  getCardBySlug: (slug: string) => mockGetCardBySlug(slug),
  getCards: () => mockGetCards(),
}));

const mockNotFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}));

// `cache()` de React memoiza por render; en tests cada llamada debe ir al mock.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

function apiError(status: number): AxiosError {
  const error = new AxiosError('boom');
  error.response = {
    status,
    statusText: '',
    data: null,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

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

  it('⚠️ T-PROD-020: un slug inexistente corta con notFound() en vez de servir el recurso', async () => {
    mockGetCardBySlug.mockRejectedValue(apiError(404));

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: 'inventado' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mockNotFound).toHaveBeenCalledOnce();
  });

  it('⚠️ T-PROD-020: propaga un fallo transitorio en vez de cachear metadata degradada', async () => {
    // Tragarlo dejaría la ficha prerenderizada 24 h con el título heredado y el
    // esqueleto vacío: el estado exacto que Google marcó como duplicado.
    mockGetCardBySlug.mockRejectedValue(apiError(503));

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: 'el-loco' }) })
    ).rejects.toThrow('boom');
    expect(mockNotFound).not.toHaveBeenCalled();
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
