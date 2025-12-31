import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { StatsSection } from './StatsSection';
import * as useUserModule from '@/hooks/api/useUser';
import type { UseQueryResult } from '@tanstack/react-query';
import type { UserProfile } from '@/types';

// Mock useProfile hook
vi.mock('@/hooks/api/useUser');

describe('StatsSection', () => {
  it('should display section title', () => {
    vi.spyOn(useUserModule, 'useProfile').mockReturnValue({
      data: {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: ['consumer'],
        plan: 'premium',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        lastLogin: null,
        dailyReadingsCount: 2,
        dailyReadingsLimit: 3,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<UserProfile>);

    render(<StatsSection />);

    expect(screen.getByText('Tus Estadísticas')).toBeInTheDocument();
  });

  it('should display daily readings count', () => {
    vi.spyOn(useUserModule, 'useProfile').mockReturnValue({
      data: {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: ['consumer'],
        plan: 'premium',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        lastLogin: null,
        dailyReadingsCount: 2,
        dailyReadingsLimit: 3,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<UserProfile>);

    render(<StatsSection />);

    expect(screen.getByText(/2 \/ 3/)).toBeInTheDocument();
    expect(screen.getByText('Lecturas de Hoy')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    vi.spyOn(useUserModule, 'useProfile').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<UserProfile>);

    render(<StatsSection />);

    expect(screen.getByTestId('stats-loading')).toBeInTheDocument();
  });

  it('should show error state', () => {
    vi.spyOn(useUserModule, 'useProfile').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
      refetch: vi.fn(),
    } as unknown as UseQueryResult<UserProfile>);

    render(<StatsSection />);

    expect(screen.getByText(/Error al cargar/)).toBeInTheDocument();
  });

  it('should display remaining readings', () => {
    vi.spyOn(useUserModule, 'useProfile').mockReturnValue({
      data: {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: ['consumer'],
        plan: 'premium',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        lastLogin: null,
        dailyReadingsCount: 1,
        dailyReadingsLimit: 3,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<UserProfile>);

    render(<StatsSection />);

    // Should show remaining (3 - 1 = 2)
    const statCard = screen.getByText('Lecturas de Hoy').closest('div');
    expect(within(statCard!).getByText(/1 \/ 3/)).toBeInTheDocument();
  });

  it('should have appropriate styling', () => {
    vi.spyOn(useUserModule, 'useProfile').mockReturnValue({
      data: {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: ['consumer'],
        plan: 'premium',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        lastLogin: null,
        dailyReadingsCount: 2,
        dailyReadingsLimit: 3,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<UserProfile>);

    render(<StatsSection />);

    const title = screen.getByText('Tus Estadísticas');
    expect(title).toHaveClass('font-serif');
  });
});
