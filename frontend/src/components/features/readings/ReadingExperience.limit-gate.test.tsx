import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReadingExperience } from './ReadingExperience';
import type { Spread, PredefinedQuestion } from '@/types/reading.types';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('next/image', () => ({
  default: function MockImage({ src, alt }: { src: string; alt: string }) {
    return <img src={src} alt={alt} data-testid="next-image" />;
  },
}));

vi.mock('react-markdown', () => ({
  default: function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-content">{children}</div>;
  },
}));

vi.mock('./FreeReadingUpgradeBanner', () => ({
  default: function MockFreeReadingUpgradeBanner() {
    return <div data-testid="free-reading-upgrade-banner" />;
  },
}));

vi.mock('./UpgradeModal', () => ({
  default: function MockUpgradeModal() {
    return null;
  },
}));

vi.mock('./DailyLimitReachedModal', () => ({
  default: function MockDailyLimitReachedModal() {
    return null;
  },
}));

const mockSpreads: Spread[] = [
  {
    id: 2,
    name: 'Tres Cartas',
    description: 'Pasado, presente, futuro',
    cardCount: 3,
    positions: [
      { position: 1, name: 'Pasado', description: 'Lo que dejaste atrás' },
      { position: 2, name: 'Presente', description: 'Tu situación actual' },
      { position: 3, name: 'Futuro', description: 'Lo que vendrá' },
    ],
    difficulty: 'beginner',
    requiredPlan: 'free',
  },
];

const mockPredefinedQuestions: PredefinedQuestion[] = [
  {
    id: 33,
    questionText: '¿Qué debo saber sobre mi situación actual?',
    categoryId: 1,
    order: 1,
    isActive: true,
    usageCount: 100,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    deletedAt: null,
  },
];

vi.mock('@/hooks/api/useReadings', () => ({
  useMyAvailableSpreads: () => ({ data: mockSpreads, isLoading: false }),
  usePredefinedQuestions: () => ({ data: mockPredefinedQuestions, isLoading: false }),
  useCreateReading: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useRegenerateInterpretation: () => ({ mutate: vi.fn(), isPending: false }),
  useCategories: () => ({ data: [{ id: 1, name: 'Amor', slug: 'amor' }], isLoading: false }),
}));

vi.mock('@/hooks/utils/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// Mutable capabilities mock so each test can set limit-reached / loading state.
const limitReachedCapabilities = {
  dailyCard: { used: 1, limit: 1, canUse: false, resetAt: '2026-07-24T00:00:00Z' },
  tarotReadings: { used: 1, limit: 1, canUse: false, resetAt: '2026-07-24T00:00:00Z' },
  pendulum: {
    used: 0,
    limit: 3,
    canUse: true,
    resetAt: null,
    period: 'monthly' as const,
  },
  canCreateDailyReading: false,
  canCreateTarotReading: false,
  canUseAI: false,
  canUseCustomQuestions: false,
  canUseAdvancedSpreads: false,
  canUseFullDeck: false,
  plan: 'free' as const,
  isAuthenticated: true,
};

const mockUseUserCapabilities = vi.fn();
vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: () => mockUseUserCapabilities(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 1, email: 'test@example.com', plan: 'free' },
    isAuthenticated: true,
  }),
}));

vi.mock('@/hooks/utils/useUserPlanFeatures', () => ({
  useUserPlanFeatures: () => ({
    canUseAI: false,
    canUseCategories: true,
    canUseCustomQuestions: false,
    isPremium: false,
    isFree: true,
    isAnonymous: false,
    dailyReadingsLimit: 1,
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('ReadingExperience - gate de límite en la selección de cartas', () => {
  beforeEach(() => {
    // Default: limit reached, capabilities already loaded.
    mockUseUserCapabilities.mockReturnValue({
      data: limitReachedCapabilities,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('NO muestra la grilla de cartas cuando el límite diario está alcanzado', () => {
    renderWithProviders(<ReadingExperience spreadId={2} questionId={33} customQuestion={null} />);

    // El bug: al volver "atrás" con el límite agotado, se re-mostraba la grilla.
    expect(screen.queryByTestId('card-selection-grid')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('selectable-card')).toHaveLength(0);
  });

  it('muestra el aviso de límite alcanzado en su lugar', () => {
    renderWithProviders(<ReadingExperience spreadId={2} questionId={33} customQuestion={null} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Límite de tiradas alcanzado')).toBeInTheDocument();
  });

  it('muestra spinner (no la grilla) mientras capabilities está cargando, para evitar el flash', () => {
    // Ingreso por URL directa: hasta que capabilities resuelve, no se debe
    // mostrar la grilla (que se vería y desaparecería al aplicar el gate).
    mockUseUserCapabilities.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    renderWithProviders(<ReadingExperience spreadId={2} questionId={33} customQuestion={null} />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    expect(screen.queryByTestId('card-selection-grid')).not.toBeInTheDocument();
    // Tampoco el gate todavía: aún no sabemos si el límite está alcanzado.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
