import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ForgotPasswordPage from './page';

// Mock ForgotPasswordForm component
vi.mock('@/components/features/auth', () => ({
  ForgotPasswordForm: () => <div data-testid="forgot-password-form">ForgotPasswordForm Mock</div>,
}));

describe('ForgotPasswordPage', () => {
  it('should render the ForgotPasswordForm component', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<ForgotPasswordPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<ForgotPasswordPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have centered layout', () => {
    const { container } = render(<ForgotPasswordPage />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('items-center');
    expect(wrapper).toHaveClass('justify-center');
  });
});
