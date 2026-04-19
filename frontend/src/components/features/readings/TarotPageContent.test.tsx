/**
 * Tests for TarotPageContent component
 *
 * Tests the orchestration logic for the tarot page,
 * including FREE mode category selector rendering (T-FR-F01).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { TarotPageContent } from './TarotPageContent';
import { useAuth } from '@/hooks/useAuth';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';
import {
  createMockFreeCapabilities,
  createMockPremiumCapabilities,
  createMockCapabilitiesWithTarotReadingLimitReached,
} from '@/test/factories/capabilities.factory';
import { createMockAuthUser } from '@/test/factories/authUser.factory';

// ============================================================================
// Mocks
// ============================================================================

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: vi.fn(),
}));

// Mock CategorySelector to verify which props it receives
vi.mock('./CategorySelector', () => ({
  CategorySelector: ({ freeModeCategories }: { freeModeCategories?: string[] }) => (
    <div
      data-testid="category-selector"
      data-free-mode={freeModeCategories ? 'true' : 'false'}
      data-free-mode-categories={freeModeCategories?.join(',') ?? ''}
    >
      CategorySelector Mock
    </div>
  ),
}));

vi.mock('./ReadingLimitReached', () => ({
  ReadingLimitReached: () => <div data-testid="reading-limit-reached">Límite alcanzado</div>,
}));

// ============================================================================
// Setup Helper
// ============================================================================

function setupMocks({
  capabilities = createMockPremiumCapabilities(),
  isCapabilitiesLoading = false,
  user = createMockAuthUser(),
}: {
  capabilities?: ReturnType<typeof createMockPremiumCapabilities> | undefined;
  isCapabilitiesLoading?: boolean;
  user?: ReturnType<typeof createMockAuthUser> | null;
} = {}) {
  const mockReplace = vi.fn();
  const mockPush = vi.fn();

  vi.mocked(useRouter).mockReturnValue({
    replace: mockReplace,
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  } as ReturnType<typeof useRouter>);

  vi.mocked(useAuth).mockReturnValue({
    user,
    isAuthenticated: user !== null,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
  });

  vi.mocked(useUserCapabilities).mockReturnValue({
    data: capabilities,
    isLoading: isCapabilitiesLoading,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useUserCapabilities>);

  return { mockReplace, mockPush };
}

// ============================================================================
// Tests
// ============================================================================

describe('TarotPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // Loading & Auth Guard Tests
  // ==========================================================================

  describe('Loading and Auth Guard', () => {
    it('should render null when user is not loaded yet', () => {
      setupMocks({ user: null });
      const { container } = render(<TarotPageContent />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should render null while capabilities are loading', () => {
      setupMocks({ isCapabilitiesLoading: true });
      const { container } = render(<TarotPageContent />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  // ==========================================================================
  // Limit Reached Tests
  // ==========================================================================

  describe('Limit Reached', () => {
    it('should show ReadingLimitReached when user cannot create tarot readings', () => {
      setupMocks({
        capabilities: createMockCapabilitiesWithTarotReadingLimitReached('free'),
      });

      render(<TarotPageContent />);

      expect(screen.getByTestId('reading-limit-reached')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // PREMIUM Mode Tests
  // ==========================================================================

  describe('PREMIUM Mode', () => {
    it('should render CategorySelector without freeModeCategories for PREMIUM users', () => {
      setupMocks({ capabilities: createMockPremiumCapabilities() });

      render(<TarotPageContent />);

      const selector = screen.getByTestId('category-selector');
      expect(selector).toBeInTheDocument();
      expect(selector.dataset.freeMode).toBe('false');
    });
  });

  // ==========================================================================
  // FREE Mode Tests (T-FR-F01)
  // ==========================================================================

  describe('FREE Mode (T-FR-F01)', () => {
    it('should render CategorySelector with freeModeCategories for FREE users', () => {
      setupMocks({ capabilities: createMockFreeCapabilities() });

      render(<TarotPageContent />);

      const selector = screen.getByTestId('category-selector');
      expect(selector).toBeInTheDocument();
      expect(selector.dataset.freeMode).toBe('true');
    });

    it('should pass the 3 correct FREE slugs to CategorySelector', () => {
      setupMocks({ capabilities: createMockFreeCapabilities() });

      render(<TarotPageContent />);

      const selector = screen.getByTestId('category-selector');
      const passedSlugs = selector.dataset.freeModeCategories?.split(',') ?? [];

      expect(passedSlugs).toContain('amor-relaciones');
      expect(passedSlugs).toContain('salud-bienestar');
      expect(passedSlugs).toContain('dinero-finanzas');
      expect(passedSlugs).toHaveLength(3);
    });

    it('should NOT redirect FREE user to /tarot/tirada (routing is now handled by CategorySelector)', () => {
      const { mockReplace } = setupMocks({ capabilities: createMockFreeCapabilities() });

      render(<TarotPageContent />);

      expect(mockReplace).not.toHaveBeenCalledWith('/tarot/tirada');
    });

    it('should show CategorySelector (not null) for FREE user with canCreateTarotReading', () => {
      setupMocks({ capabilities: createMockFreeCapabilities() });

      render(<TarotPageContent />);

      expect(screen.getByTestId('category-selector')).toBeInTheDocument();
    });
  });
});
