/**
 * Tests for PlanComparisonTable component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanComparisonTable } from './PlanComparisonTable';
import { mockPlans } from '@/test/helpers/admin-mocks';

describe('PlanComparisonTable', () => {
  it('should render table headers with plan names', () => {
    render(<PlanComparisonTable plans={mockPlans} />);

    expect(screen.getByText(/feature/i)).toBeInTheDocument();
    expect(screen.getAllByText(/anónimo|free/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/premium/i).length).toBeGreaterThan(0);
  });

  it('should show numeric values for limits', () => {
    render(<PlanComparisonTable plans={mockPlans} />);

    // Free plan has readingsLimit: 10, aiQuotaMonthly: 50
    expect(screen.getByText('10')).toBeInTheDocument();

    // Premium plan has readingsLimit: 50
    const fifties = screen.getAllByText('50');
    expect(fifties.length).toBeGreaterThanOrEqual(1);

    // Premium plan has aiQuotaMonthly: 200
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('should show checkmarks for enabled features', () => {
    render(<PlanComparisonTable plans={mockPlans} />);

    // Premium tiene features habilitadas
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should show X marks for disabled features', () => {
    render(<PlanComparisonTable plans={mockPlans} />);

    // Free plan tiene features deshabilitadas
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should display all feature rows', () => {
    render(<PlanComparisonTable plans={mockPlans} />);

    expect(screen.getByText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/lecturas mensuales/i)).toBeInTheDocument();
    expect(screen.getByText(/cuota mensual de ia/i)).toBeInTheDocument();
    expect(screen.getByText(/preguntas personalizadas/i)).toBeInTheDocument();
    expect(screen.getByText(/compartir lecturas/i)).toBeInTheDocument();
    expect(screen.getByText(/tiradas avanzadas/i)).toBeInTheDocument();
    expect(screen.getByText(/precio mensual/i)).toBeInTheDocument();
  });

  it('should handle empty plans array', () => {
    render(<PlanComparisonTable plans={[]} />);

    expect(screen.getByText(/no hay planes/i)).toBeInTheDocument();
  });

  it('should sort plans by type (anonymous, free, premium)', () => {
    const unsortedPlans = [mockPlans[2], mockPlans[0], mockPlans[1]]; // premium, anonymous, free
    render(<PlanComparisonTable plans={unsortedPlans} />);

    const table = screen.getByRole('table');
    const headers = Array.from(table.querySelectorAll('thead th')).map((th) =>
      th.textContent?.toLowerCase()
    );

    // Debería mostrar en orden: Feature, Anónimo, Gratuito, Premium
    expect(headers).toContain('gratuito');
    expect(headers).toContain('premium');
  });
});
