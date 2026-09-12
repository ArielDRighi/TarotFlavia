import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HoroscopeHubSelector } from './HoroscopeHubSelector';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));

const mockUseAuthStore = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

describe('HoroscopeHubSelector (T-SEO-015)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({ user: null, isAuthenticated: false });
  });

  it('renderiza el selector de signos sin pedir nada a la API', () => {
    render(<HoroscopeHubSelector />);

    expect(screen.getByTestId('zodiac-selector')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /consultá tu signo/i })
    ).toBeInTheDocument();
  });

  it('muestra el aviso de registro al visitante sin sesión', () => {
    render(<HoroscopeHubSelector />);

    expect(screen.getByText(/Registrate/i)).toBeInTheDocument();
    expect(screen.getByText(/para ver tu horóscopo automáticamente/i)).toBeInTheDocument();
  });

  it('pide la fecha de nacimiento al usuario con sesión que no la cargó', () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: 1, email: 'test@test.com', birthDate: null },
      isAuthenticated: true,
    });
    render(<HoroscopeHubSelector />);

    expect(screen.getByText(/Configurá tu fecha de nacimiento/i)).toBeInTheDocument();
  });

  it('navega a la ficha del signo al elegirlo', async () => {
    const user = userEvent.setup();
    render(<HoroscopeHubSelector />);

    await user.click(screen.getByTestId('zodiac-card-aries'));

    expect(mockPush).toHaveBeenCalledWith('/horoscopo/aries');
  });

  it('resalta el signo del usuario con fecha de nacimiento', () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: 1, email: 'test@test.com', birthDate: '1990-03-25' }, // Aries
      isAuthenticated: true,
    });
    render(<HoroscopeHubSelector />);

    expect(screen.getByTestId('zodiac-card-aries')).toHaveClass('border-accent');
  });
});
