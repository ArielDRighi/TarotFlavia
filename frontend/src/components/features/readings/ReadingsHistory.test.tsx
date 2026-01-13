/**
 * Tests for ReadingsHistory Component
 *
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReactNode } from 'react';

import { ReadingsHistory } from './ReadingsHistory';
import * as useReadingsModule from '@/hooks/api/useReadings';
import type { Reading, PaginatedReadings } from '@/types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock useReadings hooks
vi.mock('@/hooks/api/useReadings');

// Mock toast
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create QueryClient for tests
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
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

// Render helper with providers
function renderWithProviders(ui: React.ReactElement) {
  const Wrapper = createWrapper();
  return render(<Wrapper>{ui}</Wrapper>);
}

// Mock reading data
const mockReadings: Reading[] = [
  {
    id: 1,
    spreadId: 1,
    spreadName: 'Cruz Céltica',
    question: '¿Qué me depara el futuro en mi carrera profesional?',
    createdAt: '2025-12-01T10:00:00Z',
    cardsCount: 10,
  },
  {
    id: 2,
    spreadId: 2,
    spreadName: 'Tirada de 3 Cartas',
    question: '¿Encontraré el amor verdadero este año?',
    createdAt: '2025-12-02T10:00:00Z',
    cardsCount: 3,
  },
  {
    id: 3,
    spreadId: 3,
    spreadName: 'Tirada de 5 Cartas',
    question: '¿Cómo puedo mejorar mi vida laboral?',
    createdAt: '2025-12-03T10:00:00Z',
    cardsCount: 5,
  },
];

const mockPaginatedReadings: PaginatedReadings = {
  data: mockReadings,
  meta: {
    page: 1,
    limit: 10,
    totalItems: 25,
    totalPages: 3,
  },
};

const mockEmptyPaginatedReadings: PaginatedReadings = {
  data: [],
  meta: {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  },
};

const mockDeleteReading = vi.fn();

describe('ReadingsHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for delete mutation
    vi.mocked(useReadingsModule.useDeleteReading).mockReturnValue({
      mutate: mockDeleteReading,
      isPending: false,
    } as unknown as ReturnType<typeof useReadingsModule.useDeleteReading>);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Header', () => {
    it('should render header title with serif font', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('Tu camino revelado');
      expect(title).toHaveClass('font-serif');
    });

    it('should render date filter and search input', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      expect(screen.getByTestId('date-filter')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show skeleton cards while loading', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      const skeletonCards = screen.getAllByTestId('skeleton-card');
      expect(skeletonCards.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no readings exist', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockEmptyPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      expect(screen.getByText(/tu destino aún no ha sido revelado/i)).toBeInTheDocument();
    });

    it('should navigate to /ritual when CTA button is clicked', async () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockEmptyPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      const ctaButton = screen.getByRole('button', { name: /hacer mi primera lectura/i });
      await userEvent.click(ctaButton);

      expect(mockPush).toHaveBeenCalledWith('/ritual');
    });
  });

  describe('Readings List', () => {
    it('should render ReadingCard components for each reading', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      const readingCards = screen.getAllByTestId('reading-card');
      expect(readingCards).toHaveLength(mockReadings.length);
    });
  });

  describe('Search Filter', () => {
    it('should filter readings locally by search query in question', async () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await userEvent.type(searchInput, 'amor');

      await waitFor(() => {
        const readingCards = screen.getAllByTestId('reading-card');
        expect(readingCards).toHaveLength(1);
      });
    });

    it('should filter readings by spread name', async () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await userEvent.type(searchInput, 'Cruz Céltica');

      await waitFor(() => {
        const readingCards = screen.getAllByTestId('reading-card');
        expect(readingCards).toHaveLength(1);
      });
    });

    it('should show no results message when search has no matches', async () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await userEvent.type(searchInput, 'búsqueda sin resultados');

      await waitFor(() => {
        expect(
          screen.getByText(/no se encontraron lecturas para tu búsqueda/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should show pagination controls when there are multiple pages', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText(/página 1 de 3/i)).toBeInTheDocument();
    });
  });

  describe('Spread Filter', () => {
    it('should show spread filter dropdown', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      expect(screen.getByTestId('spread-filter')).toBeInTheDocument();
    });

    it('should filter readings by spread type', async () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      // Open spread filter dropdown
      const spreadFilter = screen.getByTestId('spread-filter');
      await userEvent.click(spreadFilter);

      // Select "Tirada de 3 Cartas" option - use getAllByText and select the one within menu
      const tresCartasOptions = screen.getAllByText('Tirada de 3 Cartas');
      const menuOption = tresCartasOptions.find((el) => el.getAttribute('role') === 'menuitem');

      if (menuOption) {
        await userEvent.click(menuOption);
      }

      // Should show only readings with spreadName "Tirada de 3 Cartas"
      await waitFor(() => {
        const readingCards = screen.getAllByTestId('reading-card');
        expect(readingCards).toHaveLength(1);
      });
    });

    it('should show "Todas las tiradas" by default', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      expect(screen.getByTestId('spread-filter')).toHaveTextContent('Todas las tiradas');
    });

    it('should show no results message when spread filter has no matches', async () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      // Open spread filter dropdown
      const spreadFilter = screen.getByTestId('spread-filter');
      await userEvent.click(spreadFilter);

      // Select a spread type that doesn't exist in mock data
      const spreadOption = screen.getByText('Tirada de 1 Carta');
      await userEvent.click(spreadOption);

      await waitFor(() => {
        expect(screen.getByText(/no se encontraron lecturas/i)).toBeInTheDocument();
      });
    });

    it('should filter by spread and search query simultaneously', async () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      // Apply spread filter
      const spreadFilter = screen.getByTestId('spread-filter');
      await userEvent.click(spreadFilter);

      const spreadOptions = screen.getAllByText('Tirada de 3 Cartas');
      const menuOption = spreadOptions.find((el) => el.getAttribute('role') === 'menuitem');
      if (menuOption) {
        await userEvent.click(menuOption);
      }

      // Apply search query
      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await userEvent.type(searchInput, 'amor');

      // Should show only reading that matches both filters
      await waitFor(() => {
        const readingCards = screen.getAllByTestId('reading-card');
        expect(readingCards).toHaveLength(1);
        // Verify it's the correct reading (Tirada de 3 Cartas with "amor" in question)
        expect(screen.getByText(/encontraré el amor verdadero/i)).toBeInTheDocument();
      });
    });
  });

  describe('View Toggle', () => {
    it('should show view toggle button', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      expect(screen.getByTestId('view-toggle')).toBeInTheDocument();
    });

    it('should toggle between list and grid view', async () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      const readingsList = screen.getByTestId('readings-list');

      // Default is list view (grid gap-4)
      expect(readingsList).toHaveClass('grid', 'gap-4');

      // Toggle to grid view
      const viewToggle = screen.getByTestId('view-toggle');
      await userEvent.click(viewToggle);

      await waitFor(() => {
        // Grid view should have specific classes (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
        expect(readingsList).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
      });
    });

    it('should show grid icon in list view and list icon in grid view', async () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      const viewToggle = screen.getByTestId('view-toggle');

      // Initially in list view, should show grid icon
      expect(viewToggle).toHaveAttribute('aria-label', 'Vista en cuadrícula');

      // Toggle to grid view
      await userEvent.click(viewToggle);

      await waitFor(() => {
        // In grid view, should show list icon
        expect(viewToggle).toHaveAttribute('aria-label', 'Vista en lista');
      });
    });
  });

  describe('Error State', () => {
    it('should show error message when fetch fails', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Error al obtener lecturas'),
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      expect(screen.getByText(/error al obtener lecturas/i)).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', async () => {
      const mockRefetch = vi.fn();
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Error al obtener lecturas'),
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<ReadingsHistory />);

      const retryButton = screen.getByRole('button', { name: /reintentar/i });
      await userEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
