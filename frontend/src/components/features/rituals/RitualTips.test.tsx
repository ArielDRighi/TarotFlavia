import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RitualTips } from './RitualTips';

describe('RitualTips', () => {
  const mockTips = [
    'Escribe tus intenciones en presente',
    'Sé específico pero flexible',
    'No establezcas más de 3-5 intenciones',
  ];

  it('should render title', () => {
    render(<RitualTips tips={mockTips} />);

    expect(screen.getByText('Consejos')).toBeInTheDocument();
  });

  it('should render all tips', () => {
    render(<RitualTips tips={mockTips} />);

    expect(screen.getByText(/Escribe tus intenciones en presente/i)).toBeInTheDocument();
    expect(screen.getByText(/Sé específico pero flexible/i)).toBeInTheDocument();
    expect(screen.getByText(/No establezcas más de 3-5 intenciones/i)).toBeInTheDocument();
  });

  it('should render tips as list items with bullet points', () => {
    const { container } = render(<RitualTips tips={mockTips} />);

    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(3);

    listItems.forEach((item) => {
      expect(item.textContent).toMatch(/^•/);
    });
  });

  it('should render lightbulb icon', () => {
    const { container } = render(<RitualTips tips={mockTips} />);

    // Lucide icons render as SVG
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('should have correct data-testid', () => {
    render(<RitualTips tips={mockTips} />);

    expect(screen.getByTestId('ritual-tips')).toBeInTheDocument();
  });

  it('should handle empty tips array', () => {
    const { container } = render(<RitualTips tips={[]} />);

    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(0);
  });
});
