import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';

// Mock LoginForm to avoid complex setup
vi.mock('@/components/features/auth', () => ({
  LoginForm: () => <div data-testid="login-form">LoginForm Component</div>,
}));

describe('LoginPage', () => {
  it('should render login page with LoginForm', () => {
    render(<LoginPage />);

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<LoginPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<LoginPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should center content vertically and horizontally', () => {
    const { container } = render(<LoginPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('flex');
    expect(mainDiv).toHaveClass('items-center');
    expect(mainDiv).toHaveClass('justify-center');
  });
});
