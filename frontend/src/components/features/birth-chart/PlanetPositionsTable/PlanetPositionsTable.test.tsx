/**
 * Tests for PlanetPositionsTable component
 * TDD: These tests are written BEFORE the component implementation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanetPositionsTable } from './PlanetPositionsTable';
import { Planet, ZodiacSign } from '@/types/birth-chart.enums';
import type { PlanetPosition } from '@/types/birth-chart.types';

// Mock dependencies
vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table data-testid="planet-table">{children}</table>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <td className={className}>{children}</td>
  ),
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <tr onClick={onClick} className={className}>
      {children}
    </tr>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  RotateCcw: () => <span data-testid="retrograde-icon">↺</span>,
}));

describe('PlanetPositionsTable', () => {
  const mockPlanets: PlanetPosition[] = [
    {
      planet: Planet.SUN,
      sign: ZodiacSign.ARIES,
      signName: 'Aries',
      signDegree: 23.5,
      formattedPosition: "23° 30' Aries",
      house: 1,
      isRetrograde: false,
    },
    {
      planet: Planet.MOON,
      sign: ZodiacSign.TAURUS,
      signName: 'Tauro',
      signDegree: 12.25,
      formattedPosition: "12° 15' Tauro",
      house: 2,
      isRetrograde: false,
    },
    {
      planet: Planet.MERCURY,
      sign: ZodiacSign.GEMINI,
      signName: 'Géminis',
      signDegree: 5.75,
      formattedPosition: "5° 45' Géminis",
      house: 3,
      isRetrograde: true,
    },
  ];

  const mockAscendant: PlanetPosition = {
    planet: Planet.SUN, // Using SUN as placeholder for AC
    sign: ZodiacSign.LEO,
    signName: 'Leo',
    signDegree: 15.0,
    formattedPosition: "15° 0' Leo",
    house: 1,
    isRetrograde: false,
  };

  const mockMidheaven: PlanetPosition = {
    planet: Planet.SUN, // Using SUN as placeholder for MC
    sign: ZodiacSign.VIRGO,
    signName: 'Virgo',
    signDegree: 28.33,
    formattedPosition: "28° 20' Virgo",
    house: 10,
    isRetrograde: false,
  };

  describe('Rendering', () => {
    it('should render table with planet data', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      const table = screen.getByTestId('planet-table');
      expect(table).toBeInTheDocument();
    });

    it('should display planet names from PLANETS metadata', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      // Check for Spanish planet names (from PLANETS metadata)
      expect(screen.getByText(/Sol/i)).toBeInTheDocument();
      expect(screen.getByText(/Luna/i)).toBeInTheDocument();
      expect(screen.getByText(/Mercurio/i)).toBeInTheDocument();
    });

    it('should display zodiac signs with symbols', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      // Check for zodiac sign names
      expect(screen.getByText(/Aries/i)).toBeInTheDocument();
      expect(screen.getByText(/Tauro/i)).toBeInTheDocument();
      expect(screen.getByText(/Géminis/i)).toBeInTheDocument();
    });

    it('should display degrees and minutes', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      // Sun at 23.5° → 23° 30'
      expect(screen.getByText(/23°/)).toBeInTheDocument();
      expect(screen.getByText(/30'/)).toBeInTheDocument();

      // Moon at 12.25° → 12° 15'
      expect(screen.getByText(/12°/)).toBeInTheDocument();
      expect(screen.getByText(/15'/)).toBeInTheDocument();
    });

    it('should display house badges', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThanOrEqual(3); // At least one per planet
    });

    it('should display table headers', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      // Use getByRole to be more specific about table headers
      expect(screen.getByRole('columnheader', { name: /^Planeta$/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /^Signo$/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /^Posición$/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /^Casa$/i })).toBeInTheDocument();
    });
  });

  describe('Special points (Ascendant & Midheaven)', () => {
    it('should include Ascendant (AC) when provided', () => {
      render(<PlanetPositionsTable planets={mockPlanets} ascendant={mockAscendant} />);

      // Use getAllByText since AC appears multiple times (symbol + name)
      const acElements = screen.getAllByText('AC');
      expect(acElements.length).toBeGreaterThanOrEqual(2); // Symbol + Name
      expect(screen.getByText(/Leo/i)).toBeInTheDocument();
    });

    it('should include Midheaven (MC) when provided', () => {
      render(<PlanetPositionsTable planets={mockPlanets} midheaven={mockMidheaven} />);

      // Use getAllByText since MC appears multiple times (symbol + name)
      const mcElements = screen.getAllByText('MC');
      expect(mcElements.length).toBeGreaterThanOrEqual(2); // Symbol + Name
      expect(screen.getByText(/Virgo/i)).toBeInTheDocument();
    });

    it('should work without Ascendant and Midheaven', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      // Query for exact matches to avoid false positives
      const acElements = screen.queryAllByText((content, element) => {
        return element?.textContent === 'AC';
      });
      const mcElements = screen.queryAllByText((content, element) => {
        return element?.textContent === 'MC';
      });

      expect(acElements.length).toBe(0);
      expect(mcElements.length).toBe(0);
    });

    it('should display both AC and MC when provided', () => {
      render(
        <PlanetPositionsTable
          planets={mockPlanets}
          ascendant={mockAscendant}
          midheaven={mockMidheaven}
        />
      );

      // Use getAllByText for multiple occurrences
      const acElements = screen.getAllByText('AC');
      const mcElements = screen.getAllByText('MC');

      expect(acElements.length).toBeGreaterThanOrEqual(2); // Symbol + Name
      expect(mcElements.length).toBeGreaterThanOrEqual(2); // Symbol + Name
    });
  });

  describe('Retrograde indicator', () => {
    it('should show retrograde icon for retrograde planets', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      // Mercury is retrograde in mock data
      const retrogradeIcons = screen.getAllByTestId('retrograde-icon');
      expect(retrogradeIcons.length).toBe(1);
    });

    it('should not show retrograde icon for non-retrograde planets', () => {
      const nonRetrogradePlanets: PlanetPosition[] = [
        {
          planet: Planet.SUN,
          sign: ZodiacSign.ARIES,
          signName: 'Aries',
          signDegree: 23.5,
          formattedPosition: "23° 30' Aries",
          house: 1,
          isRetrograde: false,
        },
      ];

      render(<PlanetPositionsTable planets={nonRetrogradePlanets} />);

      expect(screen.queryByTestId('retrograde-icon')).not.toBeInTheDocument();
    });
  });

  describe('Interactivity', () => {
    it('should call onPlanetClick when row is clicked', async () => {
      const user = userEvent.setup();
      const onPlanetClick = vi.fn();

      render(<PlanetPositionsTable planets={mockPlanets} onPlanetClick={onPlanetClick} />);

      // Click the first planet row (find by planet name)
      const sunRow = screen.getByText(/Sol/i).closest('tr');
      expect(sunRow).toBeInTheDocument();

      if (sunRow) {
        await user.click(sunRow);
        expect(onPlanetClick).toHaveBeenCalledWith(mockPlanets[0]);
      }
    });

    it('should not error when onPlanetClick is not provided', async () => {
      const user = userEvent.setup();

      render(<PlanetPositionsTable planets={mockPlanets} />);

      const sunRow = screen.getByText(/Sol/i).closest('tr');
      if (sunRow) {
        await expect(user.click(sunRow)).resolves.not.toThrow();
      }
    });

    it('should highlight selected planet', () => {
      render(<PlanetPositionsTable planets={mockPlanets} highlightPlanet={Planet.MOON} />);

      // Find Moon row and check for highlight class
      const moonRow = screen.getByText(/Luna/i).closest('tr');
      expect(moonRow).toHaveClass(/bg-accent|border-accent/);
    });
  });

  describe('Responsive (compact mode)', () => {
    it('should apply compact class when compact=true', () => {
      const { container } = render(<PlanetPositionsTable planets={mockPlanets} compact />);

      // Compact mode should add specific class to table or container
      expect(container.querySelector('[data-compact="true"]')).toBeInTheDocument();
    });

    it('should show full layout when compact=false', () => {
      const { container } = render(<PlanetPositionsTable planets={mockPlanets} compact={false} />);

      expect(container.querySelector('[data-compact="true"]')).not.toBeInTheDocument();
    });
  });

  describe('Card wrapper', () => {
    it('should wrap in Card when showCard=true (default)', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText(/Posiciones Planetarias/i)).toBeInTheDocument();
    });

    it('should not wrap in Card when showCard=false', () => {
      render(<PlanetPositionsTable planets={mockPlanets} showCard={false} />);

      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });

    it('should show card title and description', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      expect(screen.getByText(/Posiciones Planetarias/i)).toBeInTheDocument();
      expect(screen.getByText(/ubicación de cada planeta/i)).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show message when no planets provided', () => {
      render(<PlanetPositionsTable planets={[]} />);

      expect(screen.getByText(/no hay datos/i)).toBeInTheDocument();
    });
  });

  describe('Tooltips', () => {
    it('should have title attribute for tooltips', () => {
      const { container } = render(<PlanetPositionsTable planets={mockPlanets} />);

      // Check for title attributes (native tooltips)
      const elementsWithTooltip = container.querySelectorAll('[title]');
      expect(elementsWithTooltip.length).toBeGreaterThan(0);
    });
  });

  describe('Encyclopedia cross-links', () => {
    it('nombre de planeta debe renderizar como link a la enciclopedia', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      // Sol → /enciclopedia/astrologia/planetas/sol
      const sunLink = screen.getByRole('link', { name: /Sol/i });
      expect(sunLink).toBeInTheDocument();
    });

    it('link de planeta debe apuntar a /enciclopedia/astrologia/planetas/{slug}', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      const sunLink = screen.getByRole('link', { name: /Sol/i });
      expect(sunLink).toHaveAttribute('href', '/enciclopedia/astrologia/planetas/sol');

      const moonLink = screen.getByRole('link', { name: /Luna/i });
      expect(moonLink).toHaveAttribute('href', '/enciclopedia/astrologia/planetas/luna');
    });

    it('nombre de signo en resultado debe renderizar como link a la enciclopedia', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      // Aries signo
      const ariesLink = screen.getByRole('link', { name: /Aries/i });
      expect(ariesLink).toBeInTheDocument();
    });

    it('link de signo debe apuntar a /enciclopedia/astrologia/signos/{slug}', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      // Aries → slug 'aries'
      const ariesLink = screen.getByRole('link', { name: /Aries/i });
      expect(ariesLink).toHaveAttribute('href', '/enciclopedia/astrologia/signos/aries');

      // Tauro (ZodiacSign.TAURUS) → slug 'tauro'
      const tauroLink = screen.getByRole('link', { name: /Tauro/i });
      expect(tauroLink).toHaveAttribute('href', '/enciclopedia/astrologia/signos/tauro');
    });

    it('links no deben tener target="_blank"', () => {
      render(<PlanetPositionsTable planets={mockPlanets} />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).not.toHaveAttribute('target', '_blank');
      });
    });

    it('AC y MC no deben renderizar como links de planeta', () => {
      render(
        <PlanetPositionsTable
          planets={mockPlanets}
          ascendant={mockAscendant}
          midheaven={mockMidheaven}
        />
      );

      // AC and MC are special points, not encyclopedia articles
      const links = screen.getAllByRole('link');
      const linkTexts = links.map((l) => l.textContent);
      expect(linkTexts).not.toContain('AC');
      expect(linkTexts).not.toContain('MC');
    });
  });

  describe('Element colors', () => {
    it('should apply fire element color (red) for fire signs', () => {
      const firePlanet: PlanetPosition[] = [
        {
          planet: Planet.MARS,
          sign: ZodiacSign.ARIES, // Fire sign
          signName: 'Aries',
          signDegree: 10,
          formattedPosition: "10° 0' Aries",
          house: 1,
          isRetrograde: false,
        },
      ];

      const { container } = render(<PlanetPositionsTable planets={firePlanet} />);

      // Check for red color class
      expect(container.querySelector('.text-red-500')).toBeInTheDocument();
    });

    it('should apply earth element color (green) for earth signs', () => {
      const earthPlanet: PlanetPosition[] = [
        {
          planet: Planet.VENUS,
          sign: ZodiacSign.TAURUS, // Earth sign
          signName: 'Tauro',
          signDegree: 10,
          formattedPosition: "10° 0' Tauro",
          house: 2,
          isRetrograde: false,
        },
      ];

      const { container } = render(<PlanetPositionsTable planets={earthPlanet} />);

      // Check for green color class
      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('should apply air element color (yellow) for air signs', () => {
      const airPlanet: PlanetPosition[] = [
        {
          planet: Planet.MERCURY,
          sign: ZodiacSign.GEMINI, // Air sign
          signName: 'Géminis',
          signDegree: 10,
          formattedPosition: "10° 0' Géminis",
          house: 3,
          isRetrograde: false,
        },
      ];

      const { container } = render(<PlanetPositionsTable planets={airPlanet} />);

      // Check for yellow color class
      expect(container.querySelector('.text-yellow-500')).toBeInTheDocument();
    });

    it('should apply water element color (blue) for water signs', () => {
      const waterPlanet: PlanetPosition[] = [
        {
          planet: Planet.MOON,
          sign: ZodiacSign.CANCER, // Water sign
          signName: 'Cáncer',
          signDegree: 10,
          formattedPosition: "10° 0' Cáncer",
          house: 4,
          isRetrograde: false,
        },
      ];

      const { container } = render(<PlanetPositionsTable planets={waterPlanet} />);

      // Check for blue color class
      expect(container.querySelector('.text-blue-500')).toBeInTheDocument();
    });
  });
});
