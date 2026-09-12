import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentDisclaimer } from './ContentDisclaimer';
import { CONTENT_DISCLAIMER } from '@/lib/constants/legal';

describe('ContentDisclaimer (T-SEO-018)', () => {
  it('renderiza el texto acordado, sin variaciones', () => {
    render(<ContentDisclaimer />);

    const aside = screen.getByTestId('content-disclaimer');
    expect(aside.tagName).toBe('ASIDE');
    expect(aside).toHaveTextContent(CONTENT_DISCLAIMER);
  });

  it('es accesible como región complementaria etiquetada en español', () => {
    render(<ContentDisclaimer />);

    expect(screen.getByRole('complementary', { name: 'Aviso legal' })).toBeInTheDocument();
  });

  it('acepta clases adicionales para adaptarse al contenedor', () => {
    render(<ContentDisclaimer className="mt-10" />);

    expect(screen.getByTestId('content-disclaimer')).toHaveClass('mt-10');
  });
});
