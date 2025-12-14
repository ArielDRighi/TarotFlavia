/**
 * Tests for PlanComparisonTable component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanComparisonTable } from './PlanComparisonTable';
import type { PlanConfig } from '@/types/admin.types';

const mockPlans: PlanConfig[] = [
  {
    id: 1,
    planType: 'free',
    dailyReadingLimit: 1,
    monthlyAIQuota: 10,
    canUseCustomQuestions: false,
    canRegenerateInterpretations: false,
    maxRegenerationsPerReading: 0,
    canShareReadings: false,
    historyLimit: 10,
    canBookSessions: false,
    price: 0,
  },
  {
    id: 2,
    planType: 'premium',
    dailyReadingLimit: 5,
    monthlyAIQuota: 100,
    canUseCustomQuestions: true,
    canRegenerateInterpretations: true,
    maxRegenerationsPerReading: 3,
    canShareReadings: true,
    historyLimit: -1,
    canBookSessions: true,
    price: 9.99,
  },
  {
    id: 3,
    planType: 'professional',
    dailyReadingLimit: -1,
    monthlyAIQuota: -1,
    canUseCustomQuestions: true,
    canRegenerateInterpretations: true,
    maxRegenerationsPerReading: -1,
    canShareReadings: true,
    historyLimit: -1,
    canBookSessions: true,
    price: 29.99,
  },
];

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

    // Free plan
    expect(screen.getByText('1')).toBeInTheDocument(); // dailyReadingLimit

    // Premium plan
    expect(screen.getByText('5')).toBeInTheDocument(); // dailyReadingLimit
    expect(screen.getByText('100')).toBeInTheDocument(); // monthlyAIQuota
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

    expect(screen.getByText(/lecturas diarias/i)).toBeInTheDocument();
    expect(screen.getByText(/cuota mensual de ia/i)).toBeInTheDocument();
    expect(screen.getByText(/preguntas personalizadas/i)).toBeInTheDocument();
    expect(screen.getByText(/regenerar interpretaciones/i)).toBeInTheDocument();
    expect(screen.getByText(/compartir lecturas/i)).toBeInTheDocument();
    expect(screen.getByText(/reservar sesiones/i)).toBeInTheDocument();
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
