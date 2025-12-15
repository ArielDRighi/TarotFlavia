/**
 * Tests for FavoriteTarotistaButton component
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavoriteTarotistaButton } from './FavoriteTarotistaButton';
import type { UserSubscription } from '@/types';

// Mock hooks
const mockUseMySubscription = vi.fn();
const mockMutate = vi.fn();
const mockUseSetFavoriteTarotista = vi.fn(() => ({
  mutate: mockMutate,
  isPending: false,
}));

vi.mock('@/hooks/api/useSubscriptions', () => ({
  useMySubscription: () => mockUseMySubscription(),
  useSetFavoriteTarotista: () => mockUseSetFavoriteTarotista(),
}));

// Mock authStore
const mockUseAuthStore = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: unknown) => mockUseAuthStore(selector),
}));

// Mock dialog
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

function createMockSubscription(overrides: Partial<UserSubscription> = {}): UserSubscription {
  return {
    id: 1,
    userId: 1,
    plan: 'free',
    favoriteTarotistaId: null,
    lastFavoriteChange: null,
    canChangeFavorite: true,
    daysUntilChange: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('FavoriteTarotistaButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  // ============================================================================
  // Not Logged In
  // ============================================================================

  it('should not render when user is not logged in', () => {
    mockUseAuthStore.mockReturnValue(null);
    mockUseMySubscription.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { container } = render(<FavoriteTarotistaButton tarotistaId={1} tarotistaName="Luna" />, {
      wrapper,
    });

    expect(container.firstChild).toBeNull();
  });

  // ============================================================================
  // Premium User
  // ============================================================================

  it('should not render when user has premium plan', () => {
    mockUseAuthStore.mockReturnValue({ plan: 'premium' });
    mockUseMySubscription.mockReturnValue({
      data: createMockSubscription({ plan: 'premium' }),
      isLoading: false,
    });

    const { container } = render(<FavoriteTarotistaButton tarotistaId={1} tarotistaName="Luna" />, {
      wrapper,
    });

    expect(container.firstChild).toBeNull();
  });

  // ============================================================================
  // Free User - Can Set Favorite
  // ============================================================================

  it('should render "Elegir como favorito" button for free users without favorite', async () => {
    mockUseAuthStore.mockReturnValue({ plan: 'free' });
    mockUseMySubscription.mockReturnValue({
      data: createMockSubscription(),
      isLoading: false,
    });

    render(<FavoriteTarotistaButton tarotistaId={1} tarotistaName="Luna" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /elegir como favorito/i })).toBeInTheDocument();
    });
  });

  it('should open confirmation dialog when clicking "Elegir como favorito"', async () => {
    const user = userEvent.setup();
    mockUseAuthStore.mockReturnValue({ plan: 'free' });
    mockUseMySubscription.mockReturnValue({
      data: createMockSubscription(),
      isLoading: false,
    });

    render(<FavoriteTarotistaButton tarotistaId={1} tarotistaName="Luna" />, { wrapper });

    const button = screen.getByRole('button', { name: /elegir como favorito/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true');
      expect(screen.getByText(/establecer a luna como tu tarotista favorito/i)).toBeInTheDocument();
    });
  });

  it('should call setFavoriteTarotista mutation when confirming', async () => {
    const user = userEvent.setup();
    mockUseAuthStore.mockReturnValue({ plan: 'free' });
    mockUseMySubscription.mockReturnValue({
      data: createMockSubscription(),
      isLoading: false,
    });

    render(<FavoriteTarotistaButton tarotistaId={1} tarotistaName="Luna" />, { wrapper });

    // Click button to open dialog
    const button = screen.getByRole('button', { name: /elegir como favorito/i });
    await user.click(button);

    // Click confirm button
    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    await user.click(confirmButton);

    expect(mockMutate).toHaveBeenCalledWith(1);
  });

  // ============================================================================
  // Free User - Already Favorite
  // ============================================================================

  it('should render "Tu tarotista favorito" badge when already set as favorite', async () => {
    mockUseAuthStore.mockReturnValue({ plan: 'free' });
    mockUseMySubscription.mockReturnValue({
      data: createMockSubscription({
        favoriteTarotistaId: 1,
        canChangeFavorite: false,
        daysUntilChange: 15,
      }),
      isLoading: false,
    });

    render(<FavoriteTarotistaButton tarotistaId={1} tarotistaName="Luna" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/tu tarotista favorito/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Free User - Cooldown Active
  // ============================================================================

  it('should render cooldown message when cannot change favorite', async () => {
    mockUseAuthStore.mockReturnValue({ plan: 'free' });
    mockUseMySubscription.mockReturnValue({
      data: createMockSubscription({
        favoriteTarotistaId: 2,
        canChangeFavorite: false,
        daysUntilChange: 10,
        lastFavoriteChange: '2024-12-05T00:00:00Z',
      }),
      isLoading: false,
    });

    render(<FavoriteTarotistaButton tarotistaId={1} tarotistaName="Luna" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/podrás cambiar en 10 días/i)).toBeInTheDocument();
    });
  });

  it('should not render button when cooldown active and not current favorite', async () => {
    mockUseAuthStore.mockReturnValue({ plan: 'free' });
    mockUseMySubscription.mockReturnValue({
      data: createMockSubscription({
        favoriteTarotistaId: 2,
        canChangeFavorite: false,
        daysUntilChange: 10,
      }),
      isLoading: false,
    });

    render(<FavoriteTarotistaButton tarotistaId={1} tarotistaName="Luna" />, { wrapper });

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /elegir como favorito/i })
      ).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State
  // ============================================================================

  it('should not render while loading subscription data', () => {
    mockUseAuthStore.mockReturnValue({ plan: 'free' });
    mockUseMySubscription.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { container } = render(<FavoriteTarotistaButton tarotistaId={1} tarotistaName="Luna" />, {
      wrapper,
    });

    expect(container.firstChild).toBeNull();
  });
});
