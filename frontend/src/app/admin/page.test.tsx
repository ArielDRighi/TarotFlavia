import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminDashboardPage from './page';

describe('AdminDashboardPage', () => {
  it('should render admin dashboard with correct title', () => {
    render(<AdminDashboardPage />);

    expect(screen.getByRole('heading', { level: 1, name: /dashboard admin/i })).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<AdminDashboardPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<AdminDashboardPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(<AdminDashboardPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
