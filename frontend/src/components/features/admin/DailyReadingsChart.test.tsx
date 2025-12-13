/**
 * Tests for DailyReadingsChart component
 *
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DailyReadingsChart } from '@/components/features/admin/DailyReadingsChart';
import type { ChartDataPoint } from '@/types/admin.types';

describe('DailyReadingsChart', () => {
  const mockData: ChartDataPoint[] = [
    { date: '2025-12-01', value: 10 },
    { date: '2025-12-02', value: 15 },
    { date: '2025-12-03', value: 12 },
    { date: '2025-12-04', value: 18 },
    { date: '2025-12-05', value: 20 },
  ];

  it('should render chart title', () => {
    render(<DailyReadingsChart data={mockData} />);

    expect(screen.getByText('Lecturas por Día')).toBeInTheDocument();
  });

  it('should render with empty data', () => {
    render(<DailyReadingsChart data={[]} />);

    expect(screen.getByText('Lecturas por Día')).toBeInTheDocument();
    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
  });

  it('should render chart with data points', () => {
    const { container } = render(<DailyReadingsChart data={mockData} />);

    // Verifica que el componente renderiza sin errores
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});
