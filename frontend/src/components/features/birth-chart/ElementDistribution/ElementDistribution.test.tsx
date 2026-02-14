/**
 * Tests for ElementDistribution component
 * TDD: These tests are written BEFORE the component implementation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ElementDistribution } from './ElementDistribution';
import type { ChartDistribution } from '@/types/birth-chart.types';

// Mock dependencies
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 className={className}>{children}</h3>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({
    value,
    className,
    indicatorClassName,
  }: {
    value: number;
    className?: string;
    indicatorClassName?: string;
  }) => (
    <div
      data-testid="progress-bar"
      data-value={value}
      className={className}
      data-indicator-class={indicatorClassName}
    >
      <div style={{ width: `${value}%` }}></div>
    </div>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
  TooltipContent: ({
    children,
    side,
    className,
  }: {
    children: React.ReactNode;
    side?: string;
    className?: string;
  }) => (
    <div data-testid="tooltip-content" data-side={side} className={className}>
      {children}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  Flame: () => <span data-testid="icon-flame">🔥</span>,
  Mountain: () => <span data-testid="icon-mountain">⛰️</span>,
  Wind: () => <span data-testid="icon-wind">💨</span>,
  Droplets: () => <span data-testid="icon-droplets">💧</span>,
}));

describe('ElementDistribution', () => {
  const mockDistribution: ChartDistribution = {
    elements: [
      { name: 'Fuego', count: 4, percentage: 40 },
      { name: 'Tierra', count: 3, percentage: 30 },
      { name: 'Aire', count: 2, percentage: 20 },
      { name: 'Agua', count: 1, percentage: 10 },
    ],
    modalities: [
      { name: 'Cardinal', count: 4, percentage: 40 },
      { name: 'Fijo', count: 3, percentage: 30 },
      { name: 'Mutable', count: 3, percentage: 30 },
    ],
  };

  describe('Rendering', () => {
    it('should render all four elements with their names', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      // Use getAllByText since names appear multiple times (list + tooltip + summary)
      expect(screen.getAllByText('Fuego').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Tierra').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Aire').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Agua').length).toBeGreaterThan(0);
    });

    it('should display element icons', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      expect(screen.getByTestId('icon-flame')).toBeInTheDocument();
      expect(screen.getByTestId('icon-mountain')).toBeInTheDocument();
      expect(screen.getByTestId('icon-wind')).toBeInTheDocument();
      expect(screen.getByTestId('icon-droplets')).toBeInTheDocument();
    });

    it('should display element counts and percentages', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      // Use getAllByText since same pattern appears in elements and modalities
      const countTexts = screen.getAllByText(/4.*40%/);
      expect(countTexts.length).toBeGreaterThanOrEqual(1); // Fuego (and possibly Cardinal)
      expect(screen.getAllByText(/3.*30%/).length).toBeGreaterThanOrEqual(1); // Tierra
      expect(screen.getAllByText(/2.*20%/).length).toBeGreaterThanOrEqual(1); // Aire
      expect(screen.getAllByText(/1.*10%/).length).toBeGreaterThanOrEqual(1); // Agua
    });

    it('should display progress bars for each element', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      const progressBars = screen.getAllByTestId('progress-bar');
      expect(progressBars).toHaveLength(7); // 4 elements + 3 modalities
    });

    it('should render modalities when showModalities=true (default)', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      // Use getAllByText since names appear in list + tooltip
      expect(screen.getAllByText('Cardinal').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Fijo').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Mutable').length).toBeGreaterThanOrEqual(1);
    });

    it('should hide modalities when showModalities=false', () => {
      render(<ElementDistribution distribution={mockDistribution} showModalities={false} />);

      expect(screen.queryByText('Cardinal')).not.toBeInTheDocument();
      expect(screen.queryByText('Fijo')).not.toBeInTheDocument();
      expect(screen.queryByText('Mutable')).not.toBeInTheDocument();
    });

    it('should display modality counts and percentages', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      // Modalities section should have counts
      const modalityTexts = screen.getAllByText(/4.*40%|3.*30%/);
      expect(modalityTexts.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Dominant element highlighting', () => {
    it('should mark the dominant element (highest count)', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      // Fuego has the highest count (4, 40%)
      const dominantLabel = screen.getByText('Dominante');
      expect(dominantLabel).toBeInTheDocument();

      // Should be near Fuego text - use getAllByText and find the one with Dominante
      const fuegoElements = screen.getAllByText('Fuego');
      const dominantElement = fuegoElements.find((el) =>
        el.closest('span')?.textContent?.includes('Dominante')
      );
      expect(dominantElement).toBeDefined();
    });

    it('should apply special styling to dominant element', () => {
      const { container } = render(<ElementDistribution distribution={mockDistribution} />);

      // Dominant element should have bg-red-500/10 (Fuego)
      const dominantBg = container.querySelector('.bg-red-500\\/10');
      expect(dominantBg).toBeInTheDocument();
    });

    it('should identify correct dominant element when distributions change', () => {
      const aguaDominant: ChartDistribution = {
        elements: [
          { name: 'Fuego', count: 1, percentage: 10 },
          { name: 'Tierra', count: 2, percentage: 20 },
          { name: 'Aire', count: 2, percentage: 20 },
          { name: 'Agua', count: 5, percentage: 50 },
        ],
        modalities: [
          { name: 'Cardinal', count: 3, percentage: 30 },
          { name: 'Fijo', count: 4, percentage: 40 },
          { name: 'Mutable', count: 3, percentage: 30 },
        ],
      };

      render(<ElementDistribution distribution={aguaDominant} />);

      // Agua should be marked as dominant
      const aguaElements = screen.getAllByText('Agua');
      const dominantElement = aguaElements.find((el) =>
        el.closest('span')?.textContent?.includes('Dominante')
      );
      expect(dominantElement).toBeDefined();
    });
  });

  describe('Progress bars', () => {
    it('should set correct percentage values on progress bars', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      const progressBars = screen.getAllByTestId('progress-bar');

      // Check elements (first 4 bars)
      expect(progressBars[0]).toHaveAttribute('data-value', '40'); // Fuego
      expect(progressBars[1]).toHaveAttribute('data-value', '30'); // Tierra
      expect(progressBars[2]).toHaveAttribute('data-value', '20'); // Aire
      expect(progressBars[3]).toHaveAttribute('data-value', '10'); // Agua
    });

    it('should apply element-specific colors to progress bars', () => {
      const { container } = render(<ElementDistribution distribution={mockDistribution} />);

      // Each element should have its specific color
      expect(container.querySelector('[data-indicator-class*="bg-red-500"]')).toBeInTheDocument(); // Fuego
      expect(container.querySelector('[data-indicator-class*="bg-green-600"]')).toBeInTheDocument(); // Tierra
      expect(
        container.querySelector('[data-indicator-class*="bg-yellow-500"]')
      ).toBeInTheDocument(); // Aire
      expect(container.querySelector('[data-indicator-class*="bg-blue-500"]')).toBeInTheDocument(); // Agua
    });

    it('should apply modality-specific colors to progress bars', () => {
      const { container } = render(<ElementDistribution distribution={mockDistribution} />);

      // Modalities should have their colors
      expect(
        container.querySelector('[data-indicator-class*="bg-purple-500"]')
      ).toBeInTheDocument(); // Cardinal
      expect(container.querySelector('[data-indicator-class*="bg-amber-500"]')).toBeInTheDocument(); // Fijo
      expect(container.querySelector('[data-indicator-class*="bg-cyan-500"]')).toBeInTheDocument(); // Mutable
    });
  });

  describe('Tooltips', () => {
    it('should provide tooltips for each element', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      const tooltips = screen.getAllByTestId('tooltip-trigger');
      // 4 elements + 3 modalities (if shown)
      expect(tooltips.length).toBeGreaterThanOrEqual(4);
    });

    it('should show element description in tooltip', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      // Tooltips should be present (content would show on hover)
      const tooltipContents = screen.getAllByTestId('tooltip-content');
      expect(tooltipContents.length).toBeGreaterThan(0);
    });
  });

  describe('Summary section', () => {
    it('should display summary with dominant element', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      expect(screen.getByText(/Tu carta tiene predominancia de/i)).toBeInTheDocument();
      // Fuego appears in summary (text-red-500 class)
      const summary = screen.getByText(/Tu carta tiene predominancia de/i).closest('div');
      expect(summary?.textContent).toContain('Fuego');
    });

    it('should include dominant modality in summary when showModalities=true', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      expect(screen.getByText(/con energía/i)).toBeInTheDocument();
      // Cardinal appears in summary
      const summary = screen.getByText(/con energía/i).closest('div');
      expect(summary?.textContent).toContain('Cardinal');
    });

    it('should not mention modality in summary when showModalities=false', () => {
      render(<ElementDistribution distribution={mockDistribution} showModalities={false} />);

      expect(screen.queryByText(/con energía/i)).not.toBeInTheDocument();
    });

    it('should apply element color to dominant element name in summary', () => {
      const { container } = render(<ElementDistribution distribution={mockDistribution} />);

      // Summary should have text-red-500 for Fuego
      const summarySection = container.querySelector('.text-red-500');
      expect(summarySection?.textContent).toContain('Fuego');
    });
  });

  describe('Card wrapper', () => {
    it('should wrap in Card when showCard=true (default)', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText(/Distribución de Elementos/i)).toBeInTheDocument();
    });

    it('should not wrap in Card when showCard=false', () => {
      render(<ElementDistribution distribution={mockDistribution} showCard={false} />);

      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });

    it('should show card title and description', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      expect(screen.getByText(/Distribución de Elementos/i)).toBeInTheDocument();
      expect(screen.getByText(/Balance de energías en tu carta natal/i)).toBeInTheDocument();
    });
  });

  describe('Compact mode', () => {
    it('should apply compact spacing when compact=true', () => {
      const { container } = render(
        <ElementDistribution distribution={mockDistribution} compact={true} />
      );

      // Should have space-y-2 instead of space-y-3
      const compactContainer = container.querySelector('.space-y-2');
      expect(compactContainer).toBeInTheDocument();
    });

    it('should use normal spacing when compact=false (default)', () => {
      const { container } = render(<ElementDistribution distribution={mockDistribution} />);

      // Should have space-y-3
      const normalContainer = container.querySelector('.space-y-3');
      expect(normalContainer).toBeInTheDocument();
    });
  });

  describe('Balanced distribution', () => {
    it('should handle balanced distribution (all elements equal)', () => {
      const balanced: ChartDistribution = {
        elements: [
          { name: 'Fuego', count: 3, percentage: 25 },
          { name: 'Tierra', count: 3, percentage: 25 },
          { name: 'Aire', count: 3, percentage: 25 },
          { name: 'Agua', count: 3, percentage: 25 },
        ],
        modalities: [
          { name: 'Cardinal', count: 3, percentage: 33 },
          { name: 'Fijo', count: 3, percentage: 33 },
          { name: 'Mutable', count: 4, percentage: 34 },
        ],
      };

      render(<ElementDistribution distribution={balanced} />);

      // Should still mark one as dominant (first with highest count)
      expect(screen.getByText('Dominante')).toBeInTheDocument();
    });
  });

  describe('Empty or zero values', () => {
    it('should handle element with zero count', () => {
      const withZero: ChartDistribution = {
        elements: [
          { name: 'Fuego', count: 5, percentage: 50 },
          { name: 'Tierra', count: 3, percentage: 30 },
          { name: 'Aire', count: 2, percentage: 20 },
          { name: 'Agua', count: 0, percentage: 0 },
        ],
        modalities: [
          { name: 'Cardinal', count: 4, percentage: 40 },
          { name: 'Fijo', count: 3, percentage: 30 },
          { name: 'Mutable', count: 3, percentage: 30 },
        ],
      };

      render(<ElementDistribution distribution={withZero} />);

      // Should still display Agua with 0
      expect(screen.getByText(/0.*0%/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const { container } = render(<ElementDistribution distribution={mockDistribution} />);

      // Should have proper card structure
      expect(container.querySelector('h3')).toBeInTheDocument(); // Title
      expect(container.querySelector('p')).toBeInTheDocument(); // Description
    });

    it('should not have any text in English (Spanish only)', () => {
      const { container } = render(<ElementDistribution distribution={mockDistribution} />);

      const text = container.textContent || '';

      // Check for common English words that should NOT be there
      expect(text).not.toMatch(/\b(Element|Fire|Earth|Air|Water|Modality)\b/);
    });
  });

  describe('Element color classes', () => {
    it('should apply correct color classes for Fuego (fire)', () => {
      const { container } = render(<ElementDistribution distribution={mockDistribution} />);

      // Fuego should have red color in progress bar data attribute
      expect(container.querySelector('[data-indicator-class*="bg-red-500"]')).toBeInTheDocument();
    });

    it('should apply correct color classes for Tierra (earth)', () => {
      const { container } = render(<ElementDistribution distribution={mockDistribution} />);

      // Tierra should have green classes in progress bar
      expect(container.querySelector('[data-indicator-class*="bg-green-600"]')).toBeInTheDocument();
    });

    it('should apply correct color classes for Aire (air)', () => {
      const { container } = render(<ElementDistribution distribution={mockDistribution} />);

      // Aire should have yellow classes in progress bar
      expect(
        container.querySelector('[data-indicator-class*="bg-yellow-500"]')
      ).toBeInTheDocument();
    });

    it('should apply correct color classes for Agua (water)', () => {
      const { container } = render(<ElementDistribution distribution={mockDistribution} />);

      // Agua should have blue classes in progress bar
      expect(container.querySelector('[data-indicator-class*="bg-blue-500"]')).toBeInTheDocument();
    });
  });

  describe('Modality section', () => {
    it('should have "Modalidades" header when modalities are shown', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      expect(screen.getByText(/Modalidades/i)).toBeInTheDocument();
    });

    it('should display modality names with their percentages', () => {
      render(<ElementDistribution distribution={mockDistribution} />);

      // All modalities should be visible (use getAllByText for duplicates in list + tooltip)
      expect(screen.getAllByText(/Cardinal/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Fijo/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Mutable/).length).toBeGreaterThanOrEqual(1);
    });
  });
});
