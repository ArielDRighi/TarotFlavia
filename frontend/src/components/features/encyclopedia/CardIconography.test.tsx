import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { CardIconography } from './CardIconography';
import type { MajorArcanaIconography } from '@/lib/constants/major-arcana-extras.data';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const ICONOGRAPHY: MajorArcanaIconography = {
  heading: 'La lámina del Loco: qué mirar',
  intro: 'Pamela Colman Smith dibujó al Loco de espaldas al sol y con la cara vuelta al cielo.',
  symbols: [
    { label: 'La pluma roja', meaning: 'La vida que atraviesa el mazo entero.', x: 63, y: 12 },
    { label: 'El hatillo', meaning: 'Todo el equipaje cabe en un pañuelo.', x: 73, y: 19 },
    { label: 'El perro blanco', meaning: 'El instinto que avisa sin frenar.', x: 80, y: 75 },
  ],
};

/**
 * T-SEO-020: la nota iconográfica es específica de la lámina RWS —qué símbolo
 * concreto está y qué significa— y lleva el diagrama propio de la carta.
 */
describe('CardIconography', () => {
  it('renderiza una sección con el encabezado propio de la carta', () => {
    render(
      <CardIconography
        imageUrl="/images/tarot/the-fool.webp"
        cardName="El Loco"
        iconography={ICONOGRAPHY}
      />
    );

    const section = screen.getByTestId('card-section-iconography');
    expect(section.tagName).toBe('SECTION');
    expect(
      within(section).getByRole('heading', { level: 2, name: 'La lámina del Loco: qué mirar' })
    ).toBeInTheDocument();
  });

  it('renderiza la introducción de la nota', () => {
    render(
      <CardIconography
        imageUrl="/images/tarot/the-fool.webp"
        cardName="El Loco"
        iconography={ICONOGRAPHY}
      />
    );

    expect(screen.getByText(/Pamela Colman Smith dibujó al Loco/)).toBeInTheDocument();
  });

  it('incluye el diagrama de símbolos con la lámina y la leyenda', () => {
    render(
      <CardIconography
        imageUrl="/images/tarot/the-fool.webp"
        cardName="El Loco"
        iconography={ICONOGRAPHY}
      />
    );

    const section = screen.getByTestId('card-section-iconography');
    const diagram = within(section).getByTestId('card-symbol-diagram');

    expect(within(diagram).getByRole('img')).toHaveAttribute('src', '/images/tarot/the-fool.webp');
    expect(within(diagram).getAllByTestId('card-symbol-marker')).toHaveLength(3);
    expect(within(diagram).getByTestId('card-symbol-legend')).toHaveTextContent('El hatillo');
  });
});
