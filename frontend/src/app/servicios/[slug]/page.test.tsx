import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';

import { generateMetadata, generateStaticParams } from './page';
import type { HolisticService, HolisticServiceDetail } from '@/types/holistic-service.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockGetDetail = vi.fn();
const mockGetServices = vi.fn();

vi.mock('@/lib/api/holistic-services-api', () => ({
  getHolisticServiceDetail: (slug: string) => mockGetDetail(slug),
  getHolisticServices: () => mockGetServices(),
}));

const mockNotFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
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

const service = {
  slug: 'registros-akashicos',
  name: 'Registros Akáshicos',
  shortDescription: 'Sesión de lectura de registros akáshicos con Flavia.',
} as HolisticServiceDetail;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('/servicios/[slug] — metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('⚠️ T-PROD-020: genera title y description propios del servicio', async () => {
    mockGetDetail.mockResolvedValue(service);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'registros-akashicos' }),
    });

    expect(metadata.title).toContain('Registros Akáshicos');
    expect(metadata.description).toContain('Flavia');
    expect(metadata.alternates?.canonical).toBe('/servicios/registros-akashicos');
  });

  it('un slug inexistente corta con notFound() en vez de servir el recurso', async () => {
    mockGetDetail.mockRejectedValue(apiError(404));

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: 'inventado' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('propaga un fallo transitorio en vez de cachear metadata degradada', async () => {
    mockGetDetail.mockRejectedValue(apiError(502));

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: 'registros-akashicos' }) })
    ).rejects.toThrow('boom');
    expect(mockNotFound).not.toHaveBeenCalled();
  });
});

describe('/servicios/[slug] — generateStaticParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prerenderiza una ruta por servicio', async () => {
    mockGetServices.mockResolvedValue([
      { slug: 'registros-akashicos' } as HolisticService,
      { slug: 'reiki' } as HolisticService,
    ]);

    await expect(generateStaticParams()).resolves.toEqual([
      { slug: 'registros-akashicos' },
      { slug: 'reiki' },
    ]);
  });

  it('no rompe el build si la API no responde', async () => {
    mockGetServices.mockRejectedValue(new Error('API caída'));

    await expect(generateStaticParams()).resolves.toEqual([]);
  });
});
