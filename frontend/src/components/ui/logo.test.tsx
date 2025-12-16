import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './logo';

describe('Logo', () => {
  it('should render logo image with alt text', () => {
    render(<Logo />);

    const logo = screen.getByAltText('TarotFlavia');
    expect(logo).toBeInTheDocument();
  });

  it('should apply custom size', () => {
    render(<Logo width={200} height={80} />);

    const logo = screen.getByAltText('TarotFlavia');
    expect(logo).toBeInTheDocument();
  });

  it('should apply priority when specified', () => {
    render(<Logo priority />);

    const logo = screen.getByAltText('TarotFlavia');
    expect(logo).not.toHaveAttribute('loading', 'lazy');
  });

  it('should accept custom className', () => {
    render(<Logo className="custom-logo-class" />);

    const logo = screen.getByAltText('TarotFlavia');
    expect(logo.parentElement).toHaveClass('custom-logo-class');
  });
});
