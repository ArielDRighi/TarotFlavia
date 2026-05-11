import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { DisclaimerBanner } from './disclaimer-banner';

describe('DisclaimerBanner', () => {
  it('should render the message', () => {
    render(<DisclaimerBanner message="Este es un contenido placeholder." />);
    expect(screen.getByText(/Este es un contenido placeholder\./)).toBeInTheDocument();
  });

  it('should render with "Nota:" prefix bold', () => {
    render(<DisclaimerBanner message="Mensaje de prueba." />);
    const strong = screen.getByText('Nota:');
    expect(strong.tagName).toBe('STRONG');
  });

  it('should render as an alert (role="alert")', () => {
    render(<DisclaimerBanner message="Mensaje de prueba." />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should apply info variant styles (text-blue-800 class)', () => {
    render(<DisclaimerBanner message="Mensaje de prueba." />);
    expect(screen.getByRole('alert')).toHaveClass('text-blue-800');
  });

  it('should render an Info icon', () => {
    render(<DisclaimerBanner message="Mensaje de prueba." />);
    // El svg del icono Info debe estar presente en el DOM
    const alert = screen.getByRole('alert');
    expect(alert.querySelector('svg')).not.toBeNull();
  });

  it('should accept a custom className', () => {
    render(<DisclaimerBanner message="Mensaje." className="mt-8" />);
    expect(screen.getByRole('alert')).toHaveClass('mt-8');
  });

  it('should have data-testid="disclaimer-banner"', () => {
    render(<DisclaimerBanner message="Mensaje." />);
    expect(screen.getByTestId('disclaimer-banner')).toBeInTheDocument();
  });
});
