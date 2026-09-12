import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { CardSymbolDiagram } from './CardSymbolDiagram';
import type { CardSymbolMarker } from '@/lib/constants/major-arcana-extras.data';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const SYMBOLS: CardSymbolMarker[] = [
  { label: 'La pluma roja', meaning: 'La vida que atraviesa el mazo entero.', x: 63, y: 12 },
  { label: 'El hatillo', meaning: 'Todo el equipaje cabe en un pañuelo.', x: 73, y: 19 },
  { label: 'El perro blanco', meaning: 'El instinto que avisa sin frenar.', x: 80, y: 75 },
];

/**
 * T-SEO-020: media original por carta. La lámina RWS es CC0; lo propio es el
 * diagrama con los símbolos señalados y su leyenda, y es lo que tiene que
 * llegar al HTML.
 */
describe('CardSymbolDiagram', () => {
  it('renderiza una figura con la lámina de la carta', () => {
    render(
      <CardSymbolDiagram
        imageUrl="/images/tarot/the-fool.webp"
        cardName="El Loco"
        symbols={SYMBOLS}
      />
    );

    const figure = screen.getByTestId('card-symbol-diagram');
    expect(figure.tagName).toBe('FIGURE');
    expect(within(figure).getByRole('img')).toHaveAttribute('src', '/images/tarot/the-fool.webp');
  });

  it('el alt describe que es un diagrama de símbolos, no solo la carta', () => {
    render(
      <CardSymbolDiagram
        imageUrl="/images/tarot/the-fool.webp"
        cardName="El Loco"
        symbols={SYMBOLS}
      />
    );

    expect(screen.getByRole('img')).toHaveAttribute(
      'alt',
      expect.stringMatching(/El Loco.*símbolos|símbolos.*El Loco/i)
    );
  });

  it('coloca un marcador numerado por símbolo, en la coordenada indicada', () => {
    render(
      <CardSymbolDiagram
        imageUrl="/images/tarot/the-fool.webp"
        cardName="El Loco"
        symbols={SYMBOLS}
      />
    );

    const markers = screen.getAllByTestId('card-symbol-marker');

    expect(markers).toHaveLength(3);
    expect(markers[0]).toHaveTextContent('1');
    expect(markers[0]).toHaveStyle({ left: '63%', top: '12%' });
    expect(markers[2]).toHaveTextContent('3');
    expect(markers[2]).toHaveStyle({ left: '80%', top: '75%' });
  });

  it('los marcadores son decorativos: el texto vive en la leyenda', () => {
    render(
      <CardSymbolDiagram
        imageUrl="/images/tarot/the-fool.webp"
        cardName="El Loco"
        symbols={SYMBOLS}
      />
    );

    screen.getAllByTestId('card-symbol-marker').forEach((marker) => {
      expect(marker).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('la leyenda es una lista ordenada con etiqueta y significado de cada símbolo', () => {
    render(
      <CardSymbolDiagram
        imageUrl="/images/tarot/the-fool.webp"
        cardName="El Loco"
        symbols={SYMBOLS}
      />
    );

    const legend = screen.getByTestId('card-symbol-legend');
    const items = within(legend).getAllByRole('listitem');

    expect(legend.tagName).toBe('OL');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('La pluma roja');
    expect(items[0]).toHaveTextContent('La vida que atraviesa el mazo entero.');
    expect(items[1]).toHaveTextContent('El hatillo');
  });

  it('la leyenda va dentro del figcaption de la figura', () => {
    render(
      <CardSymbolDiagram
        imageUrl="/images/tarot/the-fool.webp"
        cardName="El Loco"
        symbols={SYMBOLS}
      />
    );

    const figure = screen.getByTestId('card-symbol-diagram');
    const caption = figure.querySelector('figcaption');

    expect(caption).not.toBeNull();
    expect(caption).toContainElement(screen.getByTestId('card-symbol-legend'));
  });

  it('no renderiza nada sin símbolos', () => {
    const { container } = render(
      <CardSymbolDiagram imageUrl="/images/tarot/the-fool.webp" cardName="El Loco" symbols={[]} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
