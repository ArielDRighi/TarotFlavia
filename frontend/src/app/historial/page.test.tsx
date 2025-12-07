/**
 * Tests for Historial (Reading History) Page
 *
 * @vitest-environment jsdom
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReactNode } from 'react';

import HistorialPage from './page';
import * as useRequireAuthModule from '@/hooks/useRequireAuth';
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

// Mock useRequireAuth
vi.mock('@/hooks/useRequireAuth');

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
    spreadName: 'Cruz Celta',
    question: '¿Qué me depara el futuro en mi carrera profesional?',
    createdAt: '2025-12-01T10:00:00Z',
    cardsCount: 10,
  },
  {
    id: 2,
    spreadId: 2,
    spreadName: 'Tres Cartas',
    question: '¿Encontraré el amor verdadero este año?',
    createdAt: '2025-12-02T10:00:00Z',
    cardsCount: 3,
  },
  {
    id: 3,
    spreadId: 1,
    spreadName: 'Cruz Celta',
    question: '¿Debería cambiar de trabajo?',
    createdAt: '2025-11-30T10:00:00Z',
    cardsCount: 10,
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

describe('HistorialPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: authenticated user
    vi.mocked(useRequireAuthModule.useRequireAuth).mockReturnValue({
      isLoading: false,
    });

    // Default mock for delete mutation
    vi.mocked(useReadingsModule.useDeleteReading).mockReturnValue({
      mutate: mockDeleteReading,
      isPending: false,
    } as unknown as ReturnType<typeof useReadingsModule.useDeleteReading>);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ===========================================================================
  // Authentication Tests
  // ===========================================================================
  describe('Authentication', () => {
    it('should show loading spinner when auth is loading', () => {
      vi.mocked(useRequireAuthModule.useRequireAuth).mockReturnValue({
        isLoading: true,
      });

      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
    });

    it('should use useRequireAuth hook', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      expect(useRequireAuthModule.useRequireAuth).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Header Section Tests
  // ===========================================================================
  describe('Header', () => {
    beforeEach(() => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);
    });

    it('should render header title with serif font', () => {
      renderWithProviders(<HistorialPage />);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('Tu camino revelado');
      expect(title).toHaveClass('font-serif');
    });

    it('should render date filter dropdown', () => {
      renderWithProviders(<HistorialPage />);

      expect(screen.getByTestId('date-filter')).toBeInTheDocument();
    });

    it('should render search input for filtering by question', () => {
      renderWithProviders(<HistorialPage />);

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================
  describe('Loading State', () => {
    it('should show skeleton cards while loading', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      const skeletonCards = screen.getAllByTestId('skeleton-card');
      expect(skeletonCards.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Empty State Tests
  // ===========================================================================
  describe('Empty State', () => {
    it('should show empty state when no readings exist', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockEmptyPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      expect(screen.getByText(/tu destino aún no ha sido revelado/i)).toBeInTheDocument();
    });

    it('should show card icon in empty state', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockEmptyPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      expect(screen.getByTestId('empty-state-icon')).toBeInTheDocument();
    });

    it('should show CTA button to make first reading', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockEmptyPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      const ctaButton = screen.getByRole('button', { name: /hacer mi primera lectura/i });
      expect(ctaButton).toBeInTheDocument();
    });

    it('should navigate to /ritual when CTA button is clicked', async () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockEmptyPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      const ctaButton = screen.getByRole('button', { name: /hacer mi primera lectura/i });
      await userEvent.click(ctaButton);

      expect(mockPush).toHaveBeenCalledWith('/ritual');
    });
  });

  // ===========================================================================
  // Readings List Tests
  // ===========================================================================
  describe('Readings List', () => {
    beforeEach(() => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);
    });

    it('should render ReadingCard components for each reading', () => {
      renderWithProviders(<HistorialPage />);

      const readingCards = screen.getAllByTestId('reading-card');
      expect(readingCards).toHaveLength(mockReadings.length);
    });

    it('should display reading questions', () => {
      renderWithProviders(<HistorialPage />);

      mockReadings.forEach((reading) => {
        expect(screen.getByText(reading.question)).toBeInTheDocument();
      });
    });

    it('should show readings in a vertical grid with gap', () => {
      renderWithProviders(<HistorialPage />);

      const listContainer = screen.getByTestId('readings-list');
      expect(listContainer).toHaveClass('gap-4');
    });
  });

  // ===========================================================================
  // Filter Tests
  // ===========================================================================
  describe('Date Filter', () => {
    beforeEach(() => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);
    });

    it('should have "Más recientes" as default filter', () => {
      renderWithProviders(<HistorialPage />);

      expect(screen.getByTestId('date-filter')).toHaveTextContent(/más recientes/i);
    });

    it('should show filter options when clicked', async () => {
      renderWithProviders(<HistorialPage />);

      const filterTrigger = screen.getByTestId('date-filter');
      await userEvent.click(filterTrigger);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /más recientes/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /más antiguas/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /esta semana/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /este mes/i })).toBeInTheDocument();
      });
    });
  });

  describe('Search Filter', () => {
    beforeEach(() => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);
    });

    it('should filter readings locally by search query', async () => {
      renderWithProviders(<HistorialPage />);

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await userEvent.type(searchInput, 'amor');

      await waitFor(() => {
        const readingCards = screen.getAllByTestId('reading-card');
        // Should only show the reading with "amor" in question
        expect(readingCards).toHaveLength(1);
        expect(screen.getByText(/encontraré el amor/i)).toBeInTheDocument();
      });
    });

    it('should show empty results when search matches nothing', async () => {
      renderWithProviders(<HistorialPage />);

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await userEvent.type(searchInput, 'xyznonexistent');

      await waitFor(() => {
        expect(screen.getByText(/no se encontraron lecturas/i)).toBeInTheDocument();
      });
    });

    it('should clear search and show all readings', async () => {
      renderWithProviders(<HistorialPage />);

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await userEvent.type(searchInput, 'amor');

      await waitFor(() => {
        expect(screen.getAllByTestId('reading-card')).toHaveLength(1);
      });

      await userEvent.clear(searchInput);

      await waitFor(() => {
        expect(screen.getAllByTestId('reading-card')).toHaveLength(mockReadings.length);
      });
    });
  });

  // ===========================================================================
  // Pagination Tests
  // ===========================================================================
  describe('Pagination', () => {
    it('should show pagination controls when there are multiple pages', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText(/página 1 de 3/i)).toBeInTheDocument();
    });

    it('should disable Previous button on first page', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      const prevButton = screen.getByRole('button', { name: /anterior/i });
      expect(prevButton).toBeDisabled();
    });

    it('should enable Next button when there are more pages', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      const nextButton = screen.getByRole('button', { name: /siguiente/i });
      expect(nextButton).not.toBeDisabled();
    });

    it('should change page when Next is clicked', async () => {
      const mockRefetch = vi.fn();
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      const nextButton = screen.getByRole('button', { name: /siguiente/i });
      await userEvent.click(nextButton);

      // The hook should be called with new page number
      await waitFor(() => {
        expect(useReadingsModule.useMyReadings).toHaveBeenCalledWith(2, 10);
      });
    });

    it('should disable Next button on last page', async () => {
      // Simulate being on the last page (page equals totalPages)
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: {
          ...mockPaginatedReadings,
          meta: {
            page: 1,
            limit: 10,
            totalItems: 3,
            totalPages: 1, // Only one page, so we're already on last page
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      // With only 1 page, pagination should not be shown
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should disable Next button when on actual last page', async () => {
      // Start with page 1 of 2
      const mockRefetch = vi.fn();
      vi.mocked(useReadingsModule.useMyReadings)
        .mockReturnValueOnce({
          data: {
            data: mockReadings,
            meta: { page: 1, limit: 10, totalItems: 20, totalPages: 2 },
          },
          isLoading: false,
          isError: false,
          error: null,
          refetch: mockRefetch,
        } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>)
        .mockReturnValueOnce({
          data: {
            data: mockReadings,
            meta: { page: 2, limit: 10, totalItems: 20, totalPages: 2 },
          },
          isLoading: false,
          isError: false,
          error: null,
          refetch: mockRefetch,
        } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      // Click next to go to page 2
      const nextButton = screen.getByRole('button', { name: /siguiente/i });
      expect(nextButton).not.toBeDisabled();
      await userEvent.click(nextButton);

      // After state update and re-render, next should be disabled
      // Since page 2 === totalPages 2
      await waitFor(() => {
        const nextBtn = screen.getByRole('button', { name: /siguiente/i });
        expect(nextBtn).toBeDisabled();
      });
    });

    it('should not show pagination when there is only one page', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: {
          ...mockPaginatedReadings,
          meta: {
            page: 1,
            limit: 10,
            totalItems: 3,
            totalPages: 1,
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Actions Tests
  // ===========================================================================
  describe('Actions', () => {
    beforeEach(() => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);
    });

    it('should navigate to reading detail when View is clicked', async () => {
      renderWithProviders(<HistorialPage />);

      const readingCards = screen.getAllByTestId('reading-card');
      const viewButton = within(readingCards[0]).getByLabelText(/ver lectura/i);
      await userEvent.click(viewButton);

      // First card after sorting by most recent is ID 2 (2025-12-02)
      expect(mockPush).toHaveBeenCalledWith('/historial/2');
    });

    it('should show confirmation modal when Delete is clicked', async () => {
      renderWithProviders(<HistorialPage />);

      const readingCards = screen.getAllByTestId('reading-card');
      const deleteButton = within(readingCards[0]).getByLabelText(/eliminar lectura/i);
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/eliminar lectura/i)).toBeInTheDocument();
      });
    });

    it('should call useDeleteReading when deletion is confirmed', async () => {
      renderWithProviders(<HistorialPage />);

      const readingCards = screen.getAllByTestId('reading-card');
      const deleteButton = within(readingCards[0]).getByLabelText(/eliminar lectura/i);
      await userEvent.click(deleteButton);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await userEvent.click(confirmButton);

      // First card after sorting by most recent is ID 2 (2025-12-02)
      await waitFor(() => {
        expect(mockDeleteReading).toHaveBeenCalledWith(
          2,
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          })
        );
      });
    });

    it('should close modal when Cancel is clicked', async () => {
      renderWithProviders(<HistorialPage />);

      const readingCards = screen.getAllByTestId('reading-card');
      const deleteButton = within(readingCards[0]).getByLabelText(/eliminar lectura/i);
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Error State Tests
  // ===========================================================================
  describe('Error State', () => {
    it('should show error message when fetch fails', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Error al obtener lecturas'),
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      expect(screen.getByText(/error al obtener lecturas/i)).toBeInTheDocument();
    });

    it('should show retry button when error occurs', () => {
      const mockRefetch = vi.fn();
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Error al obtener lecturas'),
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      const retryButton = screen.getByRole('button', { name: /reintentar/i });
      expect(retryButton).toBeInTheDocument();
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

      renderWithProviders(<HistorialPage />);

      const retryButton = screen.getByRole('button', { name: /reintentar/i });
      await userEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Responsive Tests
  // ===========================================================================
  describe('Responsive Design', () => {
    it('should have proper mobile-friendly layout', () => {
      vi.mocked(useReadingsModule.useMyReadings).mockReturnValue({
        data: mockPaginatedReadings,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadingsModule.useMyReadings>);

      renderWithProviders(<HistorialPage />);

      const container = screen.getByTestId('historial-container');
      expect(container).toHaveClass('px-4', 'md:px-8');
    });
  });
});
