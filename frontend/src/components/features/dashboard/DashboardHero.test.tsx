import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardHero } from './DashboardHero';
import * as useAuthModule from '@/hooks/useAuth';
import * as useUserPlanFeaturesModule from '@/hooks/utils/useUserPlanFeatures';
import type { AuthUser } from '@/types';
import type { PlanType } from '@/components/ui/plan-badge';

// Mock auth + plan hooks
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/utils/useUserPlanFeatures');

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

/** Wire both hooks for a given name/plan in a single call. */
function mockHooks(options: { user: AuthUser | null; plan: PlanType }) {
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    user: options.user,
    isAuthenticated: options.user !== null,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
  });

  vi.spyOn(useUserPlanFeaturesModule, 'useUserPlanFeatures').mockReturnValue({
    plan: options.plan,
    planLabel: options.plan === 'premium' ? 'PREMIUM' : 'GRATUITO',
    canUseAI: options.plan === 'premium',
    canUseCategories: options.plan === 'premium',
    canUseCustomQuestions: options.plan === 'premium',
    canShare: options.plan !== 'anonymous',
    isPremium: options.plan === 'premium',
    isFree: options.plan === 'free',
    isAnonymous: options.plan === 'anonymous',
  });
}

describe('DashboardHero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display personalized greeting with user name', () => {
    mockHooks({ user: createMockAuthUser({ name: 'María' }), plan: 'free' });

    render(<DashboardHero />);

    expect(screen.getByRole('heading', { level: 1, name: '¡Hola, María!' })).toBeInTheDocument();
  });

  it('should fall back to "Usuario" when there is no user', () => {
    mockHooks({ user: null, plan: 'anonymous' });

    render(<DashboardHero />);

    expect(screen.getByRole('heading', { level: 1, name: '¡Hola, Usuario!' })).toBeInTheDocument();
  });

  it('should display the GRATUITO badge for free users', () => {
    mockHooks({ user: createMockAuthUser({ name: 'Carlos', plan: 'free' }), plan: 'free' });

    render(<DashboardHero />);

    expect(screen.getByText('GRATUITO')).toBeInTheDocument();
  });

  it('should display the PREMIUM badge for premium users', () => {
    mockHooks({ user: createMockAuthUser({ name: 'Ana', plan: 'premium' }), plan: 'premium' });

    render(<DashboardHero />);

    expect(screen.getByText('PREMIUM')).toBeInTheDocument();
  });

  it('should render an accessible profile link with a visible focus ring', () => {
    mockHooks({ user: createMockAuthUser({ name: 'Luis' }), plan: 'free' });

    render(<DashboardHero />);

    const profileLink = screen.getByRole('link', { name: 'Ver perfil' });
    expect(profileLink).toHaveAttribute('href', '/perfil');
    // Visible keyboard focus is required for AA accessibility.
    expect(profileLink.className).toMatch(/focus-visible:/);
  });

  it('should render an optional contextual subtitle', () => {
    mockHooks({ user: createMockAuthUser({ name: 'Sol' }), plan: 'free' });

    render(<DashboardHero subtitle="Las estrellas te acompañan hoy" />);

    expect(screen.getByText('Las estrellas te acompañan hoy')).toBeInTheDocument();
  });

  it('should not render the subtitle paragraph when none is provided', () => {
    mockHooks({ user: createMockAuthUser({ name: 'Sol' }), plan: 'free' });

    render(<DashboardHero />);

    expect(screen.queryByTestId('dashboard-hero-subtitle')).not.toBeInTheDocument();
  });

  it('should render the optional hero image with its Spanish alt text', () => {
    mockHooks({ user: createMockAuthUser({ name: 'Nora' }), plan: 'premium' });

    render(
      <DashboardHero
        image={{ src: '/images/dashboard/dashboard-hero.webp', alt: 'Cielo nocturno estrellado' }}
      />
    );

    expect(screen.getByAltText('Cielo nocturno estrellado')).toBeInTheDocument();
  });

  it('should degrade gracefully to the gradient band when no image is provided', () => {
    mockHooks({ user: createMockAuthUser({ name: 'Nora' }), plan: 'free' });

    render(<DashboardHero />);

    expect(screen.getByTestId('dashboard-hero')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
