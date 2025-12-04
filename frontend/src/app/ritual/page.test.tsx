import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RitualPage from './page';

describe('RitualPage', () => {
  it('should render ritual page with correct title', () => {
    render(<RitualPage />);

    expect(screen.getByRole('heading', { level: 1, name: /ritual/i })).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<RitualPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<RitualPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(<RitualPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
