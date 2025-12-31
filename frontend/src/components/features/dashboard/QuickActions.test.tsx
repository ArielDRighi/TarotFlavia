import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickActions } from './QuickActions';

describe('QuickActions', () => {
  it('should display "Nueva Lectura" button', () => {
    render(<QuickActions />);

    const newReadingButton = screen.getByText('Nueva Lectura');
    expect(newReadingButton).toBeInTheDocument();
  });

  it('should link "Nueva Lectura" button to /ritual/tirada', () => {
    render(<QuickActions />);

    const newReadingButton = screen.getByText('Nueva Lectura');
    expect(newReadingButton.closest('a')).toHaveAttribute('href', '/ritual/tirada');
  });

  it('should display "Historial de Lecturas" button', () => {
    render(<QuickActions />);

    const historyButton = screen.getByText('Historial de Lecturas');
    expect(historyButton).toBeInTheDocument();
  });

  it('should link "Historial de Lecturas" button to /historial', () => {
    render(<QuickActions />);

    const historyButton = screen.getByText('Historial de Lecturas');
    expect(historyButton.closest('a')).toHaveAttribute('href', '/historial');
  });

  it('should display "Carta del Día" button', () => {
    render(<QuickActions />);

    const dailyCardButton = screen.getByText('Carta del Día');
    expect(dailyCardButton).toBeInTheDocument();
  });

  it('should link "Carta del Día" button to /carta-del-dia', () => {
    render(<QuickActions />);

    const dailyCardButton = screen.getByText('Carta del Día');
    expect(dailyCardButton.closest('a')).toHaveAttribute('href', '/carta-del-dia');
  });

  it('should have primary styling on "Nueva Lectura" button', () => {
    render(<QuickActions />);

    const newReadingButton = screen.getByText('Nueva Lectura');
    const buttonElement = newReadingButton.closest('a');

    // Check for primary styling classes (purple gradient)
    expect(buttonElement).toHaveClass('bg-gradient-to-r');
    expect(buttonElement).toHaveClass('from-purple-600');
    expect(buttonElement).toHaveClass('to-pink-600');
  });

  it('should have secondary styling on other buttons', () => {
    render(<QuickActions />);

    const historyButton = screen.getByText('Historial de Lecturas');
    const buttonElement = historyButton.closest('a');

    // Check for secondary styling (border)
    expect(buttonElement).toHaveClass('border');
  });

  it('should display icons for all buttons', () => {
    render(<QuickActions />);

    // Check that all buttons have icons (lucide-react icons)
    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThanOrEqual(3);
  });
});
