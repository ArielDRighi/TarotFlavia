import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import DailyReadingHistoryPage from './page';
import { createMockDailyReadingHistoryItem, createMockUser } from '@/test/factories';
import type { PaginatedDailyReadings } from '@/types';

// Create mock functions
const mockPush = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date: Date, formatStr: string) => {
    if (formatStr === "EEEE d 'de' MMMM") {
      return 'Lunes 2 de Diciembre';
    }
    return '02/12/2025';
  }),
}));

// Mock date-fns locale
vi.mock('date-fns/locale', () => ({
  es: {},
}));

// Mock hooks
const mockUseDailyReadingHistory = vi.fn();
const mockUseAuth = vi.fn();
const mockUseRequireAuth = vi.fn();

vi.mock('@/hooks/api/useDailyReading', () => ({
  useDailyReadingHistory: (page: number, limit: number) => mockUseDailyReadingHistory(page, limit),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => mockUseRequireAuth(),
}));

// Mock toast
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Test wrapper with QueryClient
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// Factory for paginated response
function createMockPaginatedResponse(
  items: ReturnType<typeof createMockDailyReadingHistoryItem>[],
  page: number = 1,
  totalPages: number = 1
): PaginatedDailyReadings {
  return {
    items,
    total: items.length,
    page,
    limit: 10,
    totalPages,
  };
}

describe('DailyReadingHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks: authenticated user
    mockUseRequireAuth.mockReturnValue({ isLoading: false });
    mockUseAuth.mockReturnValue({
      user: createMockUser(),
      isAuthenticated: true,
      isLoading: false,
    });
  });

  describe('Rendering', () => {
    it('should render the page title', () => {
      mockUseDailyReadingHistory.mockReturnValue({
        data: createMockPaginatedResponse([]),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyReadingHistoryPage />);

      expect(screen.getByText('Tu viaje diario')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockUseDailyReadingHistory.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<DailyReadingHistoryPage />);

      expect(screen.getByTestId('history-loading')).toBeInTheDocument();
    });

    it('should show error state', () => {
      mockUseDailyReadingHistory.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Error loading history'),
      });

      renderWithProviders(<DailyReadingHistoryPage />);

      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    it('should show empty state when no readings', () => {
      mockUseDailyReadingHistory.mockReturnValue({
        data: createMockPaginatedResponse([]),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyReadingHistoryPage />);

      expect(screen.getByText('Aún no has consultado tu carta diaria')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ver carta de hoy/i })).toBeInTheDocument();
    });

    it('should render daily reading cards', () => {
      const readings = [
        createMockDailyReadingHistoryItem({ id: 1, cardName: 'El Loco' }),
        createMockDailyReadingHistoryItem({ id: 2, cardName: 'El Mago' }),
      ];

      mockUseDailyReadingHistory.mockReturnValue({
        data: createMockPaginatedResponse(readings),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyReadingHistoryPage />);

      expect(screen.getByText('El Loco')).toBeInTheDocument();
      expect(screen.getByText('El Mago')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should navigate to daily reading page when "Ver carta de hoy" is clicked', async () => {
      const user = userEvent.setup();

      mockUseDailyReadingHistory.mockReturnValue({
        data: createMockPaginatedResponse([]),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyReadingHistoryPage />);

      await user.click(screen.getByRole('button', { name: /ver carta de hoy/i }));

      expect(mockPush).toHaveBeenCalledWith('/carta-del-dia');
    });
  });

  describe('Pagination', () => {
    it('should show pagination controls when multiple pages', () => {
      const readings = Array.from({ length: 10 }, (_, i) =>
        createMockDailyReadingHistoryItem({ id: i + 1 })
      );

      mockUseDailyReadingHistory.mockReturnValue({
        data: createMockPaginatedResponse(readings, 1, 3),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyReadingHistoryPage />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should not show pagination when single page', () => {
      const readings = [createMockDailyReadingHistoryItem({ id: 1 })];

      mockUseDailyReadingHistory.mockReturnValue({
        data: createMockPaginatedResponse(readings, 1, 1),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyReadingHistoryPage />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should call useDailyReadingHistory with page and limit', () => {
      mockUseDailyReadingHistory.mockReturnValue({
        data: createMockPaginatedResponse([]),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyReadingHistoryPage />);

      expect(mockUseDailyReadingHistory).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('Authentication', () => {
    it('should show loading when auth is loading', () => {
      mockUseRequireAuth.mockReturnValue({ isLoading: true });

      mockUseDailyReadingHistory.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyReadingHistoryPage />);

      expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
    });
  });
});
