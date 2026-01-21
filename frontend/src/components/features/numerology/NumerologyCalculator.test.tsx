import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { NumerologyCalculator } from './NumerologyCalculator';

// Mock hooks
const mockCalculate = vi.fn();
const mockUseCalculateNumerology = vi.fn();

vi.mock('@/hooks/api/useNumerology', () => ({
  useCalculateNumerology: () => mockUseCalculateNumerology(),
}));

describe('NumerologyCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCalculateNumerology.mockReturnValue({
      mutate: mockCalculate,
      isPending: false,
      data: null,
    });
  });

  it('should render calculator heading', () => {
    render(<NumerologyCalculator />);

    expect(screen.getByText(/calcula tu número de vida/i)).toBeInTheDocument();
  });

  it('should render birth date input', () => {
    render(<NumerologyCalculator />);

    expect(screen.getByLabelText(/fecha de nacimiento/i)).toBeInTheDocument();
  });

  it('should show name field when showNameField is true', () => {
    render(<NumerologyCalculator showNameField={true} />);

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
  });

  it('should not show name field when showNameField is false', () => {
    render(<NumerologyCalculator showNameField={false} />);

    expect(screen.queryByLabelText(/nombre completo/i)).not.toBeInTheDocument();
  });

  it('should disable buttons when no birth date', () => {
    render(<NumerologyCalculator />);

    expect(screen.getByText('Vista rápida')).toBeDisabled();
    expect(screen.getByText('Calcular perfil')).toBeDisabled();
  });

  it('should enable buttons when birth date is provided', () => {
    render(<NumerologyCalculator />);

    const dateInput = screen.getByLabelText(/fecha de nacimiento/i);
    fireEvent.change(dateInput, { target: { value: '1990-03-25' } });

    expect(screen.getByText('Vista rápida')).not.toBeDisabled();
    expect(screen.getByText('Calcular perfil')).not.toBeDisabled();
  });

  it('should call calculate mutation when full calculate button is clicked', () => {
    render(<NumerologyCalculator />);

    const dateInput = screen.getByLabelText(/fecha de nacimiento/i);
    fireEvent.change(dateInput, { target: { value: '1990-03-25' } });

    const calculateButton = screen.getByText('Calcular perfil');
    fireEvent.click(calculateButton);

    expect(mockCalculate).toHaveBeenCalled();
  });

  it('should show "Calculando..." when isPending', () => {
    mockUseCalculateNumerology.mockReturnValue({
      mutate: mockCalculate,
      isPending: true,
      data: null,
    });

    render(<NumerologyCalculator />);

    const dateInput = screen.getByLabelText(/fecha de nacimiento/i);
    fireEvent.change(dateInput, { target: { value: '1990-03-25' } });

    expect(screen.getByText('Calculando...')).toBeInTheDocument();
  });

  it('should call onCalculated callback when calculation succeeds', async () => {
    const onCalculated = vi.fn();
    const mockData = {
      lifePath: { value: 7, name: 'El Buscador', keywords: [], description: '', isMaster: false },
    };

    mockUseCalculateNumerology.mockReturnValue({
      mutate: (data: unknown, options?: { onSuccess?: (result: unknown) => void }) => {
        options?.onSuccess?.(mockData);
      },
      isPending: false,
      data: null,
    });

    render(<NumerologyCalculator onCalculated={onCalculated} />);

    const dateInput = screen.getByLabelText(/fecha de nacimiento/i);
    fireEvent.change(dateInput, { target: { value: '1990-03-25' } });

    const calculateButton = screen.getByText('Calcular perfil');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(onCalculated).toHaveBeenCalledWith(mockData);
    });
  });
});
