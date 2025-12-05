import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminUsuariosPage from './page';

describe('AdminUsuariosPage', () => {
  it('should render admin usuarios page with correct title', () => {
    render(<AdminUsuariosPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /gestión de usuarios/i })
    ).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<AdminUsuariosPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<AdminUsuariosPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(<AdminUsuariosPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
