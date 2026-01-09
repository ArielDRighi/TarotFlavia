import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserDashboard } from './UserDashboard';
import * as useAuthModule from '@/hooks/useAuth';
import * as useUserPlanFeaturesModule from '@/hooks/utils/useUserPlanFeatures';
import * as useUserModule from '@/hooks/api/useUser';
import * as useUserCapabilitiesModule from '@/hooks/api/useUserCapabilities';
import type { AuthUser, UserProfile, UserCapabilities } from '@/types';
import type { UseQueryResult } from '@tanstack/react-query';

// Mocks
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/utils/useUserPlanFeatures');
vi.mock('@/hooks/api/useUser');
vi.mock('@/hooks/api/useUserCapabilities');

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

describe('UserDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render WelcomeHeader', () => {
    const mockUser = createMockAuthUser({ name: 'María' });

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
    });

    render(<UserDashboard />);

    expect(screen.getByText('¡Hola, María!')).toBeInTheDocument();
  });

  it('should render QuickActions', () => {
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
    });

    render(<UserDashboard />);

    expect(screen.getByText('Nueva Lectura')).toBeInTheDocument();
    expect(screen.getByText('Historial de Lecturas')).toBeInTheDocument();
    expect(screen.getByText('Carta del Día')).toBeInTheDocument();
  });

  it('should render DidYouKnowSection', () => {
    const mockUser = createMockAuthUser({ name: 'Ana', plan: 'free' });

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
    });

    render(<UserDashboard />);

    expect(screen.getByText('¿Sabías que...?')).toBeInTheDocument();
  });

  it('should render StatsSection for premium users', () => {
    const mockUser = createMockAuthUser({ name: 'Premium User', plan: 'premium' });

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

    vi.spyOn(useUserCapabilitiesModule, 'useUserCapabilities').mockReturnValue({
      data: {
        dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        tarotReadings: { used: 1, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        canCreateDailyReading: true,
        canCreateTarotReading: true,
        canUseAI: true,
        canUseCustomQuestions: true,
        canUseAdvancedSpreads: true,
        plan: 'premium',
        isAuthenticated: true,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<UserCapabilities>);

    render(<UserDashboard />);

    expect(screen.getByText('Tus Estadísticas')).toBeInTheDocument();
  });

  it('should NOT render StatsSection for free users', () => {
    const mockUser = createMockAuthUser({ name: 'Free User', plan: 'free' });

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
    });

    render(<UserDashboard />);

    expect(screen.queryByText('Tus Estadísticas')).not.toBeInTheDocument();
  });

  it('should render UpgradeBanner for free users', () => {
    const mockUser = createMockAuthUser({ name: 'Free User', plan: 'free' });

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
    });

    render(<UserDashboard />);

    expect(screen.getByText(/Desbloquea interpretaciones personalizadas/i)).toBeInTheDocument();
  });

  it('should NOT render UpgradeBanner for premium users', () => {
    const mockUser = createMockAuthUser({ name: 'Premium User', plan: 'premium' });

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

    vi.spyOn(useUserCapabilitiesModule, 'useUserCapabilities').mockReturnValue({
      data: {
        dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        tarotReadings: { used: 1, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        canCreateDailyReading: true,
        canCreateTarotReading: true,
        canUseAI: true,
        canUseCustomQuestions: true,
        canUseAdvancedSpreads: true,
        plan: 'premium',
        isAuthenticated: true,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<UserCapabilities>);

    render(<UserDashboard />);

    expect(
      screen.queryByText(/Desbloquea interpretaciones personalizadas/i)
    ).not.toBeInTheDocument();
  });

  it('should open UpgradeModal when upgrade banner is clicked', () => {
    const mockUser = createMockAuthUser({ name: 'Free User', plan: 'free' });

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
    const mockUser = createMockAuthUser({ name: 'Free User', plan: 'free' });

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
