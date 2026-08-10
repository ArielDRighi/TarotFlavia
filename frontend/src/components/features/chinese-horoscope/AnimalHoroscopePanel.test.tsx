/**
 * AnimalHoroscopePanel - Tests
 *
 * Cubre estados: loading, error 404, error 5xx, éxito
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AnimalHoroscopePanel } from './AnimalHoroscopePanel';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ animal: 'rata' }),
  useSearchParams: () => ({ get: () => 'metal' }),
}));

// Mock hook
const mockUseAnimalHoroscopePage = vi.fn();
vi.mock('@/hooks/utils/useAnimalHoroscopePage', () => ({
  useAnimalHoroscopePage: () => mockUseAnimalHoroscopePage(),
}));

// Mock child components to simplify tests
vi.mock('@/components/features/chinese-horoscope', () => ({
  ChineseHoroscopeDetail: () => <div data-testid="horoscope-detail">Detalle horóscopo</div>,
  ChineseAnimalSelector: () => <div data-testid="animal-selector">Selector</div>,
  ElementSelectorModal: () => null,
}));

vi.mock('@/lib/constants/routes', () => ({
  ROUTES: {
    HOROSCOPO_CHINO: '/horoscopo-chino',
    HOROSCOPO_CHINO_ANIMAL: (a: string) => `/horoscopo-chino/${a}`,
  },
}));

function createBaseHookResult() {
  return {
    animal: 'rata' as const,
    isValidAnimal: true,
    animalInfo: { nameEs: 'Rata', emoji: '🐭' },
    userAnimal: undefined,
    isMyAnimal: false,
    element: 'metal' as const,
    horoscopeData: undefined,
    isLoading: false,
    error: null,
    currentYear: 2025,
    showElementModal: false,
    handleElementSelect: vi.fn(),
  };
}

describe('AnimalHoroscopePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Estado: cargando', () => {
    it('muestra Spinner mientras carga', () => {
      mockUseAnimalHoroscopePage.mockReturnValue({
        ...createBaseHookResult(),
        isLoading: true,
      });

      render(<AnimalHoroscopePanel />);

      expect(screen.getByText(/cargando horóscopo/i)).toBeInTheDocument();
    });
  });

  describe('Estado: error 404', () => {
    it('muestra mensaje empático cuando el horóscopo no está disponible (404)', () => {
      const error404 = Object.assign(new Error('Not Found'), {
        response: { status: 404 },
      });

      mockUseAnimalHoroscopePage.mockReturnValue({
        ...createBaseHookResult(),
        error: error404,
      });

      render(<AnimalHoroscopePanel />);

      expect(screen.getByText(/en preparación/i)).toBeInTheDocument();
    });

    it('muestra botón para volver al listado en error 404', () => {
      const error404 = Object.assign(new Error('Not Found'), {
        response: { status: 404 },
      });

      mockUseAnimalHoroscopePage.mockReturnValue({
        ...createBaseHookResult(),
        error: error404,
      });

      render(<AnimalHoroscopePanel />);

      expect(screen.getByRole('button', { name: /volver al listado/i })).toBeInTheDocument();
    });

    it('navega al listado al hacer clic en "Volver al listado" (error 404)', async () => {
      const error404 = Object.assign(new Error('Not Found'), {
        response: { status: 404 },
      });

      mockUseAnimalHoroscopePage.mockReturnValue({
        ...createBaseHookResult(),
        error: error404,
      });

      render(<AnimalHoroscopePanel />);

      await userEvent.click(screen.getByRole('button', { name: /volver al listado/i }));

      expect(mockPush).toHaveBeenCalledWith('/horoscopo-chino');
    });
  });

  describe('Estado: error 5xx', () => {
    it('muestra mensaje con opción de reintento en error de servidor', () => {
      const error500 = Object.assign(new Error('Internal Server Error'), {
        response: { status: 500 },
      });

      mockUseAnimalHoroscopePage.mockReturnValue({
        ...createBaseHookResult(),
        error: error500,
      });

      render(<AnimalHoroscopePanel />);

      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('muestra mensaje indicando error del servidor en 5xx', () => {
      const error503 = Object.assign(new Error('Service Unavailable'), {
        response: { status: 503 },
      });

      mockUseAnimalHoroscopePage.mockReturnValue({
        ...createBaseHookResult(),
        error: error503,
      });

      render(<AnimalHoroscopePanel />);

      expect(screen.getByTestId('error-server')).toBeInTheDocument();
    });
  });

  describe('Estado: éxito', () => {
    it('muestra ChineseHoroscopeDetail cuando hay datos', () => {
      mockUseAnimalHoroscopePage.mockReturnValue({
        ...createBaseHookResult(),
        horoscopeData: { id: 1, year: 2025 },
      });

      render(<AnimalHoroscopePanel />);

      expect(screen.getByTestId('horoscope-detail')).toBeInTheDocument();
    });

    it('no muestra error cuando la carga es exitosa', () => {
      mockUseAnimalHoroscopePage.mockReturnValue({
        ...createBaseHookResult(),
        horoscopeData: { id: 1, year: 2025 },
      });

      render(<AnimalHoroscopePanel />);

      expect(screen.queryByText(/en preparación/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();
    });
  });

  describe('Estado: animal inválido', () => {
    it('no renderiza nada: el mensaje lo sirve AnimalHoroscopeRoute en el servidor', () => {
      mockUseAnimalHoroscopePage.mockReturnValue({
        ...createBaseHookResult(),
        isValidAnimal: false,
        animalInfo: null,
      });

      render(<AnimalHoroscopePanel />);

      expect(screen.queryByTestId('animal-horoscope-panel')).not.toBeInTheDocument();
    });
  });

  describe('Contenido indexable (T-SEO-002)', () => {
    it('no duplica el h1 de la ficha estática', () => {
      mockUseAnimalHoroscopePage.mockReturnValue({
        ...createBaseHookResult(),
        horoscopeData: { id: 1, year: 2025 },
      });

      render(<AnimalHoroscopePanel />);

      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });
  });
});
