import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { EditorialCard } from './EditorialCard';

const sections = [
  { heading: 'Primero', body: 'Cuerpo del primero.' },
  { heading: 'Segundo', body: 'Cuerpo del segundo.' },
];

describe('EditorialCard', () => {
  it('renderiza el título como h2 y cada sección como h3', () => {
    const { container } = render(
      <EditorialCard testId="editorial" title="Un título" lead="Una entrada." sections={sections} />
    );

    expect(container.querySelectorAll('h1')).toHaveLength(0);
    expect(screen.getByRole('heading', { level: 2, name: 'Un título' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    expect(screen.getByText('Cuerpo del segundo.')).toBeInTheDocument();
  });

  it('usa el testId y el className que le pasa cada consumidor', () => {
    render(
      <EditorialCard
        testId="mi-bloque"
        title="Título"
        lead="Entrada."
        sections={sections}
        className="px-4"
      />
    );

    expect(screen.getByTestId('mi-bloque')).toHaveClass('px-4');
  });

  it('renderiza el pie que le pasan como children', () => {
    render(
      <EditorialCard testId="editorial" title="Título" lead="Entrada." sections={sections}>
        <p>Un pie.</p>
      </EditorialCard>
    );

    expect(screen.getByText('Un pie.')).toBeInTheDocument();
  });

  it('sin secciones no deja el margen de la grilla colgando', () => {
    render(<EditorialCard testId="editorial" title="Título" lead="Entrada." sections={[]} />);

    expect(screen.getByTestId('editorial').querySelector('.mt-6')).toBeNull();
  });
});
