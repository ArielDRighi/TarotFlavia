import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AstrologySection } from './AstrologySection';

describe('AstrologySection', () => {
  it('debe renderizar la sección de astrología', () => {
    render(<AstrologySection />);

    expect(screen.getByTestId('astrology-section')).toBeInTheDocument();
  });

  it('debe mostrar el título de la sección', () => {
    render(<AstrologySection />);

    expect(screen.getByText('Astrología')).toBeInTheDocument();
  });

  it('debe mostrar exactamente 3 sub-secciones', () => {
    render(<AstrologySection />);

    const subsections = screen.getAllByTestId('astrology-subsection');
    expect(subsections).toHaveLength(3);
  });

  it('debe mostrar sub-sección de Signos Zodiacales', () => {
    render(<AstrologySection />);

    expect(screen.getByText('Signos Zodiacales')).toBeInTheDocument();
  });

  it('debe mostrar sub-sección de Planetas', () => {
    render(<AstrologySection />);

    expect(screen.getByText('Planetas')).toBeInTheDocument();
  });

  it('debe mostrar sub-sección de Casas Astrales', () => {
    render(<AstrologySection />);

    expect(screen.getByText('Casas Astrales')).toBeInTheDocument();
  });

  it('debe tener links funcionales a sus 3 sub-secciones', () => {
    render(<AstrologySection />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(3);
  });

  it('el link de Signos Zodiacales debe apuntar a la ruta correcta', () => {
    render(<AstrologySection />);

    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs.some((href) => href?.includes('signos') || href?.includes('zodiac'))).toBe(true);
  });

  it('el link de Planetas debe apuntar a la ruta correcta', () => {
    render(<AstrologySection />);

    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs.some((href) => href?.includes('planetas') || href?.includes('planet'))).toBe(true);
  });

  it('el link de Casas Astrales debe apuntar a la ruta correcta', () => {
    render(<AstrologySection />);

    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs.some((href) => href?.includes('casas') || href?.includes('house'))).toBe(true);
  });
});
