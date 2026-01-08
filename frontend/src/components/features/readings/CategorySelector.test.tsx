/**
 * Tests for CategorySelector component
 *
 * Component refactored to use capabilities system (TASK-REFACTOR-007)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { CategorySelector } from './CategorySelector';
import { useCategories } from '@/hooks/api/useReadings';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';
import type { Category } from '@/types';
import {
  createMockAnonymousCapabilities,
  createMockFreeCapabilities,
  createMockPremiumCapabilities,
} from '@/test/factories/capabilities.factory';

// ============================================================================
// Mocks
// ============================================================================

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/api/useReadings', () => ({
  useCategories: vi.fn(),
}));

vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: vi.fn(),
}));

// Mock child components to simplify testing
vi.mock('./UpgradeModal', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="upgrade-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock('./DailyLimitReachedModal', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="limit-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock('@/components/ui/error-display', () => ({
  ErrorDisplay: ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div data-testid="error-display">
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: ({ title, message }: { title: string; message: string }) => (
    <div data-testid="empty-state">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  ),
}));

// ============================================================================
// Test Data
// ============================================================================

const mockCategories: Category[] = [
  {
    id: 1,
    slug: 'amor-relaciones',
    name: 'Amor y Relaciones',
    description: 'Test category',
    color: '#FF69B4',
    icon: 'heart',
    isActive: true,
  },
  {
    id: 2,
    slug: 'carrera-trabajo',
    name: 'Carrera y Trabajo',
    description: 'Test category',
    color: '#4169E1',
    icon: 'briefcase',
    isActive: true,
  },
];

// ============================================================================
// Setup Helpers
// ============================================================================

function setupMocks({
  capabilities = createMockPremiumCapabilities(),
  categories = mockCategories,
  isLoadingCapabilities = false,
  isLoadingCategories = false,
  categoriesError = null,
}: {
  capabilities?: ReturnType<typeof createMockPremiumCapabilities>;
  categories?: Category[];
  isLoadingCapabilities?: boolean;
  isLoadingCategories?: boolean;
  categoriesError?: Error | null;
} = {}) {
  const mockReplace = vi.fn();
  const mockPush = vi.fn();
  const mockRefetch = vi.fn();

  vi.mocked(useRouter).mockReturnValue({
    replace: mockReplace,
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  } as ReturnType<typeof useRouter>);

  vi.mocked(useUserCapabilities).mockReturnValue({
    data: capabilities,
    isLoading: isLoadingCapabilities ?? false,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useUserCapabilities>);

  vi.mocked(useCategories).mockReturnValue({
    data: categories,
    isLoading: isLoadingCategories ?? false,
    error: categoriesError ?? null,
    refetch: mockRefetch,
  } as unknown as ReturnType<typeof useCategories>);

  return { mockReplace, mockPush, mockRefetch };
}

// ============================================================================
// Tests
// ============================================================================

describe('CategorySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // Access Control Tests
  // ==========================================================================

  describe('Access Control', () => {
    it('should redirect FREE users to spread selector', () => {
      const { mockReplace } = setupMocks({
        capabilities: createMockFreeCapabilities(),
      });

      render(<CategorySelector />);

      waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/ritual/tirada');
      });
    });

    it('should redirect ANONYMOUS users to spread selector', () => {
      const { mockReplace } = setupMocks({
        capabilities: createMockAnonymousCapabilities(),
      });

      render(<CategorySelector />);

      waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/ritual/tirada');
      });
    });

    it('should allow PREMIUM users to access category selector', () => {
      const { mockReplace } = setupMocks({
        capabilities: createMockPremiumCapabilities(),
      });

      render(<CategorySelector />);

      // Should not redirect
      expect(mockReplace).not.toHaveBeenCalled();

      // Should show categories grid
      expect(screen.getByTestId('categories-grid')).toBeInTheDocument();
    });

    it('should NOT redirect when loading capabilities', () => {
      const { mockReplace } = setupMocks({
        capabilities: undefined,
        isLoadingCapabilities: true,
      });

      render(<CategorySelector />);

      // Should not redirect while loading
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Loading State Tests
  // ==========================================================================

  describe('Loading State', () => {
    it('should show skeleton cards while loading categories', () => {
      setupMocks({
        isLoadingCategories: true,
        categories: [],
      });

      render(<CategorySelector />);

      const skeletons = screen.getAllByTestId('skeleton-card');
      expect(skeletons).toHaveLength(6);
    });

    it('should show categories after loading completes', () => {
      setupMocks({
        isLoadingCategories: false,
        categories: mockCategories,
      });

      render(<CategorySelector />);

      expect(screen.getByText('Amor y Relaciones')).toBeInTheDocument();
      expect(screen.getByText('Carrera y Trabajo')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Error State Tests
  // ==========================================================================

  describe('Error State', () => {
    it('should show error display when categories fail to load', () => {
      const error = new Error('Network error');
      setupMocks({
        isLoadingCategories: false,
        categoriesError: error,
        categories: [],
      });

      render(<CategorySelector />);

      expect(screen.getByTestId('error-display')).toBeInTheDocument();
      expect(
        screen.getByText('Error al cargar las categorías. Por favor, intenta de nuevo.')
      ).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', async () => {
      const error = new Error('Network error');
      const { mockRefetch } = setupMocks({
        isLoadingCategories: false,
        categoriesError: error,
        categories: [],
      });

      render(<CategorySelector />);

      const retryButton = screen.getByText('Retry');
      retryButton.click();

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // Empty State Tests
  // ==========================================================================

  describe('Empty State', () => {
    it('should show empty state when no categories exist', () => {
      setupMocks({
        isLoadingCategories: false,
        categories: [],
      });

      render(<CategorySelector />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Sin categorías')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Category Navigation Tests
  // ==========================================================================

  describe('Category Navigation', () => {
    it('should navigate to questions page when PREMIUM user clicks category', () => {
      const { mockPush } = setupMocks({
        capabilities: createMockPremiumCapabilities(),
        categories: mockCategories,
      });

      render(<CategorySelector />);

      const categoryCard = screen.getAllByTestId('category-card')[0];
      categoryCard.click();

      expect(mockPush).toHaveBeenCalledWith('/ritual/preguntas?categoryId=1');
    });

    it('should use correct category ID in navigation', () => {
      const { mockPush } = setupMocks({
        capabilities: createMockPremiumCapabilities(),
        categories: mockCategories,
      });

      render(<CategorySelector />);

      const categoryCards = screen.getAllByTestId('category-card');

      // Click first category
      categoryCards[0].click();
      expect(mockPush).toHaveBeenCalledWith('/ritual/preguntas?categoryId=1');

      // Click second category
      categoryCards[1].click();
      expect(mockPush).toHaveBeenCalledWith('/ritual/preguntas?categoryId=2');
    });
  });
});
