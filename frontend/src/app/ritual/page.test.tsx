import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import RitualPage from './page';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/hooks/useAuth';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';

// Mock all dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: vi.fn(),
}));

vi.mock('@/components/features/readings/CategorySelector', () => ({
  CategorySelector: () => <div data-testid="category-selector">Category Selector</div>,
}));

vi.mock('@/components/features/readings/ReadingLimitReached', () => ({
  ReadingLimitReached: () => <div data-testid="limit-reached-modal">Reading Limit Reached</div>,
}));

vi.mock('@/components/features/encyclopedia', () => ({
  EncyclopediaInfoWidget: ({ slug }: { slug: string }) => (
    <div data-testid="encyclopedia-info-widget" data-slug={slug} />
  ),
}));

describe('RitualPage', () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });

    (useRequireAuth as Mock).mockReturnValue({ isLoading: false });
  });

  describe('Authentication Protection', () => {
    it('should call useRequireAuth to protect the route', () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 1, plan: 'premium' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useUserCapabilities as Mock).mockReturnValue({
        data: {
          canCreateTarotReading: true,
          canUseCustomQuestions: true,
        },
        isLoading: false,
      });

      render(<RitualPage />);

      expect(useRequireAuth).toHaveBeenCalledWith({
        redirectTo: '/registro',
        redirectQuery: { message: 'register-for-readings' },
      });
    });
  });

  describe('Loading States', () => {
    it('should not show category selector or limit modal when user is null', () => {
      (useAuth as Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      (useUserCapabilities as Mock).mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<RitualPage />);

      expect(screen.queryByTestId('category-selector')).not.toBeInTheDocument();
      expect(screen.queryByTestId('limit-reached-modal')).not.toBeInTheDocument();
    });

    it('should not show category selector or limit modal when capabilities are loading', () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 1, plan: 'premium' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useUserCapabilities as Mock).mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<RitualPage />);

      expect(screen.queryByTestId('category-selector')).not.toBeInTheDocument();
      expect(screen.queryByTestId('limit-reached-modal')).not.toBeInTheDocument();
    });
  });

  describe('FREE User Redirection', () => {
    it('should redirect FREE users to /ritual/tirada', async () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 1, plan: 'free' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useUserCapabilities as Mock).mockReturnValue({
        data: {
          canCreateTarotReading: true,
          canUseCustomQuestions: false,
        },
        isLoading: false,
      });

      render(<RitualPage />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/ritual/tirada');
      });
    });

    it('should redirect when user can create readings but not use custom questions', async () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 2, plan: 'free' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useUserCapabilities as Mock).mockReturnValue({
        data: {
          canCreateTarotReading: true,
          canUseCustomQuestions: false,
        },
        isLoading: false,
      });

      render(<RitualPage />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/ritual/tirada');
      });
    });
  });

  describe('Limit Reached Modal', () => {
    it('should show ReadingLimitReached when user cannot create tarot readings', () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 1, plan: 'free' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useUserCapabilities as Mock).mockReturnValue({
        data: {
          canCreateTarotReading: false,
          canUseCustomQuestions: false,
        },
        isLoading: false,
      });

      render(<RitualPage />);

      expect(screen.getByTestId('limit-reached-modal')).toBeInTheDocument();
    });

    it('should show limit modal even for premium users who reached limit', () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 2, plan: 'premium' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useUserCapabilities as Mock).mockReturnValue({
        data: {
          canCreateTarotReading: false,
          canUseCustomQuestions: true,
        },
        isLoading: false,
      });

      render(<RitualPage />);

      expect(screen.getByTestId('limit-reached-modal')).toBeInTheDocument();
    });
  });

  describe('PREMIUM User - Category Selector', () => {
    it('should show CategorySelector for PREMIUM users who can create readings', () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 1, plan: 'premium' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useUserCapabilities as Mock).mockReturnValue({
        data: {
          canCreateTarotReading: true,
          canUseCustomQuestions: true,
        },
        isLoading: false,
      });

      render(<RitualPage />);

      expect(screen.getByTestId('category-selector')).toBeInTheDocument();
    });

    it('should NOT redirect PREMIUM users with custom questions capability', () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 1, plan: 'premium' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useUserCapabilities as Mock).mockReturnValue({
        data: {
          canCreateTarotReading: true,
          canUseCustomQuestions: true,
        },
        isLoading: false,
      });

      render(<RitualPage />);

      expect(mockReplace).not.toHaveBeenCalled();
      expect(screen.getByTestId('category-selector')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined capabilities data', () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 1, plan: 'free' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useUserCapabilities as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      render(<RitualPage />);

      // When capabilities are undefined, defaults to false, so should show limit modal
      expect(screen.getByTestId('limit-reached-modal')).toBeInTheDocument();
    });

    it('should not redirect when capabilities are still loading', () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 1, plan: 'free' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useUserCapabilities as Mock).mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<RitualPage />);

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
