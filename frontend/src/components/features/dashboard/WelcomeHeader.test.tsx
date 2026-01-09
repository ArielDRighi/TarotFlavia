import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WelcomeHeader } from './WelcomeHeader';
import * as useAuthModule from '@/hooks/useAuth';
import * as useUserPlanFeaturesModule from '@/hooks/utils/useUserPlanFeatures';
import type { AuthUser } from '@/types';

// Mock useAuth hook
vi.mock('@/hooks/useAuth');
// Mock useUserPlanFeatures hook
vi.mock('@/hooks/utils/useUserPlanFeatures');

// Helper to create AuthUser mock without limits fields
function createMockAuthUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    id: 1,
    email: 'user@test.com',
    name: 'Test User',
    roles: ['consumer'],
    plan: 'free',
    profilePicture: null,
    ...overrides,
  };
}


describe('WelcomeHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display personalized greeting with user name', () => {
    const mockUser = createMockAuthUser({ name: 'María', plan: 'free' });

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    vi.spyOn(useUserPlanFeaturesModule, 'useUserPlanFeatures').mockReturnValue({
      plan: 'free',
      planLabel: 'GRATUITO',
      canUseAI: false,
      canUseCategories: false,
      canUseCustomQuestions: false,
      canShare: true,
      isPremium: false,
      isFree: true,
      isAnonymous: false,
      dailyReadingsLimit: 2,
    });

    render(<WelcomeHeader />);

    expect(screen.getByText('¡Hola, María!')).toBeInTheDocument();
  });

  it('should display plan badge with correct label for free users', () => {
    const mockUser = createMockAuthUser({ name: 'Carlos', plan: 'free' });

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    vi.spyOn(useUserPlanFeaturesModule, 'useUserPlanFeatures').mockReturnValue({
      plan: 'free',
      planLabel: 'GRATUITO',
      canUseAI: false,
      canUseCategories: false,
      canUseCustomQuestions: false,
      canShare: true,
      isPremium: false,
      isFree: true,
      isAnonymous: false,
      dailyReadingsLimit: 2,
    });

    render(<WelcomeHeader />);

    expect(screen.getByText('GRATUITO')).toBeInTheDocument();
  });

  it('should display plan badge with correct label for premium users', () => {
    const mockUser = createMockAuthUser({ name: 'Ana', plan: 'premium' });

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    vi.spyOn(useUserPlanFeaturesModule, 'useUserPlanFeatures').mockReturnValue({
      plan: 'premium',
      planLabel: 'PREMIUM',
      canUseAI: true,
      canUseCategories: true,
      canUseCustomQuestions: true,
      canShare: true,
      isPremium: true,
      isFree: false,
      isAnonymous: false,
      dailyReadingsLimit: 3,
    });

    render(<WelcomeHeader />);

    expect(screen.getByText('PREMIUM')).toBeInTheDocument();
  });

  it('should display link to profile page', () => {
    const mockUser = createMockAuthUser({ name: 'Luis', plan: 'free' });

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    vi.spyOn(useUserPlanFeaturesModule, 'useUserPlanFeatures').mockReturnValue({
      plan: 'free',
      planLabel: 'GRATUITO',
      canUseAI: false,
      canUseCategories: false,
      canUseCustomQuestions: false,
      canShare: true,
      isPremium: false,
      isFree: true,
      isAnonymous: false,
      dailyReadingsLimit: 2,
    });

    render(<WelcomeHeader />);

    const profileLink = screen.getByText('Ver perfil');
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('href', '/perfil');
  });

  it('should handle missing user gracefully', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    vi.spyOn(useUserPlanFeaturesModule, 'useUserPlanFeatures').mockReturnValue({
      plan: 'anonymous',
      planLabel: 'ANÓNIMO',
      canUseAI: false,
      canUseCategories: false,
      canUseCustomQuestions: false,
      canShare: false,
      isPremium: false,
      isFree: false,
      isAnonymous: true,
      dailyReadingsLimit: 1,
    });

    render(<WelcomeHeader />);

    // Should show fallback name
    expect(screen.getByText('¡Hola, Usuario!')).toBeInTheDocument();
  });
});
