import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TarotistaPerfilPage from './page';

const mockParams = { id: '123' };

describe('TarotistaPerfilPage', () => {
  it('should render tarotista profile page with correct title', () => {
    render(<TarotistaPerfilPage params={mockParams} />);

    expect(
      screen.getByRole('heading', { level: 1, name: /perfil tarotista/i })
    ).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<TarotistaPerfilPage params={mockParams} />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<TarotistaPerfilPage params={mockParams} />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(<TarotistaPerfilPage params={mockParams} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
