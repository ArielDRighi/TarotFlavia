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

import PremiumPreview from './PremiumPreview';
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

describe('PremiumPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreatePreapproval.mockReturnValue({ mutate: mockMutate, isPending: false });
    setupFreeUser();
  });

  it('should render preview container with default message', () => {
    render(
      <PremiumPreview>
        <div>Premium Content</div>
      </PremiumPreview>
    );

    expect(screen.getByText(/desbloquea este contenido con premium/i)).toBeInTheDocument();
  });

  it('should display custom message when provided', () => {
    const customMessage = 'Accede a estadísticas avanzadas';

    render(
      <PremiumPreview message={customMessage}>
        <div>Premium Stats</div>
      </PremiumPreview>
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(screen.queryByText(/desbloquea este contenido/i)).not.toBeInTheDocument();
  });

  it('should blur children content', () => {
    render(
      <PremiumPreview>
        <div data-testid="premium-content">Premium Content</div>
      </PremiumPreview>
    );

    const content = screen.getByTestId('premium-content').parentElement;
    expect(content).toHaveClass('blur-sm');
  });

  it('should render children content inside', () => {
    render(
      <PremiumPreview>
        <div>Premium Content Here</div>
      </PremiumPreview>
    );

    expect(screen.getByText(/premium content here/i)).toBeInTheDocument();
  });

  it('should show upgrade CTA button', () => {
    render(
      <PremiumPreview>
        <div>Premium Content</div>
      </PremiumPreview>
    );

    expect(screen.getByRole('button', { name: /actualizar a premium/i })).toBeInTheDocument();
  });

  it('should have proper relative positioning for overlay', () => {
    const { container } = render(
      <PremiumPreview>
        <div>Premium Content</div>
      </PremiumPreview>
    );

    const mainContainer = container.querySelector('.relative');
    expect(mainContainer).toBeInTheDocument();
  });

  it('should call createPreapproval when clicking upgrade button as free user', async () => {
    const user = userEvent.setup();
    render(
      <PremiumPreview>
        <div>Premium Content</div>
      </PremiumPreview>
    );

    const button = screen.getByRole('button', { name: /actualizar a premium/i });
    await user.click(button);

    expect(mockMutate).toHaveBeenCalledOnce();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('should redirect to /registro when clicking upgrade as anonymous user', async () => {
    const user = userEvent.setup();
    setupAnonymousUser();
    render(
      <PremiumPreview>
        <div>Premium Content</div>
      </PremiumPreview>
    );

    const button = screen.getByRole('button', { name: /actualizar a premium/i });
    await user.click(button);

    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.stringContaining('/registro?redirect=/premium')
    );
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should redirect to initPoint when createPreapproval succeeds', () => {
    const initPoint = 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=test-789';
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

      render(
        <PremiumPreview>
          <div>Premium Content</div>
        </PremiumPreview>
      );
      screen.getByRole('button', { name: /actualizar a premium/i }).click();

      expect(window.location.href).toBe(initPoint);
    } finally {
      Object.defineProperty(window, 'location', { writable: true, value: originalLocation });
    }
  });

  it('should disable button while isPending is true', () => {
    mockUseCreatePreapproval.mockReturnValue({ mutate: mockMutate, isPending: true });
    render(
      <PremiumPreview>
        <div>Premium Content</div>
      </PremiumPreview>
    );

    const button = screen.getByRole('button', { name: /cargando/i });
    expect(button).toBeDisabled();
  });
});
