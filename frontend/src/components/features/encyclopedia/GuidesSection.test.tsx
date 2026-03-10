import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { GuidesSection } from './GuidesSection';

describe('GuidesSection', () => {
  it('debe renderizar la sección de guías', () => {
    render(<GuidesSection />);

    expect(screen.getByTestId('guides-section')).toBeInTheDocument();
  });

  it('debe mostrar el título de la sección', () => {
    render(<GuidesSection />);

    expect(screen.getByText('Guías')).toBeInTheDocument();
  });

  it('debe renderizar exactamente 6 guías', () => {
    render(<GuidesSection />);

    const guides = screen.getAllByTestId('guide-card');
    expect(guides).toHaveLength(6);
  });

  it('debe mostrar la guía de Numerología', () => {
    render(<GuidesSection />);

    expect(screen.getByText('Numerología')).toBeInTheDocument();
  });

  it('debe mostrar la guía de Péndulo', () => {
    render(<GuidesSection />);

    expect(screen.getByText('Péndulo')).toBeInTheDocument();
  });

  it('debe mostrar la guía de Carta Astral', () => {
    render(<GuidesSection />);

    expect(screen.getByText('Carta Astral')).toBeInTheDocument();
  });

  it('debe mostrar la guía de Rituales', () => {
    render(<GuidesSection />);

    expect(screen.getByText('Rituales')).toBeInTheDocument();
  });

  it('debe mostrar la guía de Horóscopo Occidental', () => {
    render(<GuidesSection />);

    expect(screen.getByText('Horóscopo Occidental')).toBeInTheDocument();
  });

  it('debe mostrar la guía de Horóscopo Chino', () => {
    render(<GuidesSection />);

    expect(screen.getByText('Horóscopo Chino')).toBeInTheDocument();
  });

  it('cada guía debe tener link correcto', () => {
    render(<GuidesSection />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(6);
    links.forEach((link) => {
      expect(link).toHaveAttribute('href');
    });
  });

  it('el link de Numerología debe apuntar a la ruta correcta', () => {
    render(<GuidesSection />);

    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs.some((href) => href?.includes('numerolog'))).toBe(true);
  });

  it('el link de Carta Astral debe apuntar a la ruta correcta', () => {
    render(<GuidesSection />);

    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs.some((href) => href?.includes('carta') || href?.includes('birth'))).toBe(true);
  });
});
