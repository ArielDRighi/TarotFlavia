import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegistroPage from './page';

// Mock RegisterForm component
vi.mock('@/components/features/auth', () => ({
  RegisterForm: () => <div data-testid="register-form">Register Form Mock</div>,
}));

describe('RegistroPage', () => {
  it('should render the RegisterForm component', () => {
    render(<RegistroPage />);

    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<RegistroPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<RegistroPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should center content with flexbox', () => {
    const { container } = render(<RegistroPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('flex');
    expect(mainDiv).toHaveClass('items-center');
    expect(mainDiv).toHaveClass('justify-center');
  });
});
