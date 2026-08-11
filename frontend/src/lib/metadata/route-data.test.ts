import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';

import {
  isNotFoundError,
  resolveListingData,
  resolveRouteResource,
  safeStaticParams,
} from './route-data';

const mockNotFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}));

function axiosErrorWithStatus(status: number): AxiosError {
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

describe('isNotFoundError', () => {
  it('reconoce un 404 de la API', () => {
    expect(isNotFoundError(axiosErrorWithStatus(404))).toBe(true);
  });

  it.each([500, 502, 429])('no confunde un %i con un recurso inexistente', (status) => {
    expect(isNotFoundError(axiosErrorWithStatus(status))).toBe(false);
  });

  it('no confunde un error de red (sin response) con un 404', () => {
    expect(isNotFoundError(new AxiosError('Network Error'))).toBe(false);
  });

  it('no trata un Error común como 404', () => {
    expect(isNotFoundError(new Error('boom'))).toBe(false);
  });
});

describe('resolveRouteResource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve el recurso cuando la API responde', async () => {
    await expect(resolveRouteResource(async () => ({ id: 1 }))).resolves.toEqual({ id: 1 });
    expect(mockNotFound).not.toHaveBeenCalled();
  });

  it('⚠️ T-PROD-020: un slug inexistente da 404, no un 200 con metadata heredada', async () => {
    const fetcher = () => Promise.reject(axiosErrorWithStatus(404));

    await expect(resolveRouteResource(fetcher)).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mockNotFound).toHaveBeenCalledOnce();
  });

  it('⚠️ T-PROD-020: propaga un fallo transitorio en vez de cachear un render degradado', async () => {
    const fetcher = () => Promise.reject(axiosErrorWithStatus(503));

    await expect(resolveRouteResource(fetcher)).rejects.toThrow('boom');
    expect(mockNotFound).not.toHaveBeenCalled();
  });
});

describe('resolveListingData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve el listado cuando la API responde', async () => {
    await expect(resolveListingData(async () => [{ id: 1 }])).resolves.toEqual([{ id: 1 }]);
  });

  it('⚠️ T-SEO-003: degrada a undefined si la API falla, sin tumbar el listado', async () => {
    // A diferencia de una ficha, un listado tiene contenido propio que sirve
    // igual: fallar el render dejaría la ruta entera caída por un blip de API.
    await expect(resolveListingData(() => Promise.reject(new Error('API caída')))).resolves.toBe(
      undefined
    );
  });

  it('no dispara notFound() cuando la API responde 404', async () => {
    const fetcher = () => Promise.reject(axiosErrorWithStatus(404));

    await expect(resolveListingData(fetcher)).resolves.toBe(undefined);
    expect(mockNotFound).not.toHaveBeenCalled();
  });
});

describe('safeStaticParams', () => {
  it('mapea los items a params de prerender', async () => {
    const fetcher = async () => [{ slug: 'a' }, { slug: 'b' }];

    await expect(safeStaticParams(fetcher, (item) => ({ slug: item.slug }))).resolves.toEqual([
      { slug: 'a' },
      { slug: 'b' },
    ]);
  });

  it('degrada a [] si la API no responde, sin romper el build', async () => {
    const fetcher = () => Promise.reject(new Error('API caída'));

    await expect(safeStaticParams(fetcher, (item: { slug: string }) => item.slug)).resolves.toEqual(
      []
    );
  });
});
