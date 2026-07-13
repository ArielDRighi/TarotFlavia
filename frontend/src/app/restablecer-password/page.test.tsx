import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResetPasswordPage from './page';

const mockGet = vi.fn();
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: mockGet }),
}));

// Mock ResetPasswordForm component
vi.mock('@/components/features/auth', () => ({
  ResetPasswordForm: ({ token }: { token: string | null }) => (
    <div data-testid="reset-password-form">token: {token ?? 'sin-token'}</div>
  ),
}));

describe('ResetPasswordPage', () => {
  it('should pass the token from the query string to the form', () => {
    mockGet.mockReturnValue('token-del-email');

    render(<ResetPasswordPage />);

    expect(screen.getByTestId('reset-password-form')).toHaveTextContent('token: token-del-email');
  });

  it('should pass null to the form when the query string has no token', () => {
    mockGet.mockReturnValue(null);

    render(<ResetPasswordPage />);

    expect(screen.getByTestId('reset-password-form')).toHaveTextContent('token: sin-token');
  });

  it('should have a centered full-height layout', () => {
    mockGet.mockReturnValue('token-del-email');

    const { container } = render(<ResetPasswordPage />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('min-h-screen');
    expect(wrapper).toHaveClass('bg-bg-main');
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('items-center');
    expect(wrapper).toHaveClass('justify-center');
  });
});
