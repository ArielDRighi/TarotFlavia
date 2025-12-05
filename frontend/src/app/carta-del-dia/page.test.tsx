import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CartaDelDiaPage from './page';

describe('CartaDelDiaPage', () => {
  it('should render carta del día page with correct title', () => {
    render(<CartaDelDiaPage />);

    expect(screen.getByRole('heading', { level: 1, name: /carta del día/i })).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<CartaDelDiaPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<CartaDelDiaPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(<CartaDelDiaPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
