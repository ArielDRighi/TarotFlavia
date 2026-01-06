import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';

import SpreadSelectorPage from './page';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useMyAvailableSpreads } from '@/hooks/api/useReadings';
import { useAuthStore } from '@/stores/authStore';

// Mock modules
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(),
}));

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: vi.fn(),
}));

vi.mock('@/hooks/api/useReadings', () => ({
  useMyAvailableSpreads: vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock data
const mockSpreads = [
  {
    id: 1,
    name: 'Respuesta Rápida',
    description: 'Una carta para una respuesta directa',
    cardCount: 1,
    positions: [{ position: 1, name: 'Respuesta', description: 'Tu respuesta' }],
    difficulty: 'beginner',
  },
];

const mockUser = {
  id: 1,
  email: 'test@test.com',
  name: 'Test User',
  roles: ['USER'],
  plan: 'free',
  dailyReadingsCount: 0,
  dailyReadingsLimit: 3,
};

describe('SpreadSelectorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRequireAuth as Mock).mockReturnValue({ isLoading: false });
    (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUser });
    (useMyAvailableSpreads as Mock).mockReturnValue({
      data: mockSpreads,
      isLoading: false,
      error: null,
    });
  });

  it('should render the SpreadSelector component', () => {
    const mockSearchParams = new URLSearchParams('categoryId=1&questionId=1');
    (useSearchParams as Mock).mockReturnValue(mockSearchParams);

    render(<SpreadSelectorPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /elige tu tipo de consulta/i })
    ).toBeInTheDocument();
  });

  it('should pass categoryId from search params for PREMIUM users', () => {
    const mockSearchParams = new URLSearchParams('categoryId=1&questionId=1');
    (useSearchParams as Mock).mockReturnValue(mockSearchParams);
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: { ...mockUser, plan: 'premium' },
    });

    render(<SpreadSelectorPage />);

    // Verify breadcrumb link includes categoryId for PREMIUM users
    const questionLink = screen.getByRole('link', { name: /pregunta/i });
    expect(questionLink).toHaveAttribute('href', '/ritual/preguntas?categoryId=1');
  });

  it('should pass questionId from search params', () => {
    const mockSearchParams = new URLSearchParams('categoryId=1&questionId=5');
    (useSearchParams as Mock).mockReturnValue(mockSearchParams);

    render(<SpreadSelectorPage />);

    // Component should render without errors when questionId is provided
    expect(screen.getByText('Respuesta Rápida')).toBeInTheDocument();
  });

  it('should pass customQuestion from search params', () => {
    const mockSearchParams = new URLSearchParams(
      'categoryId=1&customQuestion=Mi%20pregunta%20personalizada'
    );
    (useSearchParams as Mock).mockReturnValue(mockSearchParams);

    render(<SpreadSelectorPage />);

    // Component should render without errors when customQuestion is provided
    expect(screen.getByText('Respuesta Rápida')).toBeInTheDocument();
  });

  it('should show loading fallback when Suspense is loading', () => {
    const mockSearchParams = new URLSearchParams('categoryId=1&questionId=1');
    (useSearchParams as Mock).mockReturnValue(mockSearchParams);
    (useRequireAuth as Mock).mockReturnValue({ isLoading: true });
    (useMyAvailableSpreads as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<SpreadSelectorPage />);

    // Skeleton loaders should be shown
    expect(screen.getAllByTestId('skeleton-spread-card')).toHaveLength(4);
  });

  it('should handle missing search params gracefully for FREE users', () => {
    const mockSearchParams = new URLSearchParams('');
    (useSearchParams as Mock).mockReturnValue(mockSearchParams);
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: { ...mockUser, plan: 'free' },
    });

    render(<SpreadSelectorPage />);

    // FREE users should see spreads even without question
    expect(screen.getByText('Respuesta Rápida')).toBeInTheDocument();
  });

  it('should handle missing search params gracefully for PREMIUM users', () => {
    const mockSearchParams = new URLSearchParams('');
    (useSearchParams as Mock).mockReturnValue(mockSearchParams);
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: { ...mockUser, plan: 'PREMIUM' },
    });

    render(<SpreadSelectorPage />);

    // PREMIUM users can also see spreads without question (for general readings)
    expect(screen.getByText('Respuesta Rápida')).toBeInTheDocument();
  });
});
