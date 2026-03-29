import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockMutate = vi.fn();
const mockRouterPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/api/useSubscription', () => ({
  useCreatePreapproval: vi.fn(),
}));

import UpgradeBanner from './UpgradeBanner';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePreapproval } from '@/hooks/api/useSubscription';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseCreatePreapproval = useCreatePreapproval as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupFreeUser() {
  mockUseAuth.mockReturnValue({
    user: { id: 1, email: 'test@test.com', name: 'Test', plan: 'free', roles: [] },
  });
}

function setupAnonymousUser() {
  mockUseAuth.mockReturnValue({ user: null });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('UpgradeBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreatePreapproval.mockReturnValue({ mutate: mockMutate, isPending: false });
    setupFreeUser();
  });

  it('should render banner with correct message', () => {
    render(<UpgradeBanner />);

    expect(screen.getByText(/desbloquea interpretaciones personalizadas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upgrade a premium/i })).toBeInTheDocument();
  });

  it('should render diamond/gem icon', () => {
    const { container } = render(<UpgradeBanner />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should have purple-pink gradient styles', () => {
    const { container } = render(<UpgradeBanner />);

    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toMatch(/from-purple-500/);
    expect(banner.className).toMatch(/to-pink-500/);
  });

  it('should have rounded border style', () => {
    const { container } = render(<UpgradeBanner />);

    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toMatch(/rounded-lg/);
  });

  it('should have correct padding', () => {
    const { container } = render(<UpgradeBanner />);

    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toMatch(/p-6/);
  });

  it('should call createPreapproval when clicking upgrade button as free user', async () => {
    const user = userEvent.setup();
    render(<UpgradeBanner />);

    const button = screen.getByRole('button', { name: /upgrade a premium/i });
    await user.click(button);

    expect(mockMutate).toHaveBeenCalledOnce();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('should redirect to /registro when clicking upgrade as anonymous user', async () => {
    const user = userEvent.setup();
    setupAnonymousUser();
    render(<UpgradeBanner />);

    const button = screen.getByRole('button', { name: /upgrade a premium/i });
    await user.click(button);

    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.stringContaining('/registro?redirect=/premium')
    );
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should redirect to initPoint when createPreapproval succeeds', () => {
    const initPoint = 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=test-456';
    mockUseCreatePreapproval.mockReturnValue({
      mutate: vi
        .fn()
        .mockImplementation(
          (_vars: undefined, options: { onSuccess?: (data: { initPoint: string }) => void }) => {
            options?.onSuccess?.({ initPoint });
          }
        ),
      isPending: false,
    });

    const originalLocation = window.location;
    try {
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } });

      render(<UpgradeBanner />);
      screen.getByRole('button', { name: /upgrade a premium/i }).click();

      expect(window.location.href).toBe(initPoint);
    } finally {
      Object.defineProperty(window, 'location', { writable: true, value: originalLocation });
    }
  });

  it('should disable button while isPending is true', () => {
    mockUseCreatePreapproval.mockReturnValue({ mutate: mockMutate, isPending: true });
    render(<UpgradeBanner />);

    const button = screen.getByRole('button', { name: /cargando/i });
    expect(button).toBeDisabled();
  });
});
