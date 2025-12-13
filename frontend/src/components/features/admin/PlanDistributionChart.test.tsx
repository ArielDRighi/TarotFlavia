/**
 * Tests for PlanDistributionChart component
 *
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlanDistributionChart } from '@/components/features/admin/PlanDistributionChart';
import type { PlanDistribution } from '@/types/admin.types';

describe('PlanDistributionChart', () => {
  const mockData: PlanDistribution[] = [
    { plan: 'Gratis', count: 100, percentage: 50 },
    { plan: 'Básico', count: 60, percentage: 30 },
    { plan: 'Premium', count: 40, percentage: 20 },
  ];

  it('should render chart title', () => {
    render(<PlanDistributionChart data={mockData} />);

    expect(screen.getByText('Distribución por Plan')).toBeInTheDocument();
  });

  it('should render with empty data', () => {
    render(<PlanDistributionChart data={[]} />);

    expect(screen.getByText('Distribución por Plan')).toBeInTheDocument();
    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
  });

  it('should render chart with data points', () => {
    render(<PlanDistributionChart data={mockData} />);

    // Verifica que el componente renderiza sin errores
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('should render chart container when data is provided', () => {
    render(<PlanDistributionChart data={mockData} />);

    // Verifica que no muestra el mensaje de "No hay datos"
    expect(screen.queryByText('No hay datos disponibles')).not.toBeInTheDocument();
  });
});
