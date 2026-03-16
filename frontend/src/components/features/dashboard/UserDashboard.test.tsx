import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserDashboard } from './UserDashboard';
import * as useAuthModule from '@/hooks/useAuth';
import * as useUserPlanFeaturesModule from '@/hooks/utils/useUserPlanFeatures';
import * as useUserModule from '@/hooks/api/useUser';
import * as useUserCapabilitiesModule from '@/hooks/api/useUserCapabilities';
import * as useHoroscopeModule from '@/hooks/api/useHoroscope';
import * as useChineseHoroscopeModule from '@/hooks/api/useChineseHoroscope';
import * as useNumerologyModule from '@/hooks/api/useNumerology';
import * as useSacredCalendarModule from '@/hooks/api/useSacredCalendar';
import * as useRitualRecommendationsModule from '@/hooks/api/useRitualRecommendations';
import * as useHolisticServicesModule from '@/hooks/api/useHolisticServices';
import type {
  AuthUser,
  UserProfile,
  UserCapabilities,
  DailyHoroscope,
  ChineseHoroscope,
  SacredEvent,
} from '@/types';
import type { UseQueryResult } from '@tanstack/react-query';
import { ZodiacSign } from '@/types/horoscope.types';
import type { NumerologyResponseDto, DayNumberResponse } from '@/types/numerology.types';
import type { RitualRecommendationsResponse } from '@/types/ritual.types';

