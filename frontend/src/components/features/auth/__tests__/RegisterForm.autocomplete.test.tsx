/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegisterForm } from '../RegisterForm';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('RegisterForm - Autocomplete', () => {
  it('should have autocomplete="new-password" on password field', () => {
    render(<RegisterForm />, { wrapper });

    const passwordInput = screen.getByLabelText(/^contraseña$/i);
    expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
  });

  it('should have autocomplete="new-password" on confirm password field', () => {
    render(<RegisterForm />, { wrapper });

    const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
    expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password');
  });

  it('should have autocomplete="email" on email field', () => {
    render(<RegisterForm />, { wrapper });

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('autocomplete', 'email');
  });

  it('should have autocomplete="name" on name field', () => {
    render(<RegisterForm />, { wrapper });

    const nameInput = screen.getByLabelText(/nombre/i);
    expect(nameInput).toHaveAttribute('autocomplete', 'name');
  });
});
