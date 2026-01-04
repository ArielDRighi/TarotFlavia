import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegistroPage from './page';

// Mock RegisterForm component
vi.mock('@/components/features/auth', () => ({
  RegisterForm: () => <div data-testid="register-form">Register Form Mock</div>,
}));

// Mock useSearchParams
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => mockSearchParams),
}));

describe('RegistroPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('message');
  });

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

  describe('message display', () => {
    it('should NOT show message when no query param is present', () => {
      render(<RegistroPage />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show message when "register-for-readings" query param is present', () => {
      mockSearchParams.set('message', 'register-for-readings');

      render(<RegistroPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/regístrate gratis para crear tus lecturas de tarot personalizadas/i)
      ).toBeInTheDocument();
    });

    it('should NOT show message when unknown query param is present', () => {
      mockSearchParams.set('message', 'unknown-message');

      render(<RegistroPage />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
