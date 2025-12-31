import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TryWithoutRegisterSection } from './TryWithoutRegisterSection';

describe('TryWithoutRegisterSection', () => {
  it('should render section title', () => {
    render(<TryWithoutRegisterSection />);

    const title = screen.getByRole('heading', {
      name: /prueba sin compromiso/i,
      level: 2,
    });

    expect(title).toBeInTheDocument();
  });

  it('should render explanation text', () => {
    render(<TryWithoutRegisterSection />);

    const explanation = screen.getByText(/1 carta aleatoria sin necesidad de registrarte/i);

    expect(explanation).toBeInTheDocument();
  });

  it('should render call-to-action button with correct link', () => {
    render(<TryWithoutRegisterSection />);

    const ctaButton = screen.getByRole('link', { name: /carta del día gratis/i });

    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '/carta-del-dia');
  });

  it('should have proper semantic structure with section tag', () => {
    const { container } = render(<TryWithoutRegisterSection />);

    const section = container.querySelector('section');

    expect(section).toBeInTheDocument();
  });

  it('should display an icon or visual element', () => {
    render(<TryWithoutRegisterSection />);

    // Buscar un icono o elemento visual (svg o img)
    const visualElement = screen.getByTestId('try-without-register-icon');

    expect(visualElement).toBeInTheDocument();
  });
});
