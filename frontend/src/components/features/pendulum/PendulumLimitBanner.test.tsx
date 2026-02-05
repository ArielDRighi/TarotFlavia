import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PendulumLimitBanner } from './PendulumLimitBanner';

// Mock del hook usePendulumCapabilities
vi.mock('@/hooks/api/usePendulum', () => ({
  usePendulumCapabilities: vi.fn(),
}));

import { usePendulumCapabilities } from '@/hooks/api/usePendulum';

describe('PendulumLimitBanner', () => {
  it('should return null when capabilities are not available', () => {
    vi.mocked(usePendulumCapabilities).mockReturnValue(null);

    const { container } = render(<PendulumLimitBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should display remaining consultations when user can use (lifetime)', () => {
    vi.mocked(usePendulumCapabilities).mockReturnValue({
      used: 0,
      limit: 1,
      canUse: true,
      resetAt: null,
      period: 'lifetime',
    });

    render(<PendulumLimitBanner />);

    expect(screen.getByText(/1 consulta gratuita/i)).toBeInTheDocument();
    expect(screen.getByText(/disponible/i)).toBeInTheDocument();
  });

  it('should display remaining consultations when user can use (monthly)', () => {
    vi.mocked(usePendulumCapabilities).mockReturnValue({
      used: 1,
      limit: 3,
      canUse: true,
      resetAt: '2026-03-01T00:00:00.000Z',
      period: 'monthly',
    });

    render(<PendulumLimitBanner />);

    // Check that the key parts of the message are present
    expect(screen.getByText('2', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/3.*consultas disponibles/)).toBeInTheDocument();
    expect(screen.getByText(/este mes/i)).toBeInTheDocument();
  });

  it('should display remaining consultations when user can use (daily)', () => {
    vi.mocked(usePendulumCapabilities).mockReturnValue({
      used: 0,
      limit: 1,
      canUse: true,
      resetAt: '2026-02-05T00:00:00.000Z',
      period: 'daily',
    });

    render(<PendulumLimitBanner />);

    // Check that the key parts of the message are present
    expect(screen.getByText(/consultas disponibles/)).toBeInTheDocument();
    expect(screen.getByText(/hoy/i)).toBeInTheDocument();
  });

  it('should display limit reached message for lifetime users', () => {
    vi.mocked(usePendulumCapabilities).mockReturnValue({
      used: 1,
      limit: 1,
      canUse: false,
      resetAt: null,
      period: 'lifetime',
    });

    render(<PendulumLimitBanner />);

    expect(screen.getByText(/ya usaste tu consulta gratuita/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /registrarse/i })).toBeInTheDocument();
  });

  it('should display limit reached message for monthly users', () => {
    vi.mocked(usePendulumCapabilities).mockReturnValue({
      used: 3,
      limit: 3,
      canUse: false,
      resetAt: '2026-03-01T00:00:00.000Z',
      period: 'monthly',
    });

    render(<PendulumLimitBanner />);

    expect(screen.getByText(/límite mensual alcanzado/i)).toBeInTheDocument();
    expect(screen.getByText(/se reinicia el día 1/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /upgrade/i })).toBeInTheDocument();
  });

  it('should display limit reached message for daily users', () => {
    vi.mocked(usePendulumCapabilities).mockReturnValue({
      used: 1,
      limit: 1,
      canUse: false,
      resetAt: '2026-02-05T00:00:00.000Z',
      period: 'daily',
    });

    render(<PendulumLimitBanner />);

    expect(screen.getByText(/límite diario alcanzado/i)).toBeInTheDocument();
  });

  it('should not display upgrade button for daily users when limit reached', () => {
    vi.mocked(usePendulumCapabilities).mockReturnValue({
      used: 1,
      limit: 1,
      canUse: false,
      resetAt: '2026-02-05T00:00:00.000Z',
      period: 'daily',
    });

    render(<PendulumLimitBanner />);

    expect(screen.queryByRole('link', { name: /upgrade|registrarse/i })).not.toBeInTheDocument();
  });

  it('should link to /registro for lifetime users when limit reached', () => {
    vi.mocked(usePendulumCapabilities).mockReturnValue({
      used: 1,
      limit: 1,
      canUse: false,
      resetAt: null,
      period: 'lifetime',
    });

    render(<PendulumLimitBanner />);

    const link = screen.getByRole('link', { name: /registrarse/i });
    expect(link).toHaveAttribute('href', '/registro');
  });

  it('should link to /perfil for monthly users when limit reached', () => {
    vi.mocked(usePendulumCapabilities).mockReturnValue({
      used: 3,
      limit: 3,
      canUse: false,
      resetAt: '2026-03-01T00:00:00.000Z',
      period: 'monthly',
    });

    render(<PendulumLimitBanner />);

    const link = screen.getByRole('link', { name: /upgrade/i });
    expect(link).toHaveAttribute('href', '/perfil');
  });
});
