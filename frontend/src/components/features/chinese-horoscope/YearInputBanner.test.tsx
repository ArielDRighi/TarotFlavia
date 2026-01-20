/**
 * BirthDateInputBanner (YearInputBanner) Tests
 *
 * Tests para el banner que solicita fecha de nacimiento completa
 * para calcular correctamente el animal y elemento del zodiaco chino.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YearInputBanner } from './YearInputBanner';

describe('YearInputBanner (BirthDateInputBanner)', () => {
  it('renderiza correctamente el banner', () => {
    render(<YearInputBanner onBirthDateSubmit={vi.fn()} />);

    expect(screen.getByText(/¿Cuándo nació/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de nacimiento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calcular/i })).toBeInTheDocument();
  });

  it('permite ingresar una fecha', async () => {
    const user = userEvent.setup();
    render(<YearInputBanner onBirthDateSubmit={vi.fn()} />);

    const input = screen.getByLabelText(/fecha de nacimiento/i);
    await user.type(input, '1988-06-15');

    expect(input).toHaveValue('1988-06-15');
  });

  it('llama a onBirthDateSubmit con la fecha correcta al hacer submit', async () => {
    const user = userEvent.setup();
    const onBirthDateSubmit = vi.fn();
    render(<YearInputBanner onBirthDateSubmit={onBirthDateSubmit} />);

    const input = screen.getByLabelText(/fecha de nacimiento/i);
    const button = screen.getByRole('button', { name: /calcular/i });

    await user.type(input, '1988-06-15');
    await user.click(button);

    await waitFor(() => {
      expect(onBirthDateSubmit).toHaveBeenCalledWith('1988-06-15');
    });
  });

  it('valida que la fecha esté en rango válido (1900 a hoy)', async () => {
    const user = userEvent.setup();
    const onBirthDateSubmit = vi.fn();
    render(<YearInputBanner onBirthDateSubmit={onBirthDateSubmit} />);

    const input = screen.getByLabelText(/fecha de nacimiento/i);
    const button = screen.getByRole('button', { name: /calcular/i });

    // Fecha fuera de rango (antes de 1900)
    await user.type(input, '1899-01-01');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/fecha debe ser entre 1900 y hoy/i)).toBeInTheDocument();
    });

    expect(onBirthDateSubmit).not.toHaveBeenCalled();
  });

  it('deshabilita el botón cuando no hay fecha', () => {
    render(<YearInputBanner onBirthDateSubmit={vi.fn()} />);

    const button = screen.getByRole('button', { name: /calcular/i });
    expect(button).toBeDisabled();
  });

  it('muestra loading state durante cálculo', async () => {
    const user = userEvent.setup();
    const onBirthDateSubmit = vi.fn(
      (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100))
    );
    render(<YearInputBanner onBirthDateSubmit={onBirthDateSubmit} />);

    const input = screen.getByLabelText(/fecha de nacimiento/i);
    const button = screen.getByRole('button', { name: /calcular/i });

    await user.type(input, '1988-06-15');
    await user.click(button);

    expect(screen.getByText(/calculando/i)).toBeInTheDocument();
  });

  it('permite pasar un animalName para personalizar el mensaje', () => {
    render(<YearInputBanner onBirthDateSubmit={vi.fn()} animalName="Dragón" />);

    expect(screen.getByText(/¿Cuándo nació.*Dragón/i)).toBeInTheDocument();
  });

  it('limpia el mensaje de error cuando el usuario vuelve a escribir', async () => {
    const user = userEvent.setup();
    render(<YearInputBanner onBirthDateSubmit={vi.fn()} />);

    const input = screen.getByLabelText(/fecha de nacimiento/i);
    const button = screen.getByRole('button', { name: /calcular/i });

    // Trigger error (fecha antes de 1900)
    await user.type(input, '1899-01-01');
    await user.click(button);
    expect(screen.getByText(/fecha debe ser entre 1900 y hoy/i)).toBeInTheDocument();

    // Clear input and type again
    await user.clear(input);
    await user.type(input, '1988-06-15');

    expect(screen.queryByText(/fecha debe ser entre 1900 y hoy/i)).not.toBeInTheDocument();
  });

  it('permite enviar con Enter key', async () => {
    const user = userEvent.setup();
    const onBirthDateSubmit = vi.fn();
    render(<YearInputBanner onBirthDateSubmit={onBirthDateSubmit} />);

    const input = screen.getByLabelText(/fecha de nacimiento/i);

    await user.type(input, '1988-06-15');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(onBirthDateSubmit).toHaveBeenCalledWith('1988-06-15');
    });
  });

  it('tiene data-testid correcto', () => {
    render(<YearInputBanner onBirthDateSubmit={vi.fn()} />);

    expect(screen.getByTestId('year-input-banner')).toBeInTheDocument();
  });

  it('muestra error cuando onBirthDateSubmit falla', async () => {
    const user = userEvent.setup();
    const onBirthDateSubmit = vi.fn().mockRejectedValue(new Error('API Error'));
    render(<YearInputBanner onBirthDateSubmit={onBirthDateSubmit} />);

    const input = screen.getByLabelText(/fecha de nacimiento/i);
    const button = screen.getByRole('button', { name: /calcular/i });

    await user.type(input, '1988-06-15');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Error al calcular. Inténtalo de nuevo./i)).toBeInTheDocument();
    });
  });

  it('muestra el input con tipo date', () => {
    render(<YearInputBanner onBirthDateSubmit={vi.fn()} />);

    const input = screen.getByLabelText(/fecha de nacimiento/i);
    expect(input).toHaveAttribute('type', 'date');
  });
});
