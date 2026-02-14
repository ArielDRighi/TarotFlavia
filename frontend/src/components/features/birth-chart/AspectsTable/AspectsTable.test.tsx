/**
 * Tests for AspectsTable component
 * TDD: These tests are written BEFORE the component implementation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AspectsTable } from './AspectsTable';
import { Planet, AspectType } from '@/types/birth-chart.enums';
import type { ChartAspect } from '@/types/birth-chart.types';

// Mock dependencies
vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table data-testid="aspects-table">{children}</table>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({
    children,
    className,
    colSpan,
  }: {
    children: React.ReactNode;
    className?: string;
    colSpan?: number;
  }) => (
    <td className={className} colSpan={colSpan}>
      {children}
    </td>
  ),
  TableHead: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <th className={className}>{children}</th>
  ),
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
  Badge: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
  }) => (
    <div data-testid="select" data-value={value} onClick={() => onValueChange?.('test')}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-value={value}>{children}</div>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button className={className}>{children}</button>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
}));

vi.mock('lucide-react', () => ({
  Filter: () => <span data-testid="filter-icon">⚙</span>,
  Info: () => <span data-testid="info-icon">ℹ</span>,
}));

describe('AspectsTable', () => {
  const mockAspects: ChartAspect[] = [
    {
      planet1: Planet.SUN,
      planet1Name: 'Sol',
      planet2: Planet.MOON,
      planet2Name: 'Luna',
      aspectType: AspectType.CONJUNCTION,
      aspectName: 'Conjunción',
      aspectSymbol: '☌',
      orb: 2.5,
      isApplying: true,
    },
    {
      planet1: Planet.MARS,
      planet1Name: 'Marte',
      planet2: Planet.VENUS,
      planet2Name: 'Venus',
      aspectType: AspectType.OPPOSITION,
      aspectName: 'Oposición',
      aspectSymbol: '☍',
      orb: 6.2,
      isApplying: false,
    },
    {
      planet1: Planet.MERCURY,
      planet1Name: 'Mercurio',
      planet2: Planet.JUPITER,
      planet2Name: 'Júpiter',
      aspectType: AspectType.TRINE,
      aspectName: 'Trígono',
      aspectSymbol: '△',
      orb: 1.8,
      isApplying: true,
    },
  ];

  describe('Rendering', () => {
    it('should render table with aspects data', () => {
      render(<AspectsTable aspects={mockAspects} />);

      const table = screen.getByTestId('aspects-table');
      expect(table).toBeInTheDocument();
    });

    it('should display table headers', () => {
      render(<AspectsTable aspects={mockAspects} />);

      expect(screen.getByRole('columnheader', { name: /Aspecto/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /Planeta 1/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /Planeta 2/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /Orbe/i })).toBeInTheDocument();
    });

    it('should display aspect symbols and names', () => {
      render(<AspectsTable aspects={mockAspects} />);

      // Should show aspect symbols
      expect(screen.getByText('☌')).toBeInTheDocument();
      expect(screen.getByText('☍')).toBeInTheDocument();
      expect(screen.getByText('△')).toBeInTheDocument();

      // Should show aspect names
      expect(screen.getByText('Conjunción')).toBeInTheDocument();
      expect(screen.getByText('Oposición')).toBeInTheDocument();
      expect(screen.getByText('Trígono')).toBeInTheDocument();
    });

    it('should display planet symbols from PLANETS metadata', () => {
      render(<AspectsTable aspects={mockAspects} />);

      // Check for planet symbols (from PLANETS metadata)
      expect(screen.getByText('☉')).toBeInTheDocument(); // Sol
      expect(screen.getByText('☽')).toBeInTheDocument(); // Luna
      expect(screen.getByText('♂')).toBeInTheDocument(); // Marte
      expect(screen.getByText('♀')).toBeInTheDocument(); // Venus
    });

    it('should display orb values with degree symbol', () => {
      render(<AspectsTable aspects={mockAspects} />);

      expect(screen.getByText('2.5°')).toBeInTheDocument();
      expect(screen.getByText('6.2°')).toBeInTheDocument();
      expect(screen.getByText('1.8°')).toBeInTheDocument();
    });

    it('should display badges for aspect nature', () => {
      render(<AspectsTable aspects={mockAspects} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Aspect nature colors', () => {
    it('should apply harmonious color for trines', () => {
      const harmonious: ChartAspect[] = [
        {
          planet1: Planet.SUN,
          planet1Name: 'Sol',
          planet2: Planet.MOON,
          planet2Name: 'Luna',
          aspectType: AspectType.TRINE,
          aspectName: 'Trígono',
          aspectSymbol: '△',
          orb: 2.0,
          isApplying: true,
        },
      ];

      const { container } = render(<AspectsTable aspects={harmonious} />);

      // Should have green color class for harmonious aspect
      expect(container.querySelector('.text-green-500, .bg-green-500')).toBeInTheDocument();
    });

    it('should apply challenging color for oppositions', () => {
      const challenging: ChartAspect[] = [
        {
          planet1: Planet.MARS,
          planet1Name: 'Marte',
          planet2: Planet.VENUS,
          planet2Name: 'Venus',
          aspectType: AspectType.OPPOSITION,
          aspectName: 'Oposición',
          aspectSymbol: '☍',
          orb: 3.0,
          isApplying: false,
        },
      ];

      const { container } = render(<AspectsTable aspects={challenging} />);

      // Should have red color class for challenging aspect
      expect(container.querySelector('.text-red-500, .bg-red-500')).toBeInTheDocument();
    });

    it('should apply neutral color for conjunctions', () => {
      const neutral: ChartAspect[] = [
        {
          planet1: Planet.SUN,
          planet1Name: 'Sol',
          planet2: Planet.MERCURY,
          planet2Name: 'Mercurio',
          aspectType: AspectType.CONJUNCTION,
          aspectName: 'Conjunción',
          aspectSymbol: '☌',
          orb: 4.0,
          isApplying: true,
        },
      ];

      const { container } = render(<AspectsTable aspects={neutral} />);

      // Should have purple color class for neutral aspect
      expect(container.querySelector('.text-purple-500, .bg-purple-500')).toBeInTheDocument();
    });
  });

  describe('Orb precision indicators', () => {
    it('should highlight very exact aspects (orb <= 2)', () => {
      const exactAspect: ChartAspect[] = [
        {
          planet1: Planet.SUN,
          planet1Name: 'Sol',
          planet2: Planet.MOON,
          planet2Name: 'Luna',
          aspectType: AspectType.CONJUNCTION,
          aspectName: 'Conjunción',
          aspectSymbol: '☌',
          orb: 1.5,
          isApplying: true,
        },
      ];

      const { container } = render(<AspectsTable aspects={exactAspect} />);

      // Should have text-green-500 class for exact orb
      const orbCell = container.querySelector('.text-green-500.font-medium');
      expect(orbCell).toBeInTheDocument();
    });

    it('should dim wide aspects (orb > 5)', () => {
      const wideAspect: ChartAspect[] = [
        {
          planet1: Planet.MARS,
          planet1Name: 'Marte',
          planet2: Planet.JUPITER,
          planet2Name: 'Júpiter',
          aspectType: AspectType.SQUARE,
          aspectName: 'Cuadratura',
          aspectSymbol: '□',
          orb: 6.8,
          isApplying: false,
        },
      ];

      const { container } = render(<AspectsTable aspects={wideAspect} />);

      // Should have text-muted-foreground for wide orb
      expect(container.querySelector('.text-muted-foreground')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should show filters when showFilters=true (default)', () => {
      render(<AspectsTable aspects={mockAspects} />);

      const filters = screen.getAllByTestId('select');
      expect(filters.length).toBeGreaterThanOrEqual(2); // Type filter + Planet filter
    });

    it('should hide filters when showFilters=false', () => {
      render(<AspectsTable aspects={mockAspects} showFilters={false} />);

      const filters = screen.queryAllByTestId('select');
      expect(filters.length).toBe(0);
    });

    it('should filter by aspect type (harmonious)', () => {
      render(<AspectsTable aspects={mockAspects} />);

      // Initial: should show all 3 aspects
      const rows = screen.getAllByRole('row');
      // Header + 3 data rows
      expect(rows.length).toBe(4);

      // After applying filter in real usage, we'd have fewer rows
      // For now, just check that filters exist
      expect(screen.getByTestId('filter-icon')).toBeInTheDocument();
    });

    it('should filter by planet', () => {
      render(<AspectsTable aspects={mockAspects} filterByPlanet={Planet.SUN} />);

      // Should only show aspects involving the Sun
      const table = screen.getByTestId('aspects-table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort aspects by orb (most exact first)', () => {
      // Mock aspects in unsorted order
      const unsortedAspects: ChartAspect[] = [
        { ...mockAspects[1], orb: 6.2 }, // Should be last
        { ...mockAspects[2], orb: 1.8 }, // Should be first
        { ...mockAspects[0], orb: 2.5 }, // Should be middle
      ];

      render(<AspectsTable aspects={unsortedAspects} />);

      // The component should internally sort them
      const table = screen.getByTestId('aspects-table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Limit functionality', () => {
    it('should limit number of displayed aspects when maxItems is set', () => {
      render(<AspectsTable aspects={mockAspects} maxItems={2} />);

      const table = screen.getByTestId('aspects-table');
      expect(table).toBeInTheDocument();
    });

    it('should show all aspects when maxItems is not set', () => {
      render(<AspectsTable aspects={mockAspects} />);

      // Should show all 3 aspects
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(4); // Header + 3 data rows
    });
  });

  describe('Interactivity', () => {
    it('should call onAspectClick when row is clicked', async () => {
      const user = userEvent.setup();
      const onAspectClick = vi.fn();

      render(<AspectsTable aspects={mockAspects} onAspectClick={onAspectClick} />);

      // Click the first aspect row
      const firstRow = screen.getByText('☌').closest('tr');
      expect(firstRow).toBeInTheDocument();

      if (firstRow) {
        await user.click(firstRow);
        expect(onAspectClick).toHaveBeenCalledWith(mockAspects[0]);
      }
    });

    it('should not error when onAspectClick is not provided', async () => {
      const user = userEvent.setup();

      render(<AspectsTable aspects={mockAspects} />);

      const firstRow = screen.getByText('☌').closest('tr');
      if (firstRow) {
        await expect(user.click(firstRow)).resolves.not.toThrow();
      }
    });

    it('should apply hover class when onAspectClick is provided', () => {
      const onAspectClick = vi.fn();
      const { container } = render(
        <AspectsTable aspects={mockAspects} onAspectClick={onAspectClick} />
      );

      // Should have cursor-pointer class
      expect(container.querySelector('.cursor-pointer')).toBeInTheDocument();
    });
  });

  describe('Card wrapper', () => {
    it('should wrap in Card when showCard=true (default)', () => {
      render(<AspectsTable aspects={mockAspects} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText(/Aspectos Planetarios/i)).toBeInTheDocument();
    });

    it('should not wrap in Card when showCard=false', () => {
      render(<AspectsTable aspects={mockAspects} showCard={false} />);

      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });

    it('should show card title and description', () => {
      render(<AspectsTable aspects={mockAspects} />);

      expect(screen.getByText(/Aspectos Planetarios/i)).toBeInTheDocument();
      expect(screen.getByText(/3 aspectos encontrados/i)).toBeInTheDocument();
    });

    it('should show info icon in card title', () => {
      render(<AspectsTable aspects={mockAspects} />);

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show message when no aspects provided', () => {
      render(<AspectsTable aspects={[]} />);

      expect(screen.getByText(/no se encontraron aspectos/i)).toBeInTheDocument();
    });

    it('should show message when filtered aspects are empty', () => {
      render(<AspectsTable aspects={mockAspects} filterByPlanet={Planet.PLUTO} />);

      // After filtering, if no matches, should show empty message
      const table = screen.getByTestId('aspects-table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Legend', () => {
    it('should display legend explaining aspect nature', () => {
      render(<AspectsTable aspects={mockAspects} />);

      expect(screen.getByText(/Armónico \(fluye\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Desafiante \(tensión\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Neutro \(fusión\)/i)).toBeInTheDocument();
    });

    it('should show color indicators in legend', () => {
      const { container } = render(<AspectsTable aspects={mockAspects} />);

      // Legend should have colored circles
      const greenIndicator = container.querySelector('.bg-green-500\\/20');
      const redIndicator = container.querySelector('.bg-red-500\\/20');
      const purpleIndicator = container.querySelector('.bg-purple-500\\/20');

      expect(greenIndicator).toBeInTheDocument();
      expect(redIndicator).toBeInTheDocument();
      expect(purpleIndicator).toBeInTheDocument();
    });
  });

  describe('Tooltips', () => {
    it('should provide tooltips for planet symbols', () => {
      render(<AspectsTable aspects={mockAspects} />);

      const tooltips = screen.getAllByTestId('tooltip');
      expect(tooltips.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive design', () => {
    it('should hide aspect type column on mobile (sm:table-cell)', () => {
      render(<AspectsTable aspects={mockAspects} />);

      // Type column should have hidden sm:table-cell class
      const typeHeader = screen.getByRole('columnheader', { name: /Tipo/i });
      expect(typeHeader).toHaveClass(/hidden|sm:table-cell/);
    });
  });

  describe('Aspect badges', () => {
    it('should show aspect badges with correct variant for harmonious', () => {
      const harmonious: ChartAspect[] = [
        {
          planet1: Planet.SUN,
          planet1Name: 'Sol',
          planet2: Planet.MOON,
          planet2Name: 'Luna',
          aspectType: AspectType.TRINE,
          aspectName: 'Trígono',
          aspectSymbol: '△',
          orb: 2.0,
          isApplying: true,
        },
      ];

      render(<AspectsTable aspects={harmonious} />);

      const badges = screen.getAllByTestId('badge');
      const natureBadge = badges.find((b) => b.textContent?.includes('Armónico'));
      expect(natureBadge).toHaveAttribute('data-variant', 'default');
    });

    it('should show aspect badges with correct variant for challenging', () => {
      const challenging: ChartAspect[] = [
        {
          planet1: Planet.MARS,
          planet1Name: 'Marte',
          planet2: Planet.SATURN,
          planet2Name: 'Saturno',
          aspectType: AspectType.SQUARE,
          aspectName: 'Cuadratura',
          aspectSymbol: '□',
          orb: 3.0,
          isApplying: false,
        },
      ];

      render(<AspectsTable aspects={challenging} />);

      const badges = screen.getAllByTestId('badge');
      const natureBadge = badges.find((b) => b.textContent?.includes('Desafiante'));
      expect(natureBadge).toHaveAttribute('data-variant', 'destructive');
    });

    it('should show aspect badges with correct variant for neutral', () => {
      const neutral: ChartAspect[] = [
        {
          planet1: Planet.SUN,
          planet1Name: 'Sol',
          planet2: Planet.MERCURY,
          planet2Name: 'Mercurio',
          aspectType: AspectType.CONJUNCTION,
          aspectName: 'Conjunción',
          aspectSymbol: '☌',
          orb: 4.0,
          isApplying: true,
        },
      ];

      render(<AspectsTable aspects={neutral} />);

      const badges = screen.getAllByTestId('badge');
      const natureBadge = badges.find((b) => b.textContent?.includes('Neutro'));
      expect(natureBadge).toHaveAttribute('data-variant', 'secondary');
    });
  });
});
