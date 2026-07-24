import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdSenseScript } from './AdSenseScript';
import { useAuthStore } from '@/stores/authStore';
import type { AuthUser, UserPlan } from '@/types';

const mockUsePathname = vi.hoisted(() => vi.fn<() => string>(() => '/'));

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// useAdsEnabled → useUserPlanFeatures now reads capabilities as the primary plan
// source. Mock it "not loaded" so the hook falls back to the authStore plan these
// tests set (and no QueryClient wrapper is needed).
vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: () => ({ data: undefined }),
}));

interface MockScriptProps {
  id?: string;
  src?: string;
  strategy?: string;
  crossOrigin?: string;
}

vi.mock('next/script', () => ({
  default: ({ id, src, strategy, crossOrigin }: MockScriptProps) => (
    <script
      data-testid="adsense-script"
      id={id}
      data-src={src}
      data-strategy={strategy}
      data-crossorigin={crossOrigin}
    />
  ),
}));

const ADSENSE_CLIENT = 'ca-pub-1234567890123456';

function buildUser(plan: UserPlan): AuthUser {
  return {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    roles: ['user'],
    plan,
    profilePicture: null,
  };
}

function setAuthState(plan: UserPlan | null, hasHydrated: boolean): void {
  useAuthStore.setState({
    user: plan === null ? null : buildUser(plan),
    isAuthenticated: plan !== null,
    isLoading: false,
    _hasHydrated: hasHydrated,
  });
}

describe('AdSenseScript', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_CLIENT', ADSENSE_CLIENT);
    mockUsePathname.mockReturnValue('/');
    setAuthState(null, true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should load the official loader for anonymous visitors', () => {
    render(<AdSenseScript />);

    const script = screen.getByTestId('adsense-script');

    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute(
      'data-src',
      `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
    );
    expect(script).toHaveAttribute('data-strategy', 'afterInteractive');
    expect(script).toHaveAttribute('data-crossorigin', 'anonymous');
  });

  it('should load the loader for free users', () => {
    setAuthState('free', true);

    render(<AdSenseScript />);

    expect(screen.getByTestId('adsense-script')).toBeInTheDocument();
  });

  it('should NOT load the loader for premium users', () => {
    setAuthState('premium', true);

    render(<AdSenseScript />);

    expect(screen.queryByTestId('adsense-script')).not.toBeInTheDocument();
  });

  it('should NOT load the loader before the auth store hydrates', () => {
    setAuthState('free', false);

    render(<AdSenseScript />);

    expect(screen.queryByTestId('adsense-script')).not.toBeInTheDocument();
  });

  it('should NOT load the loader when NEXT_PUBLIC_ADSENSE_CLIENT is not set', () => {
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_CLIENT', '');

    render(<AdSenseScript />);

    expect(screen.queryByTestId('adsense-script')).not.toBeInTheDocument();
  });

  it('should NOT load the loader inside the admin panel', () => {
    mockUsePathname.mockReturnValue('/admin/users');
    setAuthState('free', true);

    render(<AdSenseScript />);

    expect(screen.queryByTestId('adsense-script')).not.toBeInTheDocument();
  });
});
