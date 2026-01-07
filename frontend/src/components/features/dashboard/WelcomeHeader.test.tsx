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

describe('WelcomeHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display personalized greeting with user name', () => {
    const mockUser: AuthUser = {
      id: 1,
      email: 'user@test.com',
      name: 'María',
      roles: ['consumer'],
      plan: 'free',
      dailyReadingsCount: 0,
      dailyReadingsLimit: 2,
      dailyCardCount: 0,
      dailyCardLimit: 1,
      tarotReadingsCount: 0,
      tarotReadingsLimit: 1,
    };

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
    const mockUser: AuthUser = {
      id: 1,
      email: 'user@test.com',
      name: 'Carlos',
      roles: ['consumer'],
      plan: 'free',
      dailyReadingsCount: 1,
      dailyReadingsLimit: 2,
      dailyCardCount: 0,
      dailyCardLimit: 1,
      tarotReadingsCount: 0,
      tarotReadingsLimit: 1,
    };

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
    const mockUser: AuthUser = {
      id: 1,
      email: 'premium@test.com',
      name: 'Ana',
      roles: ['consumer'],
      plan: 'premium',
      dailyReadingsCount: 2,
      dailyReadingsLimit: 3,
      dailyCardCount: 0,
      dailyCardLimit: 1,
      tarotReadingsCount: 0,
      tarotReadingsLimit: 1,
    };

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
    const mockUser: AuthUser = {
      id: 1,
      email: 'user@test.com',
      name: 'Luis',
      roles: ['consumer'],
      plan: 'free',
      dailyReadingsCount: 1,
      dailyReadingsLimit: 2,
      dailyCardCount: 0,
      dailyCardLimit: 1,
      tarotReadingsCount: 0,
      tarotReadingsLimit: 1,
    };

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
