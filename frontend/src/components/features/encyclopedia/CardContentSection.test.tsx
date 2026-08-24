import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CardContentSection } from './CardContentSection';

/**
 * T-SEO-010: cada sección nueva de la ficha se renderiza como `<section>` con su
 * `<h2>` propio y **degrada sola** si la API no mandó el campo. Es lo que
 * permite cargar las 78 fichas de a tandas sin dejar encabezados vacíos.
 */
describe('CardContentSection', () => {
  it('renderiza el encabezado como h2 y el cuerpo', () => {
    render(
      <CardContentSection heading="En el amor" text="Se gana la discusión." testId="card-section" />
    );

    expect(screen.getByRole('heading', { level: 2, name: 'En el amor' })).toBeInTheDocument();
    expect(screen.getByText('Se gana la discusión.')).toBeInTheDocument();
  });

  it('expone la sección con su data-testid', () => {
    render(<CardContentSection heading="En el amor" text="Texto." testId="card-section-love" />);

    expect(screen.getByTestId('card-section-love')).toBeInTheDocument();
  });

  it('separa los párrafos del texto en elementos distintos', () => {
    render(
      <CardContentSection
        heading="El simbolismo de la carta"
        text={'Primer párrafo.\n\nSegundo párrafo.'}
        testId="card-section-symbolism"
      />
    );

    expect(screen.getByText('Primer párrafo.')).toBeInTheDocument();
    expect(screen.getByText('Segundo párrafo.')).toBeInTheDocument();
  });

  it('no renderiza nada cuando el campo no vino en la respuesta', () => {
    const { container } = render(
      <CardContentSection heading="El consejo de la carta" testId="card-section-advice" />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('no renderiza nada cuando el texto está en blanco', () => {
    const { container } = render(
      <CardContentSection heading="¿Sí o no?" text="   " testId="card-section-yes-no" />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
