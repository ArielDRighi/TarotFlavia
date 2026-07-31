import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';

import { generateMetadata, generateStaticParams } from './page';
import type { RitualDetail, RitualSummary } from '@/types/ritual.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockGetRitualBySlug = vi.fn();
const mockGetRituals = vi.fn();

vi.mock('@/lib/api/rituals-api', () => ({
  getRitualBySlug: (slug: string) => mockGetRitualBySlug(slug),
  getRituals: () => mockGetRituals(),
}));

const mockNotFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
  useParams: () => ({ slug: 'bano-de-luna' }),
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

const ritual = {
  slug: 'bano-de-luna',
  title: 'Baño de Luna Llena',
  description: 'Un ritual de limpieza energética para la luna llena.',
} as RitualDetail;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('/rituales/[slug] — metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('⚠️ T-PROD-020: genera title, description y canonical propios del ritual', async () => {
    mockGetRitualBySlug.mockResolvedValue(ritual);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'bano-de-luna' }) });

    expect(metadata.title).toContain('Baño de Luna Llena');
    expect(metadata.description).toContain('limpieza energética');
    expect(metadata.alternates?.canonical).toBe('/rituales/bano-de-luna');
  });

  it('un slug inexistente 404ea en vez de servir un 200 con metadata genérica', async () => {
    mockGetRitualBySlug.mockRejectedValue(apiError(404));

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: 'inventado' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('propaga un fallo transitorio en vez de cachear metadata degradada', async () => {
    mockGetRitualBySlug.mockRejectedValue(apiError(500));

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: 'bano-de-luna' }) })
    ).rejects.toThrow('boom');
    expect(mockNotFound).not.toHaveBeenCalled();
  });
});

describe('/rituales/[slug] — generateStaticParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prerenderiza una ruta por ritual', async () => {
    // Cubre además el contrato: `getRituals()` devuelve un array plano, no un
    // envelope paginado. Si eso cambiara, el `.map` rompería en silencio.
    mockGetRituals.mockResolvedValue([
      { slug: 'bano-de-luna' } as RitualSummary,
      { slug: 'proteccion' } as RitualSummary,
    ]);

    await expect(generateStaticParams()).resolves.toEqual([
      { slug: 'bano-de-luna' },
      { slug: 'proteccion' },
    ]);
  });

  it('no rompe el build si la API no responde', async () => {
    mockGetRituals.mockRejectedValue(new Error('API caída'));

    await expect(generateStaticParams()).resolves.toEqual([]);
  });
});
