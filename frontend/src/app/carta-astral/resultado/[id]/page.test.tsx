/**
 * Tests for Saved Chart Page
 *
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

import SavedChartPage from './page';
import * as useBirthChartModule from '@/hooks/api/useBirthChart';
import * as useDownloadPdfModule from '@/hooks/api/useDownloadPdf';
import type { SavedChartResponse } from '@/types/birth-chart-api.types';
import { ZodiacSign, Planet, AspectType } from '@/types/birth-chart.enums';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({ id: '1' }),
}));

// Mock hooks
vi.mock('@/hooks/api/useBirthChart', () => ({
  useSavedChart: vi.fn(),
  useRenameChart: vi.fn(),
  useDeleteChart: vi.fn(),
}));

vi.mock('@/hooks/api/useDownloadPdf', () => ({
  useDownloadSavedChartPdf: vi.fn(),
}));

// Helper to create QueryClient for tests
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

// Wrapper component for React Query
function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

// Mock data
const mockSavedChart: SavedChartResponse = {
  success: true,
  savedChartId: 1,
  name: 'Mi carta natal',
  createdAt: '2026-02-10T12:00:00Z',
  chartSvgData: {
    planets: [
      {
        planet: Planet.SUN,
        sign: ZodiacSign.ARIES,
        signName: 'Aries',
        signDegree: 15.5,
        formattedPosition: "15°30' Aries",
        house: 1,
        isRetrograde: false,
      },
    ],
    houses: [
      {
        house: 1,
        sign: ZodiacSign.ARIES,
        signName: 'Aries',
        signDegree: 0,
        formattedPosition: "0°00' Aries",
      },
    ],
    aspects: [],
  },
  planets: [
    {
      planet: Planet.SUN,
      sign: ZodiacSign.ARIES,
      signName: 'Aries',
      signDegree: 15.5,
      formattedPosition: "15°30' Aries",
      house: 1,
      isRetrograde: false,
    },
    {
      planet: Planet.MOON,
      sign: ZodiacSign.TAURUS,
      signName: 'Tauro',
      signDegree: 22.3,
      formattedPosition: "22°18' Tauro",
      house: 2,
      isRetrograde: false,
    },
  ],
  houses: [
    {
      house: 1,
      sign: ZodiacSign.ARIES,
      signName: 'Aries',
      signDegree: 0,
      formattedPosition: "0°00' Aries",
    },
  ],
  aspects: [
    {
      planet1: Planet.SUN,
      planet1Name: 'Sol',
      planet2: Planet.MOON,
      planet2Name: 'Luna',
      aspectType: AspectType.TRINE,
      aspectName: 'Trígono',
      aspectSymbol: '△',
      orb: 2.5,
      isApplying: true,
    },
  ],
  bigThree: {
    sun: {
      sign: ZodiacSign.ARIES,
      signName: 'Aries',
      interpretation: 'Tu Sol en Aries indica...',
    },
    moon: {
      sign: ZodiacSign.TAURUS,
      signName: 'Tauro',
      interpretation: 'Tu Luna en Tauro indica...',
    },
    ascendant: {
      sign: ZodiacSign.GEMINI,
      signName: 'Géminis',
      interpretation: 'Tu Ascendente en Géminis indica...',
    },
  },
  calculationTimeMs: 100,
  distribution: {
    elements: [
      { name: 'Fuego', count: 3, percentage: 30 },
      { name: 'Tierra', count: 2, percentage: 20 },
      { name: 'Aire', count: 3, percentage: 30 },
      { name: 'Agua', count: 2, percentage: 20 },
    ],
    modalities: [
      { name: 'Cardinal', count: 4, percentage: 40 },
      { name: 'Fijo', count: 3, percentage: 30 },
      { name: 'Mutable', count: 3, percentage: 30 },
    ],
  },
  interpretations: {
    planets: [
      {
        planet: Planet.SUN,
        planetName: 'Sol',
        intro: 'El Sol representa tu esencia...',
        inSign: 'Tu Sol en Aries...',
        inHouse: 'En la casa 1...',
        aspects: [],
      },
      {
        planet: Planet.MOON,
        planetName: 'Luna',
        intro: 'La Luna representa tus emociones...',
        inSign: 'Tu Luna en Tauro...',
        inHouse: 'En la casa 2...',
        aspects: [],
      },
      {
        planet: Planet.MERCURY,
        planetName: 'Mercurio',
        intro: 'Mercurio representa tu comunicación...',
        inSign: 'Tu Mercurio en Géminis...',
        inHouse: 'En la casa 3...',
        aspects: [],
      },
      {
        planet: Planet.VENUS,
        planetName: 'Venus',
        intro: 'Venus representa el amor...',
        inSign: 'Tu Venus en Cáncer...',
        inHouse: 'En la casa 4...',
        aspects: [],
      },
    ],
  },
  canDownloadPdf: true,
  aiSynthesis: {
    content: 'Síntesis personalizada de tu carta astral...',
    generatedAt: '2026-02-10T12:00:00Z',
    provider: 'groq-llama3.1-70b',
  },
  canAccessHistory: true,
};

describe('SavedChartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  describe('Loading state', () => {
    it('should show loading skeleton when data is loading', () => {
      vi.mocked(useBirthChartModule.useSavedChart).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as unknown as ReturnType<typeof useBirthChartModule.useSavedChart>);

      vi.mocked(useBirthChartModule.useRenameChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useRenameChart>);

      vi.mocked(useBirthChartModule.useDeleteChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useDeleteChart>);

      vi.mocked(useDownloadPdfModule.useDownloadSavedChartPdf).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useDownloadPdfModule.useDownloadSavedChartPdf>);

      render(<SavedChartPage />, { wrapper: createWrapper() });

      // El skeleton loading se muestra cuando isLoading=true
      // Verificar que no hay contenido de carta (debería estar cargando)
      expect(screen.queryByText(/mi carta natal/i)).not.toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should show error message when chart is not found', () => {
      vi.mocked(useBirthChartModule.useSavedChart).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Not found'),
      } as unknown as ReturnType<typeof useBirthChartModule.useSavedChart>);

      vi.mocked(useBirthChartModule.useRenameChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useRenameChart>);

      vi.mocked(useBirthChartModule.useDeleteChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useDeleteChart>);

      vi.mocked(useDownloadPdfModule.useDownloadSavedChartPdf).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useDownloadPdfModule.useDownloadSavedChartPdf>);

      render(<SavedChartPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/carta no encontrada/i)).toBeInTheDocument();
      expect(screen.getByText(/ir a mi historial/i)).toBeInTheDocument();
    });
  });

  describe('Success state', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartModule.useSavedChart).mockReturnValue({
        data: mockSavedChart,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useBirthChartModule.useSavedChart>);

      vi.mocked(useBirthChartModule.useRenameChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useRenameChart>);

      vi.mocked(useBirthChartModule.useDeleteChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useDeleteChart>);

      vi.mocked(useDownloadPdfModule.useDownloadSavedChartPdf).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useDownloadPdfModule.useDownloadSavedChartPdf>);
    });

    it('should render header with breadcrumb and action buttons', () => {
      render(<SavedChartPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/mi historial/i)).toBeInTheDocument();
      expect(screen.getAllByText(/guardada/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/pdf/i)).toBeInTheDocument();
    });

    it('should render chart name and creation date', () => {
      render(<SavedChartPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Mi carta natal')).toBeInTheDocument();
      expect(screen.getByText(/guardada el/i)).toBeInTheDocument();
    });

    it('should render AI synthesis', () => {
      render(<SavedChartPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/síntesis personalizada de tu carta astral/i)).toBeInTheDocument();
    });

    it('should render chart wheel card', () => {
      render(<SavedChartPage />, { wrapper: createWrapper() });

      const chartCard = screen.getByTestId('chart-wheel-card');
      expect(chartCard).toBeInTheDocument();
      expect(screen.getAllByText(/carta natal/i).length).toBeGreaterThan(0);
    });

    it('should render BigThree component', () => {
      render(<SavedChartPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/tu sol en aries indica/i)).toBeInTheDocument();
      expect(screen.getByText(/tu luna en tauro indica/i)).toBeInTheDocument();
      expect(screen.getByText(/tu ascendente en géminis indica/i)).toBeInTheDocument();
    });

    it('should render tabs with positions, aspects, and distribution', () => {
      render(<SavedChartPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('tab', { name: /posiciones/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /aspectos/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /distribución/i })).toBeInTheDocument();
    });

    it('should show planet positions table in positions tab', async () => {
      render(<SavedChartPage />, { wrapper: createWrapper() });

      // Tab de posiciones está activo por defecto
      await waitFor(() => {
        expect(screen.getAllByText('Aries').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Tauro').length).toBeGreaterThan(0);
      });
    });

    it('should show aspects table when aspects tab is clicked', async () => {
      const user = userEvent.setup();
      render(<SavedChartPage />, { wrapper: createWrapper() });

      const aspectsTab = screen.getByRole('tab', { name: /aspectos/i });
      await user.click(aspectsTab);

      await waitFor(() => {
        expect(screen.getByText('Trígono')).toBeInTheDocument();
      });
    });

    it('should show element distribution when distribution tab is clicked', async () => {
      const user = userEvent.setup();
      render(<SavedChartPage />, { wrapper: createWrapper() });

      const distributionTab = screen.getByRole('tab', { name: /distribución/i });
      await user.click(distributionTab);

      await waitFor(() => {
        expect(screen.getAllByText('Fuego').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Tierra').length).toBeGreaterThan(0);
      });
    });

    it('should render interpretations section', () => {
      render(<SavedChartPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/interpretaciones/i)).toBeInTheDocument();
      expect(screen.getByText(/el sol representa tu esencia/i)).toBeInTheDocument();
    });

    it('should show all planet interpretations without pagination', () => {
      render(<SavedChartPage />, { wrapper: createWrapper() });

      // Todos los planetas visibles directamente, sin necesidad de expandir
      expect(screen.getByText(/el sol representa tu esencia/i)).toBeInTheDocument();
      expect(screen.getByText(/la luna representa tus emociones/i)).toBeInTheDocument();
      expect(screen.getByText(/mercurio representa tu comunicación/i)).toBeInTheDocument();
      expect(screen.getByText(/venus representa el amor/i)).toBeInTheDocument();

      // Sin texto de paginación ni botones de toggle
      expect(screen.queryByText(/mostrando 3 de/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /mostrar todos/i })).not.toBeInTheDocument();
    });
  });

  describe('Rename functionality', () => {
    it('should enter edit mode when rename is clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(useBirthChartModule.useSavedChart).mockReturnValue({
        data: mockSavedChart,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useBirthChartModule.useSavedChart>);

      vi.mocked(useBirthChartModule.useRenameChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useRenameChart>);

      vi.mocked(useBirthChartModule.useDeleteChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useDeleteChart>);

      vi.mocked(useDownloadPdfModule.useDownloadSavedChartPdf).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useDownloadPdfModule.useDownloadSavedChartPdf>);

      render(<SavedChartPage />, { wrapper: createWrapper() });

      const menuButton = screen.getByTestId('menu-button');
      await user.click(menuButton);

      const renameOption = await screen.findByRole('menuitem', { name: /renombrar/i });
      await user.click(renameOption);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Mi carta natal')).toBeInTheDocument();
      });
    });

    it('should open rename input when rename menu option is clicked', async () => {
      const user = userEvent.setup();
      const mockMutate = vi.fn();

      vi.mocked(useBirthChartModule.useSavedChart).mockReturnValue({
        data: mockSavedChart,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useBirthChartModule.useSavedChart>);

      vi.mocked(useBirthChartModule.useRenameChart).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useRenameChart>);

      vi.mocked(useBirthChartModule.useDeleteChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useDeleteChart>);

      vi.mocked(useDownloadPdfModule.useDownloadSavedChartPdf).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useDownloadPdfModule.useDownloadSavedChartPdf>);

      render(<SavedChartPage />, { wrapper: createWrapper() });

      const menuButton = screen.getByTestId('menu-button');
      await user.click(menuButton);

      const renameOption = screen.getByRole('menuitem', { name: /renombrar/i });
      await user.click(renameOption);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Mi carta natal')).toBeInTheDocument();
      });
    });

    it('should call rename mutation when save is clicked', async () => {
      const user = userEvent.setup();
      const mockMutate = vi.fn();

      vi.mocked(useBirthChartModule.useSavedChart).mockReturnValue({
        data: mockSavedChart,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useBirthChartModule.useSavedChart>);

      vi.mocked(useBirthChartModule.useRenameChart).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useRenameChart>);

      vi.mocked(useBirthChartModule.useDeleteChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useDeleteChart>);

      vi.mocked(useDownloadPdfModule.useDownloadSavedChartPdf).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useDownloadPdfModule.useDownloadSavedChartPdf>);

      render(<SavedChartPage />, { wrapper: createWrapper() });

      const menuButton = screen.getByTestId('menu-button');
      await user.click(menuButton);

      const renameOption = await screen.findByRole('menuitem', { name: /renombrar/i });
      await user.click(renameOption);

      const input = await screen.findByDisplayValue('Mi carta natal');
      await user.clear(input);
      await user.type(input, 'Nuevo nombre');

      const saveButton = screen.getByTestId('save-edit-button');
      await user.click(saveButton);

      expect(mockMutate).toHaveBeenCalledWith({ id: 1, name: 'Nuevo nombre' }, expect.any(Object));
    });
  });

  describe('Download PDF functionality', () => {
    it('should call download mutation when PDF button is clicked', async () => {
      const user = userEvent.setup();
      const mockMutate = vi.fn();

      vi.mocked(useBirthChartModule.useSavedChart).mockReturnValue({
        data: mockSavedChart,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useBirthChartModule.useSavedChart>);

      vi.mocked(useBirthChartModule.useRenameChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useRenameChart>);

      vi.mocked(useBirthChartModule.useDeleteChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useDeleteChart>);

      vi.mocked(useDownloadPdfModule.useDownloadSavedChartPdf).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof useDownloadPdfModule.useDownloadSavedChartPdf>);

      render(<SavedChartPage />, { wrapper: createWrapper() });

      const pdfButton = screen.getByRole('button', { name: /pdf/i });
      await user.click(pdfButton);

      expect(mockMutate).toHaveBeenCalledWith({
        chartId: 1,
        filename: 'Mi carta natal.pdf',
      });
    });
  });

  describe('Delete functionality', () => {
    it('should show delete confirmation dialog when delete is clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(useBirthChartModule.useSavedChart).mockReturnValue({
        data: mockSavedChart,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useBirthChartModule.useSavedChart>);

      vi.mocked(useBirthChartModule.useRenameChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useRenameChart>);

      vi.mocked(useBirthChartModule.useDeleteChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useDeleteChart>);

      vi.mocked(useDownloadPdfModule.useDownloadSavedChartPdf).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useDownloadPdfModule.useDownloadSavedChartPdf>);

      render(<SavedChartPage />, { wrapper: createWrapper() });

      const menuButton = screen.getByTestId('menu-button');
      await user.click(menuButton);

      const deleteOption = screen.getByRole('menuitem', { name: /eliminar/i });
      await user.click(deleteOption);

      await waitFor(() => {
        expect(screen.getByText(/¿eliminar esta carta?/i)).toBeInTheDocument();
        expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument();
      });
    });

    it('should call delete mutation when confirmed', async () => {
      const user = userEvent.setup();
      const mockMutate = vi.fn();

      vi.mocked(useBirthChartModule.useSavedChart).mockReturnValue({
        data: mockSavedChart,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useBirthChartModule.useSavedChart>);

      vi.mocked(useBirthChartModule.useRenameChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useRenameChart>);

      vi.mocked(useBirthChartModule.useDeleteChart).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useDeleteChart>);

      vi.mocked(useDownloadPdfModule.useDownloadSavedChartPdf).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useDownloadPdfModule.useDownloadSavedChartPdf>);

      render(<SavedChartPage />, { wrapper: createWrapper() });

      const menuButton = screen.getByTestId('menu-button');
      await user.click(menuButton);

      const deleteOption = screen.getByRole('menuitem', { name: /eliminar/i });
      await user.click(deleteOption);

      const confirmButton = await screen.findByRole('button', { name: /eliminar/i });
      await user.click(confirmButton);

      expect(mockMutate).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should navigate to history after successful delete', async () => {
      const user = userEvent.setup();
      const mockMutate = vi.fn((id, options) => {
        options?.onSuccess?.();
      });

      vi.mocked(useBirthChartModule.useSavedChart).mockReturnValue({
        data: mockSavedChart,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useBirthChartModule.useSavedChart>);

      vi.mocked(useBirthChartModule.useRenameChart).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useRenameChart>);

      vi.mocked(useBirthChartModule.useDeleteChart).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof useBirthChartModule.useDeleteChart>);

      vi.mocked(useDownloadPdfModule.useDownloadSavedChartPdf).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useDownloadPdfModule.useDownloadSavedChartPdf>);

      render(<SavedChartPage />, { wrapper: createWrapper() });

      const menuButton = screen.getByTestId('menu-button');
      await user.click(menuButton);

      const deleteOption = screen.getByRole('menuitem', { name: /eliminar/i });
      await user.click(deleteOption);

      const confirmButton = await screen.findByRole('button', { name: /eliminar/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/carta-astral/historial');
      });
    });
  });
});
