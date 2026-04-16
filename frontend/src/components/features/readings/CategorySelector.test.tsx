/**
 * Tests for CategorySelector component
 *
 * Component refactored to use capabilities system (TASK-REFACTOR-007)
 * Extended with FREE mode support (T-FR-F01)
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

/** 6 categorías simulando el catálogo completo */
const mockAllCategories: Category[] = [
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
  {
    id: 3,
    slug: 'dinero-finanzas',
    name: 'Dinero y Finanzas',
    description: 'Test category',
    color: '#28A745',
    icon: 'dollar',
    isActive: true,
  },
  {
    id: 4,
    slug: 'salud-bienestar',
    name: 'Salud y Bienestar',
    description: 'Test category',
    color: '#FD7E14',
    icon: 'activity',
    isActive: true,
  },
  {
    id: 5,
    slug: 'crecimiento-espiritual',
    name: 'Crecimiento Espiritual',
    description: 'Test category',
    color: '#6F42C1',
    icon: 'sparkles',
    isActive: true,
  },
  {
    id: 6,
    slug: 'consulta-general',
    name: 'Consulta General',
    description: 'Test category',
    color: '#FFC107',
    icon: 'star',
    isActive: true,
  },
];

/** Slugs permitidos para usuarios FREE */
const FREE_MODE_SLUGS = ['amor-relaciones', 'salud-bienestar', 'dinero-finanzas'];

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
  capabilities?: ReturnType<typeof createMockPremiumCapabilities> | undefined;
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
    it('should redirect FREE users to spread selector (can create readings but not use categories)', async () => {
      const { mockReplace } = setupMocks({
        capabilities: createMockFreeCapabilities(),
      });

      render(<CategorySelector />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/tarot/tirada');
      });
    });

    it('should redirect ANONYMOUS users to home (they cannot create tarot readings)', async () => {
      const { mockReplace } = setupMocks({
        capabilities: createMockAnonymousCapabilities(),
      });

      render(<CategorySelector />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/');
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

      expect(mockPush).toHaveBeenCalledWith('/tarot/preguntas?categoryId=1');
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
      expect(mockPush).toHaveBeenCalledWith('/tarot/preguntas?categoryId=1');

      // Click second category
      categoryCards[1].click();
      expect(mockPush).toHaveBeenCalledWith('/tarot/preguntas?categoryId=2');
    });
  });

  // ==========================================================================
  // FREE Mode — Filtering Tests
  // ==========================================================================

  describe('FREE Mode — Filtering', () => {
    it('should show only 3 categories when freeModeCategories prop is provided', () => {
      setupMocks({
        capabilities: createMockPremiumCapabilities(),
        categories: mockAllCategories,
      });

      render(<CategorySelector freeModeCategories={FREE_MODE_SLUGS} />);

      const categoryCards = screen.getAllByTestId('category-card');
      expect(categoryCards).toHaveLength(3);
    });

    it('should display only the allowed FREE categories by slug', () => {
      setupMocks({
        capabilities: createMockPremiumCapabilities(),
        categories: mockAllCategories,
      });

      render(<CategorySelector freeModeCategories={FREE_MODE_SLUGS} />);

      expect(screen.getByText('Amor y Relaciones')).toBeInTheDocument();
      expect(screen.getByText('Salud y Bienestar')).toBeInTheDocument();
      expect(screen.getByText('Dinero y Finanzas')).toBeInTheDocument();

      // Categorías no permitidas para FREE no deben aparecer
      expect(screen.queryByText('Carrera y Trabajo')).not.toBeInTheDocument();
      expect(screen.queryByText('Crecimiento Espiritual')).not.toBeInTheDocument();
      expect(screen.queryByText('Consulta General')).not.toBeInTheDocument();
    });

    it('should show all 6 categories when freeModeCategories prop is NOT provided (no regression)', () => {
      setupMocks({
        capabilities: createMockPremiumCapabilities(),
        categories: mockAllCategories,
      });

      render(<CategorySelector />);

      const categoryCards = screen.getAllByTestId('category-card');
      expect(categoryCards).toHaveLength(6);
    });

    it('should show upgrade banner when freeModeCategories prop is provided', () => {
      setupMocks({
        capabilities: createMockPremiumCapabilities(),
        categories: mockAllCategories,
      });

      render(<CategorySelector freeModeCategories={FREE_MODE_SLUGS} />);

      expect(screen.getByTestId('free-upgrade-banner')).toBeInTheDocument();
      expect(screen.getByText('¿Querés más categorías? Actualizá a Premium.')).toBeInTheDocument();
    });

    it('should NOT show upgrade banner when freeModeCategories prop is NOT provided', () => {
      setupMocks({
        capabilities: createMockPremiumCapabilities(),
        categories: mockAllCategories,
      });

      render(<CategorySelector />);

      expect(screen.queryByTestId('free-upgrade-banner')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // FREE Mode — Navigation Tests
  // ==========================================================================

  describe('FREE Mode — Navigation', () => {
    it('should navigate to /tarot/tirada?categoryId=X when FREE mode and category is clicked', () => {
      const { mockPush } = setupMocks({
        capabilities: createMockFreeCapabilities(),
        categories: mockAllCategories,
      });

      render(<CategorySelector freeModeCategories={FREE_MODE_SLUGS} />);

      const categoryCard = screen.getAllByTestId('category-card')[0];
      categoryCard.click();

      // FREE mode navega a tirada (sin pasar por preguntas)
      expect(mockPush).toHaveBeenCalledWith('/tarot/tirada?categoryId=1');
    });

    it('should navigate to correct categoryId for each FREE category', () => {
      const { mockPush } = setupMocks({
        capabilities: createMockFreeCapabilities(),
        categories: mockAllCategories,
      });

      render(<CategorySelector freeModeCategories={FREE_MODE_SLUGS} />);

      const categoryCards = screen.getAllByTestId('category-card');
      expect(categoryCards).toHaveLength(3);

      // Clic en "Amor y Relaciones" (id=1)
      categoryCards[0].click();
      expect(mockPush).toHaveBeenCalledWith('/tarot/tirada?categoryId=1');
    });

    it('should NOT redirect FREE user to /tarot/tirada (no redirect effect) when freeModeCategories is provided', async () => {
      const { mockReplace } = setupMocks({
        capabilities: createMockFreeCapabilities(),
        categories: mockAllCategories,
      });

      render(<CategorySelector freeModeCategories={FREE_MODE_SLUGS} />);

      // Con freeModeCategories, el selector se muestra sin redirigir
      await waitFor(() => {
        expect(mockReplace).not.toHaveBeenCalled();
      });
    });
  });
});
