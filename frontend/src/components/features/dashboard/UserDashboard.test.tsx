import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserDashboard } from './UserDashboard';
import * as useAuthModule from '@/hooks/useAuth';
import * as useUserPlanFeaturesModule from '@/hooks/utils/useUserPlanFeatures';
import * as useUserModule from '@/hooks/api/useUser';
import type { AuthUser, UserProfile } from '@/types';
import type { UseQueryResult } from '@tanstack/react-query';

// Mocks
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/utils/useUserPlanFeatures');
vi.mock('@/hooks/api/useUser');

describe('UserDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render WelcomeHeader', () => {
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

    render(<UserDashboard />);

    expect(screen.getByText('¡Hola, María!')).toBeInTheDocument();
  });

  it('should render QuickActions', () => {
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

    render(<UserDashboard />);

    expect(screen.getByText('Nueva Lectura')).toBeInTheDocument();
    expect(screen.getByText('Historial de Lecturas')).toBeInTheDocument();
    expect(screen.getByText('Carta del Día')).toBeInTheDocument();
  });

  it('should render DidYouKnowSection', () => {
    const mockUser: AuthUser = {
      id: 1,
      email: 'user@test.com',
      name: 'Ana',
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

    render(<UserDashboard />);

    expect(screen.getByText('¿Sabías que...?')).toBeInTheDocument();
  });

  it('should render StatsSection for premium users', () => {
    const mockUser: AuthUser = {
      id: 1,
      email: 'premium@test.com',
      name: 'Premium User',
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

    vi.spyOn(useUserModule, 'useProfile').mockReturnValue({
      data: {
        id: 1,
        email: 'premium@test.com',
        name: 'Premium User',
        roles: ['consumer'],
        plan: 'premium',
        lastLogin: null,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<UserProfile>);

    render(<UserDashboard />);

    expect(screen.getByText('Tus Estadísticas')).toBeInTheDocument();
  });

  it('should NOT render StatsSection for free users', () => {
    const mockUser: AuthUser = {
      id: 1,
      email: 'free@test.com',
      name: 'Free User',
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

    render(<UserDashboard />);

    expect(screen.queryByText('Tus Estadísticas')).not.toBeInTheDocument();
  });

  it('should render UpgradeBanner for free users', () => {
    const mockUser: AuthUser = {
      id: 1,
      email: 'free@test.com',
      name: 'Free User',
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

    render(<UserDashboard />);

    expect(screen.getByText(/Desbloquea interpretaciones personalizadas/i)).toBeInTheDocument();
  });

  it('should NOT render UpgradeBanner for premium users', () => {
    const mockUser: AuthUser = {
      id: 1,
      email: 'premium@test.com',
      name: 'Premium User',
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

    vi.spyOn(useUserModule, 'useProfile').mockReturnValue({
      data: {
        id: 1,
        email: 'premium@test.com',
        name: 'Premium User',
        roles: ['consumer'],
        plan: 'premium',
        lastLogin: null,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<UserProfile>);

    render(<UserDashboard />);

    expect(
      screen.queryByText(/Desbloquea interpretaciones personalizadas/i)
    ).not.toBeInTheDocument();
  });

  it('should open UpgradeModal when upgrade banner is clicked', () => {
    const mockUser: AuthUser = {
      id: 1,
      email: 'free@test.com',
      name: 'Free User',
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

    render(<UserDashboard />);

    // Click on upgrade banner
    const upgradeButton = screen.getByText(/Upgrade a Premium/i);
    fireEvent.click(upgradeButton);

    // Modal should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Desbloquea todo el potencial del Tarot/i)).toBeInTheDocument();
  });

  it('should close UpgradeModal when close button is clicked', async () => {
    const mockUser: AuthUser = {
      id: 1,
      email: 'free@test.com',
      name: 'Free User',
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

    const { container } = render(<UserDashboard />);

    // Open modal
    const upgradeButton = screen.getByText(/Upgrade a Premium/i);
    fireEvent.click(upgradeButton);

    // Modal is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Press Escape to close modal
    fireEvent.keyDown(container, { key: 'Escape', code: 'Escape', keyCode: 27 });

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
