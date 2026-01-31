import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { NumerologyIntro } from './NumerologyIntro';

describe('NumerologyIntro', () => {
  it('should render the introduction heading', () => {
    render(<NumerologyIntro />);

    expect(
      screen.getByRole('heading', { level: 2, name: /qué es la numerología/i })
    ).toBeInTheDocument();
  });

  it('should display explanatory text about numerology', () => {
    render(<NumerologyIntro />);

    expect(screen.getByText(/la numerología es un sistema ancestral/i)).toBeInTheDocument();
  });

  it('should show numbers from birth date section', () => {
    render(<NumerologyIntro />);

    expect(screen.getByText(/desde tu fecha/i)).toBeInTheDocument();
    expect(screen.getByText(/camino de vida/i)).toBeInTheDocument();
    expect(screen.getByText(/número de cumpleaños/i)).toBeInTheDocument();
    // Use getAllByText since "Año Personal" appears in multiple places (Año Personal and Mes Personal descriptions)
    expect(screen.getAllByText(/año personal/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/^Mes Personal:/i)).toBeInTheDocument();
  });

  it('should show numbers from name section', () => {
    render(<NumerologyIntro />);

    expect(screen.getByText(/desde tu nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/número de expresión/i)).toBeInTheDocument();
    expect(screen.getByText(/número del alma/i)).toBeInTheDocument();
    expect(screen.getByText(/personalidad/i)).toBeInTheDocument();
  });

  it('should display note about master numbers', () => {
    render(<NumerologyIntro />);

    expect(screen.getByText(/números maestros.*11.*22.*33/i)).toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    const { container } = render(<NumerologyIntro className="custom-class" />);

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('should have gradient background styling', () => {
    const { container } = render(<NumerologyIntro />);

    const card = container.firstChild;
    expect(card).toHaveClass('from-purple-50');
  });

  it('should render all sections in a grid layout', () => {
    const { container } = render(<NumerologyIntro />);

    // Check for grid container
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
  });

  it('should use semantic heading levels', () => {
    render(<NumerologyIntro />);

    // Main heading is h2
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

    // Section headings should be h3
    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    expect(h3Headings.length).toBeGreaterThanOrEqual(2); // At least "Desde tu fecha" and "Desde tu nombre"
  });
});
