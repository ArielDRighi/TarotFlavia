import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PerfilPage from './page';

describe('PerfilPage', () => {
  it('should render perfil page with correct title', () => {
    render(<PerfilPage />);

    expect(screen.getByRole('heading', { level: 1, name: /mi perfil/i })).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<PerfilPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<PerfilPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(<PerfilPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
