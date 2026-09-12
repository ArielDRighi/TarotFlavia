import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { GuideBlock, GuideHeader, GuideLinks, GuideParagraphs } from './EditorialGuide';

describe('EditorialGuide (T-SEO-015)', () => {
  it('GuideHeader renderiza el título como h2 y la bajada', () => {
    render(<GuideHeader title="Título" lead="Bajada" />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Título');
    expect(screen.getByText('Bajada')).toBeInTheDocument();
  });

  it('GuideParagraphs tolera párrafos idénticos (clave por índice, no por texto)', () => {
    render(<GuideParagraphs paragraphs={['Igual', 'Igual']} />);

    expect(screen.getAllByText('Igual')).toHaveLength(2);
  });

  it('GuideBlock renderiza el encabezado como h3', () => {
    render(<GuideBlock heading="Bloque" paragraphs={['Uno']} />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Bloque');
  });

  it('GuideLinks renderiza enlaces internos en un nav etiquetado', () => {
    render(<GuideLinks links={[{ label: 'Guía', href: '/enciclopedia/guias/x' }]} />);

    expect(screen.getByRole('navigation', { name: /seguir leyendo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Guía' })).toHaveAttribute(
      'href',
      '/enciclopedia/guias/x'
    );
  });
});
