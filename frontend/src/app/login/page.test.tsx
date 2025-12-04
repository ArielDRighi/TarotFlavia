import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';

describe('LoginPage', () => {
  it('should render login page with correct title', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { level: 1, name: /login/i })).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<LoginPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<LoginPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(<LoginPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
