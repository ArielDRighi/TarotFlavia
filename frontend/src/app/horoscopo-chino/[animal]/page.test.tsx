/**
 * `/horoscopo-chino/[animal]` - Tests de la ruta.
 *
 * Desde T-SEO-002 la ruta es un server component: resuelve el segmento y delega
 * en `AnimalHoroscopeRoute`, que sirve la ficha estática y monta la parte
 * interactiva dentro de un `<Suspense>`.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Page, { generateStaticParams } from './page';
import { ChineseZodiacAnimal, ChineseElementCode } from '@/types/chinese-horoscope.types';

// Mock next/navigation
const mockPush = vi.fn();
const mockParams = { animal: 'dragon' };
const mockSearchParams = { get: vi.fn() };

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => mockParams,
  useSearchParams: () => mockSearchParams,
  // `notFound()` corta el render lanzando; el mock reproduce ese contrato (T-SEO-006).
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

// Mock auth store
const mockAuthStore = {
  user: null as { birthDate?: string } | null,
  isAuthenticated: false,
};

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Mock hooks
const mockUseMyAnimalHoroscope = vi.fn();
const mockUseChineseHoroscopeByElement = vi.fn();
const mockUseCalculateAnimal = vi.fn();

vi.mock('@/hooks/api/useChineseHoroscope', () => ({
  useMyAnimalHoroscope: () => mockUseMyAnimalHoroscope(),
  useChineseHoroscopeByElement: () => mockUseChineseHoroscopeByElement(),
  useCalculateAnimal: (birthDate: string | null) => mockUseCalculateAnimal(birthDate),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

/** Renderiza el server component ya resuelto, con los providers de cliente. */
async function renderPage(animal: string) {
  mockParams.animal = animal;
  const ui = await Page({ params: Promise.resolve({ animal }) });

  return render(<QueryClientProvider client={createTestQueryClient()}>{ui}</QueryClientProvider>);
}

const mockHoroscope = {
  id: 1,
  animal: ChineseZodiacAnimal.DRAGON,
  birthElement: 'wood' as ChineseElementCode,
  year: 2026,
  generalOverview: 'Test overview for dragon',
  areas: {
    love: { content: 'Love content', score: 8 },
    career: { content: 'Career content', score: 7 },
    wellness: { content: 'Wellness content', score: 9 },
    finance: { content: 'Finance content', score: 6 },
  },
  luckyElements: {
    numbers: [3, 7, 9],
    colors: ['Rojo', 'Dorado'],
    directions: ['Sur', 'Este'],
    months: [3, 6, 9],
  },
  compatibility: {
    best: [ChineseZodiacAnimal.RAT],
    good: [ChineseZodiacAnimal.MONKEY],
    challenging: [ChineseZodiacAnimal.DOG],
  },
  monthlyHighlights: 'Test highlights',
};

describe('ChineseHoroscopeAnimalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockSearchParams.get.mockReturnValue(null);
    mockParams.animal = 'dragon';
    mockAuthStore.user = null;
    mockAuthStore.isAuthenticated = false;
    mockUseCalculateAnimal.mockReturnValue({ data: null, isLoading: false });
    mockUseMyAnimalHoroscope.mockReturnValue({ isLoading: false, data: null, error: null });
    mockUseChineseHoroscopeByElement.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });
  });

  describe('contenido indexable (T-SEO-002)', () => {
    it('sirve la ficha estática del animal sin depender de la API', async () => {
      const { container } = await renderPage('dragon');

      expect(screen.getByTestId('animal-profile')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /Dragón/ })).toBeInTheDocument();

      const words = (container.textContent ?? '').replace(/\s+/g, ' ').trim().split(' ');
      expect(words.length).toBeGreaterThan(150);
    });

    it('mantiene un solo h1 en la página', async () => {
      mockSearchParams.get.mockReturnValue('wood');
      mockUseChineseHoroscopeByElement.mockReturnValue({
        isLoading: false,
        data: mockHoroscope,
        error: null,
      });

      await renderPage('dragon');

      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });

    it('prerenderiza los 12 animales', () => {
      expect(generateStaticParams()).toHaveLength(12);
    });
  });

  describe('parte interactiva', () => {
    it('should render animal selector', async () => {
      await renderPage('dragon');

      expect(screen.getByTestId('chinese-animal-selector')).toBeInTheDocument();
    });

    it('invita a elegir el elemento sin tapar la ficha con un modal', async () => {
      await renderPage('dragon');

      expect(screen.getByTestId('element-selection-prompt')).toBeInTheDocument();
      expect(screen.getByText(/Selecciona tu elemento/i)).toBeInTheDocument();
      expect(screen.queryByTestId('element-selector-modal')).not.toBeInTheDocument();
    });

    it('abre el selector de elemento al pedirlo', async () => {
      const user = userEvent.setup();
      await renderPage('dragon');

      await user.click(screen.getByRole('button', { name: /Elegir mi elemento/i }));

      expect(screen.getByTestId('element-selector-modal')).toBeInTheDocument();
    });

    it('should render loading state when fetching horoscope', async () => {
      mockSearchParams.get.mockReturnValue('wood');
      mockUseChineseHoroscopeByElement.mockReturnValue({
        isLoading: true,
        data: null,
        error: null,
      });

      await renderPage('dragon');

      expect(screen.getByText('Cargando horóscopo...')).toBeInTheDocument();
    });

    it('should render error state when horoscope not found', async () => {
      mockSearchParams.get.mockReturnValue('wood');
      mockUseChineseHoroscopeByElement.mockReturnValue({
        isLoading: false,
        data: null,
        error: Object.assign(new Error('Not found'), { response: { status: 404 } }),
      });

      await renderPage('dragon');

      expect(screen.getByText(/horóscopo en preparación/i)).toBeInTheDocument();
    });

    it('should render horoscope detail when data is loaded', async () => {
      mockSearchParams.get.mockReturnValue('wood');
      mockUseChineseHoroscopeByElement.mockReturnValue({
        isLoading: false,
        data: mockHoroscope,
        error: null,
      });

      await renderPage('dragon');

      expect(screen.getByText('Test overview for dragon')).toBeInTheDocument();
    });

    it('should show horoscope directly when viewing own animal (isMyAnimal === true)', async () => {
      mockAuthStore.user = { birthDate: '1988-03-15' };
      mockAuthStore.isAuthenticated = true;
      mockUseCalculateAnimal.mockReturnValue({
        data: {
          animal: ChineseZodiacAnimal.DRAGON,
          birthElement: 'earth' as ChineseElementCode,
        },
        isLoading: false,
      });
      mockUseMyAnimalHoroscope.mockReturnValue({
        isLoading: false,
        data: { ...mockHoroscope, generalOverview: 'Tu año como Dragón de Tierra' },
        error: null,
      });

      await renderPage('dragon');

      expect(screen.getByText('Tu año como Dragón de Tierra')).toBeInTheDocument();
    });
  });

  describe('animal inválido', () => {
    it('⚠️ T-SEO-006: corta el render con notFound() en vez de servir un 200', async () => {
      await expect(renderPage('invalid-animal')).rejects.toThrow('NEXT_NOT_FOUND');
    });

    it('no renderiza la ficha ni el panel para un animal inválido', async () => {
      await expect(renderPage('invalid-animal')).rejects.toThrow();

      expect(screen.queryByTestId('animal-profile')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chinese-animal-selector')).not.toBeInTheDocument();
    });
  });

  describe('navegación', () => {
    it('vuelve al listado con un enlace rastreable', async () => {
      await renderPage('dragon');

      expect(screen.getByRole('link', { name: /Todos los animales/i })).toHaveAttribute(
        'href',
        '/horoscopo-chino'
      );
    });
  });
});
