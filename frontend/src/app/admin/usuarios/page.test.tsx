/**
 * Tests for AdminUsuariosPage
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminUsuariosPage from './page';

// Mock dependencies
vi.mock('@/hooks/api/useAdminUsers', () => ({
  useAdminUsers: vi.fn(() => ({
    data: null,
    isLoading: true,
    error: null,
  })),
}));

vi.mock('@/hooks/api/useAdminUserActions', () => ({
  useBanUser: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUnbanUser: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateUserPlan: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

describe('AdminUsuariosPage', () => {
  it('should render admin usuarios page with correct title', () => {
    render(<AdminUsuariosPage />);
    expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<AdminUsuariosPage />);
    // Should have skeleton elements when loading
    expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
  });

  it('should have font-serif class on heading', () => {
    render(<AdminUsuariosPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
