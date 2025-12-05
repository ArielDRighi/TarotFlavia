import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HistorialPage from './page';

describe('HistorialPage', () => {
  it('should render historial page with correct title', () => {
    render(<HistorialPage />);

    expect(screen.getByRole('heading', { level: 1, name: /historial/i })).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<HistorialPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<HistorialPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(<HistorialPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
