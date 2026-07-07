import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ServiceIntro } from './ServiceIntro';
import type { ServiceIntroData } from '@/lib/constants/service-intros.data';

const mockData: ServiceIntroData = {
  testId: 'mock-intro',
  title: '¿Qué es el Servicio de Prueba?',
  intro: 'Este es un servicio de prueba para validar el componente genérico.',
  sections: [
    {
      heading: '📅 Primera Sección',
      items: [
        { term: 'Concepto Uno', description: 'Descripción del primer concepto de prueba.' },
        { term: 'Concepto Dos', description: 'Descripción del segundo concepto de prueba.' },
      ],
    },
    {
      heading: '✍️ Segunda Sección',
      accent: 'indigo',
      items: [{ term: 'Concepto Tres', description: 'Descripción del tercer concepto.' }],
    },
  ],
  note: 'Esta es una nota destacada de prueba.',
  href: '/enciclopedia/guias/guia-prueba',
};

describe('ServiceIntro', () => {
  it('debe renderizar el título principal como heading h2', () => {
    render(<ServiceIntro data={mockData} />);

    expect(
      screen.getByRole('heading', { level: 2, name: /qué es el servicio de prueba/i })
    ).toBeInTheDocument();
  });

  it('debe mostrar el texto introductorio', () => {
    render(<ServiceIntro data={mockData} />);

    expect(screen.getByText(/servicio de prueba para validar/i)).toBeInTheDocument();
  });

  it('debe renderizar los headings de sección como h3', () => {
    render(<ServiceIntro data={mockData} />);

    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    expect(h3Headings).toHaveLength(2);
    expect(screen.getByText(/primera sección/i)).toBeInTheDocument();
    expect(screen.getByText(/segunda sección/i)).toBeInTheDocument();
  });

  it('debe renderizar todos los bullets con término y descripción', () => {
    render(<ServiceIntro data={mockData} />);

    expect(screen.getByText(/concepto uno/i)).toBeInTheDocument();
    expect(screen.getByText(/concepto dos/i)).toBeInTheDocument();
    expect(screen.getByText(/concepto tres/i)).toBeInTheDocument();
    expect(screen.getByText(/primer concepto de prueba/i)).toBeInTheDocument();
  });

  it('debe renderizar la nota cuando se proporciona', () => {
    render(<ServiceIntro data={mockData} />);

    expect(screen.getByText(/nota destacada de prueba/i)).toBeInTheDocument();
  });

  it('no debe renderizar la nota cuando no se proporciona', () => {
    const dataWithoutNote: ServiceIntroData = { ...mockData, note: undefined };
    render(<ServiceIntro data={dataWithoutNote} />);

    expect(screen.queryByText(/nota destacada de prueba/i)).not.toBeInTheDocument();
  });

  it('debe renderizar el botón "Ver más en la Enciclopedia" con el href correcto', () => {
    render(<ServiceIntro data={mockData} />);

    const link = screen.getByRole('link', { name: /ver más en la enciclopedia/i });
    expect(link).toHaveAttribute('href', '/enciclopedia/guias/guia-prueba');
  });

  it('debe renderizar las secciones en una grilla', () => {
    const { container } = render(<ServiceIntro data={mockData} />);

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
  });

  it('debe aplicar la clase personalizada cuando se proporciona', () => {
    const { container } = render(<ServiceIntro data={mockData} className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('debe tener el estilo de fondo con gradiente', () => {
    const { container } = render(<ServiceIntro data={mockData} />);

    expect(container.firstChild).toHaveClass('from-purple-50');
  });

  it('debe usar el data-testid proporcionado', () => {
    render(<ServiceIntro data={mockData} />);

    expect(screen.getByTestId('mock-intro')).toBeInTheDocument();
  });
});
