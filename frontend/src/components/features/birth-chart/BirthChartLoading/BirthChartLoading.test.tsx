/**
 * Tests para BirthChartLoading
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BirthChartLoading } from './BirthChartLoading';

describe('BirthChartLoading', () => {
  describe('Renderizado básico', () => {
    it('debe renderizar el contenedor principal con data-testid', () => {
      render(<BirthChartLoading message="Cargando..." />);

      expect(screen.getByTestId('birth-chart-loading')).toBeInTheDocument();
    });

    it('debe mostrar el mensaje recibido por prop', () => {
      render(<BirthChartLoading message="Calculando las posiciones planetarias..." />);

      expect(screen.getByText('Calculando las posiciones planetarias...')).toBeInTheDocument();
    });

    it('debe actualizar el mensaje cuando la prop cambia', () => {
      const { rerender } = render(<BirthChartLoading message="Mensaje inicial" />);

      expect(screen.getByText('Mensaje inicial')).toBeInTheDocument();

      rerender(<BirthChartLoading message="Mensaje actualizado" />);

      expect(screen.queryByText('Mensaje inicial')).not.toBeInTheDocument();
      expect(screen.getByText('Mensaje actualizado')).toBeInTheDocument();
    });
  });

  describe('Elementos visuales', () => {
    it('debe renderizar un ícono SVG', () => {
      const { container } = render(<BirthChartLoading message="Cargando..." />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('debe tener barra de progreso', () => {
      const { container } = render(<BirthChartLoading message="Cargando..." />);

      // La barra de progreso tiene clase animate-progress
      const progressBar = container.querySelector('.animate-progress');
      expect(progressBar).toBeInTheDocument();
    });

    it('debe tener animación de ping en el ícono', () => {
      const { container } = render(<BirthChartLoading message="Cargando..." />);

      const pingElement = container.querySelector('.animate-ping');
      expect(pingElement).toBeInTheDocument();
    });

    it('debe tener animación de pulse en el ícono', () => {
      const { container } = render(<BirthChartLoading message="Cargando..." />);

      const pulseElement = container.querySelector('.animate-pulse');
      expect(pulseElement).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('debe centrar el contenido verticalmente', () => {
      render(<BirthChartLoading message="Cargando..." />);

      const container = screen.getByTestId('birth-chart-loading');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('flex-col');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('justify-center');
    });

    it('debe ocupar al menos el 60% del viewport de altura', () => {
      render(<BirthChartLoading message="Cargando..." />);

      const container = screen.getByTestId('birth-chart-loading');
      expect(container).toHaveClass('min-h-[60vh]');
    });
  });
});
