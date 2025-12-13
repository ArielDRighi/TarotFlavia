/**
 * Tests for StatsCard component
 *
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatsCard } from '@/components/features/admin/StatsCard';
import type { DashboardMetric } from '@/types/admin.types';

describe('StatsCard', () => {
  it('should render metric value', () => {
    const metric: DashboardMetric = {
      value: 150,
      change: 5,
      trend: 'up',
    };

    render(<StatsCard title="Total Usuarios" metric={metric} icon="users" />);

    expect(screen.getByText('Total Usuarios')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should display positive change with green color', () => {
    const metric: DashboardMetric = {
      value: 450,
      change: 12,
      trend: 'up',
    };

    render(<StatsCard title="Lecturas del Mes" metric={metric} icon="book" />);

    const changeText = screen.getByText('+12%');
    expect(changeText).toBeInTheDocument();

    // Verificar que el contenedor tenga la clase correcta
    const changeContainer = changeText.closest('div');
    expect(changeContainer).toHaveClass('text-green-600');
  });

  it('should display negative change with red color', () => {
    const metric: DashboardMetric = {
      value: 25,
      change: -3,
      trend: 'down',
    };

    render(<StatsCard title="Tarotistas Activos" metric={metric} icon="star" />);

    const changeText = screen.getByText('-3%');
    expect(changeText).toBeInTheDocument();

    // Verificar que el contenedor tenga la clase correcta
    const changeContainer = changeText.closest('div');
    expect(changeContainer).toHaveClass('text-red-600');
  });

  it('should display zero change with gray color', () => {
    const metric: DashboardMetric = {
      value: 100,
      change: 0,
      trend: 'stable',
    };

    render(<StatsCard title="Revenue" metric={metric} icon="dollar-sign" />);

    const changeText = screen.getByText('0%');
    expect(changeText).toBeInTheDocument();

    // Verificar que el contenedor tenga la clase correcta
    const changeContainer = changeText.closest('div');
    expect(changeContainer).toHaveClass('text-gray-600');
  });

  it('should format large numbers with thousands separator', () => {
    const metric: DashboardMetric = {
      value: 5000,
      change: 8,
      trend: 'up',
    };

    render(<StatsCard title="Revenue" metric={metric} icon="dollar-sign" prefix="$" />);

    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('should render without change indicator when no change provided', () => {
    const metric: DashboardMetric = {
      value: 100,
    };

    render(<StatsCard title="Test Metric" metric={metric} icon="users" />);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });
});
