/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountTab } from '../AccountTab';
import type { UserProfile } from '@/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockProfile: UserProfile = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  roles: ['consumer'],
  plan: 'free',
  dailyReadingsCount: 0,
  dailyReadingsLimit: 3,
  lastLogin: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('AccountTab - Autocomplete', () => {
  it('should have autocomplete="current-password" on current password field', () => {
    render(<AccountTab profile={mockProfile} />, { wrapper });

    const currentPasswordInput = screen.getByLabelText(/contraseña actual/i);
    expect(currentPasswordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  it('should have autocomplete="new-password" on new password field', () => {
    render(<AccountTab profile={mockProfile} />, { wrapper });

    const newPasswordInput = screen.getByLabelText(/^nueva contraseña$/i);
    expect(newPasswordInput).toHaveAttribute('autocomplete', 'new-password');
  });

  it('should have autocomplete="new-password" on confirm password field', () => {
    render(<AccountTab profile={mockProfile} />, { wrapper });

    const confirmPasswordInput = screen.getByLabelText(/confirmar nueva contraseña/i);
    expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password');
  });
});
