import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecuperarPasswordPage from './page';

describe('RecuperarPasswordPage', () => {
  it('should render recuperar password page with correct title', () => {
    render(<RecuperarPasswordPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /recuperar contraseña/i })
    ).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(<RecuperarPasswordPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(<RecuperarPasswordPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(<RecuperarPasswordPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
