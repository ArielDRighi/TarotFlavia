import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { CardReadingCase } from './CardReadingCase';
import type { MajorArcanaReadingCase } from '@/lib/constants/major-arcana-extras.data';

const READING_CASE: MajorArcanaReadingCase = {
  heading: 'El Loco en una consulta sobre cambio de trabajo',
  question: '¿Me conviene aceptar la propuesta de irme a otra ciudad?',
  spread: 'Tirada de tres cartas',
  position: 'Futuro',
  orientation: 'upright',
  reading: [
    'Primer párrafo de la lectura, con las cartas vecinas y cómo se leyó.',
    'Segundo párrafo con la conclusión que se llevó la consultante.',
  ],
};

/**
 * T-SEO-020: el mini-caso de tirada es una de las dos secciones que ninguna
 * ficha del web hispano tiene. Va como sección propia, con `h2`, y con los
 * datos de la consulta (pregunta, tirada, posición, orientación) en el HTML.
 */
describe('CardReadingCase', () => {
  it('renderiza una sección con el encabezado propio de la carta', () => {
    render(<CardReadingCase readingCase={READING_CASE} />);

    const section = screen.getByTestId('card-section-reading-case');
    expect(section.tagName).toBe('SECTION');
    expect(
      within(section).getByRole('heading', {
        level: 2,
        name: 'El Loco en una consulta sobre cambio de trabajo',
      })
    ).toBeInTheDocument();
  });

  it('muestra la pregunta de la consulta como cita', () => {
    render(<CardReadingCase readingCase={READING_CASE} />);

    const question = screen.getByTestId('card-reading-case-question');
    expect(question.tagName).toBe('BLOCKQUOTE');
    expect(question).toHaveTextContent('¿Me conviene aceptar la propuesta de irme a otra ciudad?');
  });

  it('lista la tirada, la posición y la orientación con sus rótulos en español', () => {
    render(<CardReadingCase readingCase={READING_CASE} />);

    const details = screen.getByTestId('card-reading-case-details');
    expect(details.tagName).toBe('DL');
    expect(details).toHaveTextContent('Tirada');
    expect(details).toHaveTextContent('Tirada de tres cartas');
    expect(details).toHaveTextContent('Posición');
    expect(details).toHaveTextContent('Futuro');
    expect(details).toHaveTextContent('Salió');
    expect(details).toHaveTextContent('Derecha');
  });

  it('rotula la carta invertida cuando el caso la tuvo invertida', () => {
    render(<CardReadingCase readingCase={{ ...READING_CASE, orientation: 'reversed' }} />);

    const details = screen.getByTestId('card-reading-case-details');
    expect(details).toHaveTextContent('Invertida');
    expect(details).not.toHaveTextContent('Derecha');
  });

  it('renderiza los párrafos de la lectura', () => {
    render(<CardReadingCase readingCase={READING_CASE} />);

    const section = screen.getByTestId('card-section-reading-case');
    expect(within(section).getByText(/Primer párrafo de la lectura/)).toBeInTheDocument();
    expect(within(section).getByText(/Segundo párrafo con la conclusión/)).toBeInTheDocument();
  });
});
