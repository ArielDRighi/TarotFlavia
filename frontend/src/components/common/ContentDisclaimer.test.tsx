import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentDisclaimer } from './ContentDisclaimer';
import { CONTENT_DISCLAIMER } from '@/lib/constants/legal';

describe('ContentDisclaimer (T-SEO-018)', () => {
  it('renderiza el texto acordado, sin variaciones', () => {
    render(<ContentDisclaimer />);

    const note = screen.getByTestId('content-disclaimer');
    expect(note).toHaveTextContent(CONTENT_DISCLAIMER);
  });

  it('es una nota accesible etiquetada en español, no un landmark (puede repetirse por página)', () => {
    render(<ContentDisclaimer />);

    expect(screen.getByRole('note', { name: 'Aviso legal' })).toBeInTheDocument();
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('acepta clases adicionales para adaptarse al contenedor', () => {
    render(<ContentDisclaimer className="mt-10" />);

    expect(screen.getByTestId('content-disclaimer')).toHaveClass('mt-10');
  });
});
