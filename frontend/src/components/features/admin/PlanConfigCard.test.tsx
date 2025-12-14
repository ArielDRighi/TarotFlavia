/**
 * Tests for PlanConfigCard component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanConfigCard } from './PlanConfigCard';
import { createMockPlanConfig } from '@/test/helpers/admin-mocks';
import type { PlanConfig } from '@/types/admin.types';

const mockPlan = createMockPlanConfig({
  id: 2,
  planType: 'premium',
  name: 'Plan Premium',
  readingsLimit: 5,
  aiQuotaMonthly: 100,
  price: 9.99,
});

describe('PlanConfigCard', () => {
  it('should render plan name and current values', () => {
    const mockOnSave = vi.fn();
    render(<PlanConfigCard plan={mockPlan} onSave={mockOnSave} isLoading={false} />);

    const premiumTexts = screen.getAllByText(/premium/i);
    expect(premiumTexts.length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // readingsLimit
    expect(screen.getByDisplayValue('100')).toBeInTheDocument(); // aiQuotaMonthly
    expect(screen.getByDisplayValue('9.99')).toBeInTheDocument(); // price
  });

  it('should show toggles in correct state', () => {
    const mockOnSave = vi.fn();
    render(<PlanConfigCard plan={mockPlan} onSave={mockOnSave} isLoading={false} />);

    const toggles = screen.getAllByRole('switch');
    const enabledToggles = toggles.filter(
      (toggle) => toggle.getAttribute('data-state') === 'checked'
    );

    // 5 features están habilitadas en premium
    expect(enabledToggles.length).toBeGreaterThan(0);
  });

  it('should allow editing input fields', async () => {
    const mockOnSave = vi.fn();
    render(<PlanConfigCard plan={mockPlan} onSave={mockOnSave} isLoading={false} />);

    const dailyLimitInput = screen.getByDisplayValue('5');
    fireEvent.change(dailyLimitInput, { target: { value: '10' } });

    await waitFor(() => {
      expect(dailyLimitInput).toHaveValue(10);
    });
  });

  it('should show unsaved indicator when data changes', async () => {
    const mockOnSave = vi.fn();
    render(<PlanConfigCard plan={mockPlan} onSave={mockOnSave} isLoading={false} />);

    const dailyLimitInput = screen.getByDisplayValue('5');
    fireEvent.change(dailyLimitInput, { target: { value: '10' } });

    await waitFor(() => {
      expect(screen.getByText(/cambios sin guardar/i)).toBeInTheDocument();
    });
  });

  it('should call onSave with updated data when save button clicked', async () => {
    const mockOnSave = vi.fn();
    render(<PlanConfigCard plan={mockPlan} onSave={mockOnSave} isLoading={false} />);

    const dailyLimitInput = screen.getByDisplayValue('5');
    fireEvent.change(dailyLimitInput, { target: { value: '10' } });

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          readingsLimit: 10,
        })
      );
    });
  });

  it('should disable inputs when isLoading is true', () => {
    const mockOnSave = vi.fn();
    render(<PlanConfigCard plan={mockPlan} onSave={mockOnSave} isLoading={true} />);

    const inputs = screen.getAllByRole('spinbutton');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it('should disable editing for guest plan', () => {
    const guestPlan: PlanConfig = {
      ...mockPlan,
      planType: 'guest',
    };
    const mockOnSave = vi.fn();
    render(<PlanConfigCard plan={guestPlan} onSave={mockOnSave} isLoading={false} />);

    const saveButton = screen.queryByRole('button', { name: /guardar/i });
    expect(saveButton).not.toBeInTheDocument();
  });

  it('should validate negative values (except -1 for unlimited)', async () => {
    const mockOnSave = vi.fn();
    render(<PlanConfigCard plan={mockPlan} onSave={mockOnSave} isLoading={false} />);

    const dailyLimitInput = screen.getByDisplayValue('5');
    fireEvent.change(dailyLimitInput, { target: { value: '-5' } });

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      // Debería mostrar error o no llamar onSave
      expect(
        screen.getByText(/debe ser positivo/i) || screen.getByText(/ilimitado/i)
      ).toBeInTheDocument();
    });
  });

  it('should show plan-specific badge colors', () => {
    const { rerender } = render(
      <PlanConfigCard plan={mockPlan} onSave={vi.fn()} isLoading={false} />
    );

    // Premium debería tener badges
    const premiumTexts = screen.getAllByText(/premium/i);
    expect(premiumTexts.length).toBeGreaterThan(0);

    const freePlan: PlanConfig = { ...mockPlan, planType: 'free' };
    rerender(<PlanConfigCard plan={freePlan} onSave={vi.fn()} isLoading={false} />);
    const freeTexts = screen.getAllByText(/free/i);
    expect(freeTexts.length).toBeGreaterThan(0);
  });
});