// Mocks
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/utils/useUserPlanFeatures');
vi.mock('@/hooks/api/useUser');
vi.mock('@/hooks/api/useUserCapabilities');
vi.mock('@/hooks/api/useHoroscope');
vi.mock('@/hooks/api/useChineseHoroscope');
vi.mock('@/hooks/api/useNumerology');
vi.mock('@/hooks/api/useSacredCalendar');
vi.mock('@/hooks/api/useRitualRecommendations');
vi.mock('@/hooks/api/useHolisticServices');

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

    // Default mock for useMySignHoroscope (can be overridden per test)
    vi.spyOn(useHoroscopeModule, 'useMySignHoroscope').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<DailyHoroscope, Error>);

    // Default mock for useMyAnimalHoroscope (Chinese horoscope widget)
    vi.spyOn(useChineseHoroscopeModule, 'useMyAnimalHoroscope').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<ChineseHoroscope, Error>);

    // Default mock for useMyNumerologyProfile (Numerology widget)
    vi.spyOn(useNumerologyModule, 'useMyNumerologyProfile').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<NumerologyResponseDto, Error>);

    // Default mock for useDayNumber (Numerology widget)
    vi.spyOn(useNumerologyModule, 'useDayNumber').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<DayNumberResponse, Error>);

    // Default mock for useTodayEvents (SacredEventsWidget)
    vi.spyOn(useSacredCalendarModule, 'useTodayEvents').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<SacredEvent[], Error>);

    // Default mock for useUpcomingEvents (SacredEventsWidget)
    vi.spyOn(useSacredCalendarModule, 'useUpcomingEvents').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<SacredEvent[], Error>);

    // Default mock for useRitualRecommendations (PersonalizedRitualsWidget)
    vi.spyOn(useRitualRecommendationsModule, 'useRitualRecommendations').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<RitualRecommendationsResponse, Error>);

    // Default mock for useMyPurchases (MyServicesWidget)
    vi.spyOn(useHolisticServicesModule, 'useMyPurchases').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useHolisticServicesModule.useMyPurchases>);
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

  // TASK-110: Tests for HoroscopeWidget integration
  it('should render HoroscopeWidget in the dashboard', () => {
    const mockUser = createMockAuthUser({
      name: 'Test User',
      plan: 'free',
      birthDate: '1990-05-15',
    });

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

    // Mock useMySignHoroscope
    vi.spyOn(useHoroscopeModule, 'useMySignHoroscope').mockReturnValue({
      data: {
        id: 1,
        zodiacSign: ZodiacSign.TAURUS,
        horoscopeDate: '2026-01-17',
        generalContent: 'Hoy es un buen día para ti.',
        areas: {
          love: { content: 'Amor positivo', score: 8 },
          wellness: { content: 'Bienestar alto', score: 7 },
          money: { content: 'Finanzas estables', score: 6 },
        },
        luckyNumber: 7,
        luckyColor: 'Verde',
        luckyTime: 'Mañana',
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<DailyHoroscope, Error>);

    render(<UserDashboard />);

    // Should render HoroscopeWidget
    expect(screen.getByTestId('horoscope-widget')).toBeInTheDocument();
  });

  it('should render HoroscopeWidget for premium users', () => {
    const mockUser = createMockAuthUser({
      name: 'Premium User',
      plan: 'premium',
      birthDate: '1985-12-25',
    });

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

    // Mock useMySignHoroscope
    vi.spyOn(useHoroscopeModule, 'useMySignHoroscope').mockReturnValue({
      data: {
        id: 2,
        zodiacSign: ZodiacSign.CAPRICORN,
        horoscopeDate: '2026-01-17',
        generalContent: 'Día de crecimiento para ti.',
        areas: {
          love: { content: 'Amor estable', score: 7 },
          wellness: { content: 'Energía positiva', score: 9 },
          money: { content: 'Oportunidades financieras', score: 8 },
        },
        luckyNumber: 3,
        luckyColor: 'Azul',
        luckyTime: 'Tarde',
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<DailyHoroscope, Error>);

    render(<UserDashboard />);

    // Should render HoroscopeWidget even for premium users
    expect(screen.getByTestId('horoscope-widget')).toBeInTheDocument();
  });

  // TASK-207: Tests for NumerologyWidget integration
  it('should render NumerologyWidget in the dashboard', () => {
    const mockUser = createMockAuthUser({
      name: 'Test User',
      plan: 'free',
      birthDate: '1990-05-15',
    });

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

    // Mock numerology profile
    vi.spyOn(useNumerologyModule, 'useMyNumerologyProfile').mockReturnValue({
      data: {
        lifePath: {
          value: 7,
          name: 'El Buscador',
          keywords: ['Análisis', 'Introspección', 'Sabiduría'],
          description: 'Persona analítica y reflexiva',
          isMaster: false,
        },
        birthday: {
          value: 15,
          name: 'El Creativo',
          keywords: ['Creatividad', 'Expresión'],
          description: 'Día de nacimiento especial',
          isMaster: false,
        },
        expression: null,
        soulUrge: null,
        personality: null,
        personalYear: 5,
        personalMonth: 8,
        birthDate: '1990-05-15',
        fullName: null,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<NumerologyResponseDto, Error>);

    // Mock day number
    vi.spyOn(useNumerologyModule, 'useDayNumber').mockReturnValue({
      data: {
        date: '2026-01-21',
        dayNumber: 3,
        meaning: {
          number: 3,
          name: 'El Creativo',
          keywords: ['Creatividad', 'Comunicación', 'Alegría'],
          description: 'Día de expresión creativa',
          strengths: ['Comunicación efectiva'],
          challenges: ['Dispersión'],
          careers: ['Artista'],
          isMaster: false,
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<DayNumberResponse, Error>);

    render(<UserDashboard />);

    // Should render NumerologyWidget
    expect(screen.getByTestId('numerology-widget')).toBeInTheDocument();
  });

  it('should render NumerologyWidget for premium users', () => {
    const mockUser = createMockAuthUser({
      name: 'Premium User',
      plan: 'premium',
      birthDate: '1985-12-25',
    });

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

    // Mock numerology profile
    vi.spyOn(useNumerologyModule, 'useMyNumerologyProfile').mockReturnValue({
      data: {
        lifePath: {
          value: 11,
          name: 'El Visionario',
          keywords: ['Intuición', 'Iluminación', 'Inspiración'],
          description: 'Número maestro de alta vibración',
          isMaster: true,
        },
        birthday: {
          value: 7,
          name: 'El Buscador',
          keywords: ['Análisis'],
          description: 'Día analítico',
          isMaster: false,
        },
        expression: null,
        soulUrge: null,
        personality: null,
        personalYear: 3,
        personalMonth: 6,
        birthDate: '1985-12-25',
        fullName: null,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<NumerologyResponseDto, Error>);

    // Mock day number
    vi.spyOn(useNumerologyModule, 'useDayNumber').mockReturnValue({
      data: {
        date: '2026-01-21',
        dayNumber: 3,
        meaning: {
          number: 3,
          name: 'El Creativo',
          keywords: ['Creatividad'],
          description: 'Día creativo',
          strengths: [],
          challenges: [],
          careers: [],
          isMaster: false,
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<DayNumberResponse, Error>);

    render(<UserDashboard />);

    // Should render NumerologyWidget even for premium users
    expect(screen.getByTestId('numerology-widget')).toBeInTheDocument();
  });
});
