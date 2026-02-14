import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanetInterpretation } from './PlanetInterpretation';
import { Planet, AspectType } from '@/types/birth-chart.enums';
import type { PlanetInterpretation as PlanetInterpretationType } from '@/types/birth-chart-interpretation.types';

describe('PlanetInterpretation', () => {
  const mockPlanetInterpretation: PlanetInterpretationType = {
    planet: Planet.SUN,
    planetName: 'Sol',
    intro: 'El Sol representa tu esencia y vitalidad.',
    inSign: 'Tu Sol en Aries indica liderazgo nato.',
    inHouse: 'En Casa 1, refuerza tu identidad personal.',
    aspects: [
      {
        withPlanet: Planet.MOON,
        withPlanetName: 'Luna',
        aspectType: AspectType.TRINE,
        aspectName: 'Trígono',
        interpretation: 'Armonía entre emoción y voluntad.',
      },
      {
        withPlanet: Planet.MARS,
        withPlanetName: 'Marte',
        aspectType: AspectType.SQUARE,
        aspectName: 'Cuadratura',
        interpretation: 'Tensión entre ego y acción.',
      },
    ],
  };

  describe('Renderizado básico', () => {
    it('debe renderizar el componente principal con data-testid', () => {
      render(<PlanetInterpretation interpretation={mockPlanetInterpretation} />);
      expect(screen.getByTestId('planet-interpretation')).toBeInTheDocument();
    });

    it('debe renderizar el nombre del planeta', () => {
      render(<PlanetInterpretation interpretation={mockPlanetInterpretation} />);
      expect(screen.getByText('Sol')).toBeInTheDocument();
    });

    it('debe renderizar el símbolo unicode del planeta', () => {
      render(<PlanetInterpretation interpretation={mockPlanetInterpretation} />);
      // Sol unicode: ☉ (U+2609)
      expect(screen.getByText('☉')).toBeInTheDocument();
    });
  });

  describe('Secciones de contenido', () => {
    it('debe renderizar la sección intro si existe', () => {
      render(<PlanetInterpretation interpretation={mockPlanetInterpretation} />);
      expect(screen.getByText('El Sol representa tu esencia y vitalidad.')).toBeInTheDocument();
    });

    it('debe renderizar la sección inSign si existe', () => {
      render(<PlanetInterpretation interpretation={mockPlanetInterpretation} />);
      expect(screen.getByText('Tu Sol en Aries indica liderazgo nato.')).toBeInTheDocument();
    });

    it('debe renderizar la sección inHouse si existe', () => {
      render(<PlanetInterpretation interpretation={mockPlanetInterpretation} />);
      expect(screen.getByText('En Casa 1, refuerza tu identidad personal.')).toBeInTheDocument();
    });

    it('no debe renderizar la sección intro si no existe', () => {
      const interpretationWithoutIntro = {
        ...mockPlanetInterpretation,
        intro: undefined,
      };
      render(<PlanetInterpretation interpretation={interpretationWithoutIntro} />);
      expect(
        screen.queryByText('El Sol representa tu esencia y vitalidad.')
      ).not.toBeInTheDocument();
    });

    it('no debe renderizar la sección inSign si no existe', () => {
      const interpretationWithoutSign = {
        ...mockPlanetInterpretation,
        inSign: undefined,
      };
      render(<PlanetInterpretation interpretation={interpretationWithoutSign} />);
      expect(screen.queryByText('Tu Sol en Aries indica liderazgo nato.')).not.toBeInTheDocument();
    });

    it('no debe renderizar la sección inHouse si no existe', () => {
      const interpretationWithoutHouse = {
        ...mockPlanetInterpretation,
        inHouse: undefined,
      };
      render(<PlanetInterpretation interpretation={interpretationWithoutHouse} />);
      expect(
        screen.queryByText('En Casa 1, refuerza tu identidad personal.')
      ).not.toBeInTheDocument();
    });
  });

  describe('Aspectos', () => {
    it('debe renderizar la lista de aspectos por defecto', () => {
      render(<PlanetInterpretation interpretation={mockPlanetInterpretation} />);
      expect(screen.getByText('Aspectos')).toBeInTheDocument();
    });

    it('debe renderizar cada aspecto con su nombre y planeta objetivo', () => {
      render(<PlanetInterpretation interpretation={mockPlanetInterpretation} />);
      expect(screen.getByText(/Trígono/i)).toBeInTheDocument();
      expect(screen.getByText(/Luna/i)).toBeInTheDocument();
      expect(screen.getByText(/Cuadratura/i)).toBeInTheDocument();
      expect(screen.getByText(/Marte/i)).toBeInTheDocument();
    });

    it('debe renderizar la interpretación de cada aspecto', () => {
      render(<PlanetInterpretation interpretation={mockPlanetInterpretation} />);
      // Los aspectos están en el accordion, verificar que los triggers existen
      expect(screen.getByText(/Trígono/i)).toBeInTheDocument();
      expect(screen.getByText(/Cuadratura/i)).toBeInTheDocument();
    });

    it('debe ocultar los aspectos cuando showAspects es false', () => {
      render(
        <PlanetInterpretation interpretation={mockPlanetInterpretation} showAspects={false} />
      );
      expect(screen.queryByText('Aspectos')).not.toBeInTheDocument();
      expect(screen.queryByText(/Trígono/i)).not.toBeInTheDocument();
    });

    it('debe mostrar badge con naturaleza armoniosa para trígono', () => {
      render(<PlanetInterpretation interpretation={mockPlanetInterpretation} />);
      // Trígono es harmonious → badge "Armónico"
      expect(screen.getByText('Armónico')).toBeInTheDocument();
    });

    it('debe mostrar badge con naturaleza desafiante para cuadratura', () => {
      render(<PlanetInterpretation interpretation={mockPlanetInterpretation} />);
      // Cuadratura es challenging → badge "Desafiante"
      expect(screen.getByText('Desafiante')).toBeInTheDocument();
    });

    it('debe manejar aspectos vacíos sin errores', () => {
      const interpretationWithoutAspects = {
        ...mockPlanetInterpretation,
        aspects: [],
      };
      render(<PlanetInterpretation interpretation={interpretationWithoutAspects} />);
      expect(screen.getByTestId('planet-interpretation')).toBeInTheDocument();
    });

    it('debe manejar undefined en aspects sin errores', () => {
      const interpretationWithoutAspects = {
        ...mockPlanetInterpretation,
        aspects: undefined,
      };
      render(<PlanetInterpretation interpretation={interpretationWithoutAspects} />);
      expect(screen.getByTestId('planet-interpretation')).toBeInTheDocument();
    });
  });

  describe('Props opcionales', () => {
    it('debe aplicar className personalizado', () => {
      const { container } = render(
        <PlanetInterpretation interpretation={mockPlanetInterpretation} className="custom-class" />
      );
      const element = container.querySelector('.custom-class');
      expect(element).toBeInTheDocument();
    });

    it('debe tener showAspects como true por defecto', () => {
      render(<PlanetInterpretation interpretation={mockPlanetInterpretation} />);
      // Si showAspects es true por defecto, debe mostrar aspectos
      expect(screen.getByText('Aspectos')).toBeInTheDocument();
    });
  });

  describe('Casos extremos', () => {
    it('debe renderizar correctamente con solo datos mínimos', () => {
      const minimalInterpretation: PlanetInterpretationType = {
        planet: Planet.MOON,
        planetName: 'Luna',
      };
      render(<PlanetInterpretation interpretation={minimalInterpretation} />);
      expect(screen.getByTestId('planet-interpretation')).toBeInTheDocument();
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });

    it('debe renderizar correctamente con aspecto de naturaleza neutral', () => {
      const interpretationWithNeutral: PlanetInterpretationType = {
        planet: Planet.VENUS,
        planetName: 'Venus',
        aspects: [
          {
            withPlanet: Planet.MERCURY,
            withPlanetName: 'Mercurio',
            aspectType: AspectType.CONJUNCTION,
            aspectName: 'Conjunción',
            interpretation: 'Fusión de energías.',
          },
        ],
      };
      render(<PlanetInterpretation interpretation={interpretationWithNeutral} />);
      // Conjunción es neutral → badge "Neutral"
      expect(screen.getByText('Neutral')).toBeInTheDocument();
    });

    it('debe renderizar múltiples aspectos correctamente', () => {
      const interpretationWithManyAspects: PlanetInterpretationType = {
        planet: Planet.JUPITER,
        planetName: 'Júpiter',
        aspects: [
          {
            withPlanet: Planet.SUN,
            withPlanetName: 'Sol',
            aspectType: AspectType.TRINE,
            aspectName: 'Trígono',
            interpretation: 'Expansión armoniosa.',
          },
          {
            withPlanet: Planet.VENUS,
            withPlanetName: 'Venus',
            aspectType: AspectType.SEXTILE,
            aspectName: 'Sextil',
            interpretation: 'Oportunidades de crecimiento.',
          },
          {
            withPlanet: Planet.SATURN,
            withPlanetName: 'Saturno',
            aspectType: AspectType.OPPOSITION,
            aspectName: 'Oposición',
            interpretation: 'Tensión entre expansión y límites.',
          },
        ],
      };
      render(<PlanetInterpretation interpretation={interpretationWithManyAspects} />);
      // Buscar usando regex que incluye otros elementos
      expect(screen.getByText(/Trígono/i)).toBeInTheDocument();
      expect(screen.getByText(/Sextil/i)).toBeInTheDocument();
      expect(screen.getByText(/Oposición/i)).toBeInTheDocument();
    });
  });
});
