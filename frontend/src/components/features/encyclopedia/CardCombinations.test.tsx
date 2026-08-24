import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { CardCombinations } from './CardCombinations';
import { MOCK_COMBINATION_CARD_NAMES } from '@/test/factories';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const COMBINACIONES = [
  {
    cardSlug: 'seven-of-swords',
    reading: 'Hay engaño detrás del conflicto.',
  },
  {
    cardSlug: 'temperance',
    reading: 'Hay una salida negociada disponible.',
  },
];

/**
 * T-SEO-010: las combinaciones son los **cross-links internos entre fichas** que
 * hoy no existen. Si se renderizaran como texto plano, el bloque cumpliría media
 * función: el crawler no tendría por dónde saltar de una carta a otra.
 */
describe('CardCombinations', () => {
  it('renderiza la sección con su h2', () => {
    render(
      <CardCombinations combinations={COMBINACIONES} cardNames={MOCK_COMBINATION_CARD_NAMES} />
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Combinaciones frecuentes' })
    ).toBeInTheDocument();
  });

  it('enlaza cada combinación a la ficha de la otra carta', () => {
    render(
      <CardCombinations combinations={COMBINACIONES} cardNames={MOCK_COMBINATION_CARD_NAMES} />
    );

    expect(screen.getByRole('link', { name: 'Siete de Espadas' })).toHaveAttribute(
      'href',
      '/enciclopedia/tarot/seven-of-swords'
    );
    expect(screen.getByRole('link', { name: 'La Templanza' })).toHaveAttribute(
      'href',
      '/enciclopedia/tarot/temperance'
    );
  });

  it('muestra la lectura de cada combinación', () => {
    render(
      <CardCombinations combinations={COMBINACIONES} cardNames={MOCK_COMBINATION_CARD_NAMES} />
    );

    const seccion = screen.getByTestId('card-section-combinations');

    expect(within(seccion).getByText('Hay engaño detrás del conflicto.')).toBeInTheDocument();
    expect(within(seccion).getByText('Hay una salida negociada disponible.')).toBeInTheDocument();
  });

  it('enlaza igual cuando el nombre de la carta no se pudo resolver', () => {
    render(<CardCombinations combinations={COMBINACIONES} />);

    expect(screen.getByRole('link', { name: 'Seven Of Swords' })).toHaveAttribute(
      'href',
      '/enciclopedia/tarot/seven-of-swords'
    );
  });

  it('no renderiza nada cuando la ficha todavía no tiene combinaciones', () => {
    const { container } = render(<CardCombinations />);

    expect(container).toBeEmptyDOMElement();
  });

  it('no renderiza nada cuando la lista viene vacía', () => {
    const { container } = render(<CardCombinations combinations={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
