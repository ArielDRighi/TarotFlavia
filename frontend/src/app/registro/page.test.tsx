import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegistroPage from './page';

describe('RegistroPage', () => {
  it('should render registro page with correct title', () => {
    render(<RegistroPage />);

    expect(screen.getByRole('heading', { level: 1, name: /registro/i })).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<RegistroPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<RegistroPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(<RegistroPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
