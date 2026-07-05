import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RegisterPage } from './RegisterPage';

// Mock RegisterForm to isolate the page-content logic
vi.mock('./RegisterForm', () => ({
  RegisterForm: () => <div data-testid="register-form">Register Form Mock</div>,
}));

// Mock useSearchParams
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => mockSearchParams),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('message');
  });

  it('should render the RegisterForm component', () => {
    render(<RegisterPage />);

    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });

  describe('canon layout', () => {
    it('should center content full-height over the papyrus background', () => {
      const { container } = render(<RegisterPage />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('min-h-screen');
      expect(wrapper).toHaveClass('bg-bg-main');
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('justify-center');
    });
  });

  describe('message display', () => {
    it('should NOT show message when no query param is present', () => {
      render(<RegisterPage />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show message when "register-for-readings" query param is present', () => {
      mockSearchParams.set('message', 'register-for-readings');

      render(<RegisterPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/regístrate gratis para crear tus lecturas de tarot personalizadas/i)
      ).toBeInTheDocument();
    });

    it('should NOT show message when unknown query param is present', () => {
      mockSearchParams.set('message', 'unknown-message');

      render(<RegisterPage />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should style the message callout with brand gold tokens, not raw purple', () => {
      mockSearchParams.set('message', 'register-for-readings');

      const { container } = render(<RegisterPage />);

      const alert = screen.getByRole('alert');
      expect(alert.className).not.toMatch(/purple/);
      // Gold canon callout uses the secondary token
      expect(container.querySelector('[class*="secondary"]')).toBeInTheDocument();
    });
  });
});
