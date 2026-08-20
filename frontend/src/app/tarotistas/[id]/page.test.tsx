import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';

import TarotistaPerfilPage, { generateMetadata } from './page';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

// `notFound()` corta el render lanzando; el mock reproduce ese contrato (T-SEO-006).
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

const mockGet = vi.fn();
vi.mock('@/lib/api/axios-config', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

vi.mock('@/components/features/marketplace/TarotistaProfilePage', () => ({
  TarotistaProfilePage: ({
    id,
    initialTarotista,
  }: {
    id: number;
    initialTarotista?: { nombrePublico: string };
  }) => (
    <div data-testid="tarotista-profile-page">
      Profile for tarotista {id} — {initialTarotista?.nombrePublico ?? 'sin perfil'}
    </div>
  ),
}));

/** Perfil mínimo con los campos que consume la metadata. */
const TAROTISTA = {
  nombrePublico: 'Luna Estrella',
  especialidades: ['Tarot'],
  bio: 'Lectora de tarot con 10 años de experiencia.',
};

/** Error de axios con status: es lo que `resolveRouteResource` sabe distinguir. */
function axiosStatusError(status: number): AxiosError {
  const error = new AxiosError('request failed');
  error.response = {
    status,
    statusText: '',
    data: {},
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('/tarotistas/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('id válido', () => {
    it('renderiza el perfil con el id ya convertido a número', async () => {
      mockGet.mockResolvedValue({ data: TAROTISTA });

      render(await TarotistaPerfilPage({ params: Promise.resolve({ id: '123' }) }));

      expect(screen.getByTestId('tarotista-profile-page')).toBeInTheDocument();
      expect(screen.getByText(/profile for tarotista 123/i)).toBeInTheDocument();
      expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.TAROTISTAS.BY_ID(123));
    });

    it('le pasa al componente el perfil ya resuelto, para no repetir el fetch', async () => {
      mockGet.mockResolvedValue({ data: TAROTISTA });

      // Es la ruta indexable: sin esto el HTML servido es el esqueleto y el
      // cliente vuelve a pedir el mismo perfil (mismo patrón que las otras 5).
      render(await TarotistaPerfilPage({ params: Promise.resolve({ id: '123' }) }));

      expect(screen.getByTestId('tarotista-profile-page')).toHaveTextContent('Luna Estrella');
    });

    it('genera metadata con los datos del tarotista', async () => {
      mockGet.mockResolvedValue({ data: TAROTISTA });

      const metadata = await generateMetadata({ params: Promise.resolve({ id: '123' }) });

      expect(String(metadata.title)).toContain('Luna Estrella');
    });
  });

  describe('id inexistente', () => {
    it('⚠️ T-SEO-006: un 404 de la API corta el render para que la respuesta sea 404', async () => {
      mockGet.mockRejectedValue(axiosStatusError(404));

      await expect(
        TarotistaPerfilPage({ params: Promise.resolve({ id: '999999' }) })
      ).rejects.toThrow('NEXT_NOT_FOUND');
    });

    it('⚠️ T-SEO-006: la metadata también corta, no cae en un título genérico', async () => {
      mockGet.mockRejectedValue(axiosStatusError(404));

      await expect(generateMetadata({ params: Promise.resolve({ id: '999999' }) })).rejects.toThrow(
        'NEXT_NOT_FOUND'
      );
    });
  });

  describe('segmento que no es un id', () => {
    it('⚠️ T-SEO-006: no llega a la API con NaN, corta con 404', async () => {
      await expect(TarotistaPerfilPage({ params: Promise.resolve({ id: 'abc' }) })).rejects.toThrow(
        'NEXT_NOT_FOUND'
      );

      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe('API caída', () => {
    it('propaga el error en vez de servir un 404 mentiroso', async () => {
      // Un 5xx no significa "no existe": tragarlo dejaría cacheado un 404 sobre
      // una URL válida. Mismo criterio que `resolveRouteResource`.
      mockGet.mockRejectedValue(axiosStatusError(500));

      // El error original, no un `notFound()`: la URL puede ser válida y el
      // 404 quedaría cacheado por todo el ISR.
      await expect(TarotistaPerfilPage({ params: Promise.resolve({ id: '123' }) })).rejects.toThrow(
        'request failed'
      );
    });
  });
});
