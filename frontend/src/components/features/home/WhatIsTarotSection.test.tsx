import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WhatIsTarotSection } from './WhatIsTarotSection';

describe('WhatIsTarotSection', () => {
  it('should render section title', () => {
    render(<WhatIsTarotSection />);

    const title = screen.getByRole('heading', {
      name: /¿qué es el tarot\?/i,
      level: 2,
    });

    expect(title).toBeInTheDocument();
  });

  it('should render educational content about tarot', () => {
    render(<WhatIsTarotSection />);

    // Verificar que hay contenido educativo
    const content = screen.getByText(/sistema de cartas/i);

    expect(content).toBeInTheDocument();
  });

  it('should mention Arcanos Mayores', () => {
    render(<WhatIsTarotSection />);

    const majorArcana = screen.getByText(/arcanos mayores/i);

    expect(majorArcana).toBeInTheDocument();
  });

  it('should mention Arcanos Menores', () => {
    render(<WhatIsTarotSection />);

    const minorArcana = screen.getByText(/arcanos menores/i);

    expect(minorArcana).toBeInTheDocument();
  });

  it('should explain tarot purpose or use', () => {
    render(<WhatIsTarotSection />);

    // Verificar que explica el propósito (al menos un elemento)
    const purposes = screen.getAllByText(/autoconocimiento|reflexión|guía/i);

    expect(purposes.length).toBeGreaterThan(0);
  });

  it('should have proper semantic structure with section tag', () => {
    const { container } = render(<WhatIsTarotSection />);

    const section = container.querySelector('section');

    expect(section).toBeInTheDocument();
  });

  it('should display visual cards illustration', () => {
    const { container } = render(<WhatIsTarotSection />);

    const illustration = container.querySelector('[data-testid="tarot-cards-illustration"]');

    expect(illustration).toBeInTheDocument();
  });
});
