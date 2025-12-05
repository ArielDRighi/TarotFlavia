import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminTarotistasPage from './page';

describe('AdminTarotistasPage', () => {
  it('should render admin tarotistas page with correct title', () => {
    render(<AdminTarotistasPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /gestión de tarotistas/i })
    ).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<AdminTarotistasPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<AdminTarotistasPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(<AdminTarotistasPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
