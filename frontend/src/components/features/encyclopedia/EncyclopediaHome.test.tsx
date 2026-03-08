import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { EncyclopediaHome } from './EncyclopediaHome';

describe('EncyclopediaHome', () => {
  it('debe renderizar el hub de la enciclopedia', () => {
    render(<EncyclopediaHome />);

    expect(screen.getByTestId('encyclopedia-home')).toBeInTheDocument();
  });

  it('debe mostrar el título principal', () => {
    render(<EncyclopediaHome />);

    expect(screen.getByText('Enciclopedia Mística')).toBeInTheDocument();
  });

  it('debe incluir la sección de Tarot', () => {
    render(<EncyclopediaHome />);

    expect(screen.getByTestId('tarot-section')).toBeInTheDocument();
  });

  it('debe incluir la sección de Astrología', () => {
    render(<EncyclopediaHome />);

    expect(screen.getByTestId('astrology-section')).toBeInTheDocument();
  });

  it('debe incluir la sección de Guías', () => {
    render(<EncyclopediaHome />);

    expect(screen.getByTestId('guides-section')).toBeInTheDocument();
  });

  it('debe mostrar el texto de la sección Tarot', () => {
    render(<EncyclopediaHome />);

    expect(screen.getByText('Tarot')).toBeInTheDocument();
  });

  it('debe mostrar el texto de la sección Astrología', () => {
    render(<EncyclopediaHome />);

    expect(screen.getByText('Astrología')).toBeInTheDocument();
  });

  it('debe mostrar el texto de la sección Guías', () => {
    render(<EncyclopediaHome />);

    expect(screen.getByText('Guías')).toBeInTheDocument();
  });
});
