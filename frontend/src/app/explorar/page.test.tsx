import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExplorarPage from './page';

describe('ExplorarPage', () => {
  it('should render explorar page with correct title', () => {
    render(<ExplorarPage />);

    expect(screen.getByRole('heading', { level: 1, name: /explorar/i })).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<ExplorarPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<ExplorarPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(<ExplorarPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
