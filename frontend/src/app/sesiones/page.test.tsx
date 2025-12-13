import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SesionesPage from './page';

// Mock useRequireAuth
const mockUseRequireAuth = vi.fn(() => ({ isLoading: false }));
vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => mockUseRequireAuth(),
}));

// Mock SessionsList component
vi.mock('@/components/features/marketplace/SessionsList', () => ({
  SessionsList: vi.fn(() => <div data-testid="sessions-list">SessionsList Component</div>),
}));

describe('SesionesPage', () => {
  beforeEach(() => {
    mockUseRequireAuth.mockReturnValue({ isLoading: false });
  });

  it('should render sesiones page with correct title', () => {
    render(<SesionesPage />);

    expect(screen.getByRole('heading', { level: 1, name: /mis sesiones/i })).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<SesionesPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<SesionesPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(<SesionesPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });

  it('should render SessionsList component', () => {
    render(<SesionesPage />);

    expect(screen.getByTestId('sessions-list')).toBeInTheDocument();
  });

  it('should show loading state when auth is loading', () => {
    mockUseRequireAuth.mockReturnValueOnce({ isLoading: true });

    render(<SesionesPage />);

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
  });
});
