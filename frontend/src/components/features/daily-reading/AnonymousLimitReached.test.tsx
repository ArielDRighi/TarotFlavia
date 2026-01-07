import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AnonymousLimitReached } from './AnonymousLimitReached';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('AnonymousLimitReached', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  it('should render the main message', () => {
    render(<AnonymousLimitReached />);

    expect(
      screen.getByText('Ya viste tu carta del día. Regístrate para acceder a más lecturas.')
    ).toBeInTheDocument();
  });

  it('should render the primary CTA button', () => {
    render(<AnonymousLimitReached />);

    expect(screen.getByRole('button', { name: /crear cuenta gratis/i })).toBeInTheDocument();
  });

  it('should render the secondary CTA button', () => {
    render(<AnonymousLimitReached />);

    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('should navigate to register page when primary CTA is clicked', async () => {
    const user = userEvent.setup();
    render(<AnonymousLimitReached />);

    const registerButton = screen.getByRole('button', { name: /crear cuenta gratis/i });
    await user.click(registerButton);

    expect(mockPush).toHaveBeenCalledWith('/registro');
  });

  it('should navigate to login page when secondary CTA is clicked', async () => {
    const user = userEvent.setup();
    render(<AnonymousLimitReached />);

    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await user.click(loginButton);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(<AnonymousLimitReached />);

    const container = screen.getByRole('alert');
    expect(container).toBeInTheDocument();
  });
});
