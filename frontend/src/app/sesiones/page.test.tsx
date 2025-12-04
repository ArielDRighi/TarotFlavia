import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SesionesPage from './page';

describe('SesionesPage', () => {
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
});
