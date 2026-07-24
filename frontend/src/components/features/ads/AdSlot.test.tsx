import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdSlot } from './AdSlot';
import { useAuthStore } from '@/stores/authStore';
import type { AdsByGoogleQueue } from '@/types';
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

const ADSENSE_CLIENT = 'ca-pub-1234567890123456';
const AD_SLOT_ID = '9876543210';

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

describe('AdSlot', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_CLIENT', ADSENSE_CLIENT);
    mockUsePathname.mockReturnValue('/');
    setAuthState(null, true);
    window.adsbygoogle = undefined;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    window.adsbygoogle = undefined;
  });

  describe('renderizado', () => {
    it('should render the AdSense ins element for anonymous visitors', () => {
      render(<AdSlot slotId={AD_SLOT_ID} />);

      const slot = screen.getByTestId('ad-slot');

      expect(slot).toBeInTheDocument();
      expect(slot).toHaveClass('adsbygoogle');
      expect(slot).toHaveAttribute('data-ad-client', ADSENSE_CLIENT);
      expect(slot).toHaveAttribute('data-ad-slot', AD_SLOT_ID);
      expect(slot).toHaveAttribute('data-ad-format', 'auto');
      expect(slot).toHaveAttribute('data-full-width-responsive', 'true');
    });

    it('should render the ins element for free users', () => {
      setAuthState('free', true);

      render(<AdSlot slotId={AD_SLOT_ID} />);

      expect(screen.getByTestId('ad-slot')).toBeInTheDocument();
    });

    it('should allow overriding the ad format and the responsive flag', () => {
      render(<AdSlot slotId={AD_SLOT_ID} format="fluid" responsive={false} />);

      const slot = screen.getByTestId('ad-slot');

      expect(slot).toHaveAttribute('data-ad-format', 'fluid');
      expect(slot).toHaveAttribute('data-full-width-responsive', 'false');
    });

    it('should merge custom classNames with the required adsbygoogle class', () => {
      render(<AdSlot slotId={AD_SLOT_ID} className="my-8" />);

      const slot = screen.getByTestId('ad-slot');

      expect(slot).toHaveClass('adsbygoogle');
      expect(slot).toHaveClass('my-8');
    });
  });

  describe('gating', () => {
    it('should NEVER render for premium users', () => {
      setAuthState('premium', true);

      render(<AdSlot slotId={AD_SLOT_ID} />);

      expect(screen.queryByTestId('ad-slot')).not.toBeInTheDocument();
      expect(window.adsbygoogle).toBeUndefined();
    });

    it('should NOT render before the auth store hydrates (no flash of ads)', () => {
      setAuthState('premium', false);

      render(<AdSlot slotId={AD_SLOT_ID} />);

      expect(screen.queryByTestId('ad-slot')).not.toBeInTheDocument();
      expect(window.adsbygoogle).toBeUndefined();
    });

    it('should NOT render when NEXT_PUBLIC_ADSENSE_CLIENT is not set', () => {
      vi.stubEnv('NEXT_PUBLIC_ADSENSE_CLIENT', '');

      render(<AdSlot slotId={AD_SLOT_ID} />);

      expect(screen.queryByTestId('ad-slot')).not.toBeInTheDocument();
      expect(window.adsbygoogle).toBeUndefined();
    });

    it('should NOT render inside excluded zones such as the payment flow', () => {
      mockUsePathname.mockReturnValue('/premium/activacion');
      setAuthState('free', true);

      render(<AdSlot slotId={AD_SLOT_ID} />);

      expect(screen.queryByTestId('ad-slot')).not.toBeInTheDocument();
    });
  });

  describe('cola de adsbygoogle', () => {
    it('should push the slot into the adsbygoogle queue once', () => {
      render(<AdSlot slotId={AD_SLOT_ID} />);

      expect(window.adsbygoogle).toHaveLength(1);
    });

    it('should reuse an existing adsbygoogle queue', () => {
      window.adsbygoogle = [{}];

      render(<AdSlot slotId={AD_SLOT_ID} />);

      expect(window.adsbygoogle).toHaveLength(2);
    });

    it('should NOT push twice when the component re-renders', () => {
      const { rerender } = render(<AdSlot slotId={AD_SLOT_ID} />);

      rerender(<AdSlot slotId={AD_SLOT_ID} className="my-8" />);

      expect(window.adsbygoogle).toHaveLength(1);
    });

    it('should not crash when the AdSense queue throws', () => {
      const throwingQueue: AdsByGoogleQueue = [];
      throwingQueue.push = () => {
        throw new Error('adsbygoogle no está disponible');
      };
      window.adsbygoogle = throwingQueue;

      expect(() => render(<AdSlot slotId={AD_SLOT_ID} />)).not.toThrow();
      expect(screen.getByTestId('ad-slot')).toBeInTheDocument();
    });
  });
});
