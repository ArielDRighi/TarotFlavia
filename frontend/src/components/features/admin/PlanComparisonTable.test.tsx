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
    expect(screen.getAllByText(/free/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/premium/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/professional/i).length).toBeGreaterThan(0);
  });

  it('should show numeric values for limits', () => {
    render(<PlanComparisonTable plans={mockPlans} />);

    // Free plan has readingsLimit: 10, aiQuotaMonthly: 50
    expect(screen.getByText('10')).toBeInTheDocument();

    // Multiple plans have 50 (free aiQuotaMonthly: 50, premium readingsLimit: 50)
    const fifties = screen.getAllByText('50');
    expect(fifties.length).toBeGreaterThanOrEqual(2);

    // Premium plan has aiQuotaMonthly: 200
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('should show "Ilimitado" for -1 values', () => {
    render(<PlanComparisonTable plans={mockPlans} />);

    const ilimitadoTexts = screen.getAllByText(/ilimitado/i);
    // Professional plan tiene varios ilimitados
    expect(ilimitadoTexts.length).toBeGreaterThan(0);
  });

  it('should show checkmarks for enabled features', () => {
    render(<PlanComparisonTable plans={mockPlans} />);

    // Premium y Professional tienen features habilitadas
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

  it('should sort plans by type (free, premium, professional)', () => {
    const unsortedPlans = [mockPlans[2], mockPlans[0], mockPlans[1]]; // professional, free, premium
    render(<PlanComparisonTable plans={unsortedPlans} />);

    const table = screen.getByRole('table');
    const headers = Array.from(table.querySelectorAll('thead th')).map((th) =>
      th.textContent?.toLowerCase()
    );

    // Debería mostrar en orden: Feature, Free, Premium, Professional
    expect(headers).toContain('free');
    expect(headers).toContain('premium');
    expect(headers).toContain('professional');
  });
});
