import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HowItWorks } from './HowItWorks';

describe('HowItWorks', () => {
  it('should render section title', () => {
    render(<HowItWorks />);

    expect(screen.getByRole('heading', { name: /¿cómo funciona\?/i })).toBeInTheDocument();
  });

  it('should render three steps', () => {
    render(<HowItWorks />);

    expect(screen.getByRole('heading', { name: /elige tu pregunta/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /selecciona tus cartas/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /recibe tu lectura/i })).toBeInTheDocument();
  });

  describe('Step 1 - Elige tu pregunta', () => {
    it('should show step number', () => {
      render(<HowItWorks />);

      const stepNumbers = screen.getAllByText(/^1$/);
      expect(stepNumbers.length).toBeGreaterThan(0);
    });

    it('should show step description', () => {
      render(<HowItWorks />);

      expect(screen.getByText(/selecciona una categoría y elige la pregunta/i)).toBeInTheDocument();
    });
  });

  describe('Step 2 - Selecciona tus cartas', () => {
    it('should show step number', () => {
      render(<HowItWorks />);

      const stepNumbers = screen.getAllByText(/^2$/);
      expect(stepNumbers.length).toBeGreaterThan(0);
    });

    it('should show step description', () => {
      render(<HowItWorks />);

      expect(
        screen.getByText(/elige el tipo de tirada según tu plan y deja que la intuición/i)
      ).toBeInTheDocument();
    });
  });

  describe('Step 3 - Recibe tu lectura', () => {
    it('should show step number', () => {
      render(<HowItWorks />);

      const stepNumbers = screen.getAllByText(/^3$/);
      expect(stepNumbers.length).toBeGreaterThan(0);
    });

    it('should show step description', () => {
      render(<HowItWorks />);

      expect(
        screen.getByText(/obtén una interpretación personalizada que conecta las cartas/i)
      ).toBeInTheDocument();
    });
  });

  it('should show final CTA', () => {
    render(<HowItWorks />);

    const link = screen.getByRole('link', { name: /comienza tu viaje/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/registro');
  });
});
