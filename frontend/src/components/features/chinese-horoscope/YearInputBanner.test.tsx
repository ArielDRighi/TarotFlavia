/**
 * YearInputBanner Tests
 *
 * Tests para el banner que solicita año de nacimiento
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YearInputBanner } from './YearInputBanner';

describe('YearInputBanner', () => {
  it('renderiza correctamente el banner', () => {
    render(<YearInputBanner onYearSubmit={vi.fn()} />);

    expect(screen.getByText(/¿En qué año nació/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/año de nacimiento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calcular/i })).toBeInTheDocument();
  });

  it('permite ingresar un año', async () => {
    const user = userEvent.setup();
    render(<YearInputBanner onYearSubmit={vi.fn()} />);

    const input = screen.getByLabelText(/año de nacimiento/i);
    await user.type(input, '1988');

    expect(input).toHaveValue('1988');
  });

  it('llama a onYearSubmit con el año correcto al hacer submit', async () => {
    const user = userEvent.setup();
    const onYearSubmit = vi.fn();
    render(<YearInputBanner onYearSubmit={onYearSubmit} />);

    const input = screen.getByLabelText(/año de nacimiento/i);
    const button = screen.getByRole('button', { name: /calcular/i });

    await user.type(input, '1988');
    await user.click(button);

    await waitFor(() => {
      expect(onYearSubmit).toHaveBeenCalledWith(1988);
    });
  });

  it('valida que el año esté en rango válido (1900-2100)', async () => {
    const user = userEvent.setup();
    const onYearSubmit = vi.fn();
    render(<YearInputBanner onYearSubmit={onYearSubmit} />);

    const input = screen.getByLabelText(/año de nacimiento/i);
    const button = screen.getByRole('button', { name: /calcular/i });

    // Año fuera de rango
    await user.type(input, '1800');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/año debe estar entre/i)).toBeInTheDocument();
    });

    expect(onYearSubmit).not.toHaveBeenCalled();
  });

  it('deshabilita el botón cuando no hay año', () => {
    render(<YearInputBanner onYearSubmit={vi.fn()} />);

    const button = screen.getByRole('button', { name: /calcular/i });
    expect(button).toBeDisabled();
  });

  it('muestra loading state durante cálculo', async () => {
    const user = userEvent.setup();
    const onYearSubmit = vi.fn(
      (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100))
    );
    render(<YearInputBanner onYearSubmit={onYearSubmit} />);

    const input = screen.getByLabelText(/año de nacimiento/i);
    const button = screen.getByRole('button', { name: /calcular/i });

    await user.type(input, '1988');
    await user.click(button);

    expect(screen.getByText(/calculando/i)).toBeInTheDocument();
  });

  it('permite pasar un animalName para personalizar el mensaje', () => {
    render(<YearInputBanner onYearSubmit={vi.fn()} animalName="Dragón" />);

    expect(screen.getByText(/¿En qué año nació.*Dragón/i)).toBeInTheDocument();
  });

  it('limpia el mensaje de error cuando el usuario vuelve a escribir', async () => {
    const user = userEvent.setup();
    render(<YearInputBanner onYearSubmit={vi.fn()} />);

    const input = screen.getByLabelText(/año de nacimiento/i);
    const button = screen.getByRole('button', { name: /calcular/i });

    // Trigger error
    await user.type(input, '1800');
    await user.click(button);
    expect(screen.getByText(/año debe estar entre/i)).toBeInTheDocument();

    // Clear input and type again
    await user.clear(input);
    await user.type(input, '1988');

    expect(screen.queryByText(/año debe estar entre/i)).not.toBeInTheDocument();
  });

  it('permite enviar con Enter key', async () => {
    const user = userEvent.setup();
    const onYearSubmit = vi.fn();
    render(<YearInputBanner onYearSubmit={onYearSubmit} />);

    const input = screen.getByLabelText(/año de nacimiento/i);

    await user.type(input, '1988');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(onYearSubmit).toHaveBeenCalledWith(1988);
    });
  });

  it('tiene data-testid correcto', () => {
    render(<YearInputBanner onYearSubmit={vi.fn()} />);

    expect(screen.getByTestId('year-input-banner')).toBeInTheDocument();
  });

  it('muestra error cuando onYearSubmit falla', async () => {
    const user = userEvent.setup();
    const onYearSubmit = vi.fn().mockRejectedValue(new Error('API Error'));
    render(<YearInputBanner onYearSubmit={onYearSubmit} />);

    const input = screen.getByLabelText(/año de nacimiento/i);
    const button = screen.getByRole('button', { name: /calcular/i });

    await user.type(input, '1988');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Error al calcular. Inténtalo de nuevo./i)).toBeInTheDocument();
    });
  });

  it('valida upper bound del año (> 2100)', async () => {
    const user = userEvent.setup();
    const onYearSubmit = vi.fn();
    render(<YearInputBanner onYearSubmit={onYearSubmit} />);

    const input = screen.getByLabelText(/año de nacimiento/i);
    const button = screen.getByRole('button', { name: /calcular/i });

    // Año fuera de rango superior
    await user.type(input, '2200');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/año debe estar entre/i)).toBeInTheDocument();
    });

    expect(onYearSubmit).not.toHaveBeenCalled();
  });

  it('muestra error cuando se ingresa texto no numérico', async () => {
    const user = userEvent.setup();
    const onYearSubmit = vi.fn();
    render(<YearInputBanner onYearSubmit={onYearSubmit} />);

    const input = screen.getByLabelText(/año de nacimiento/i);
    const button = screen.getByRole('button', { name: /calcular/i });

    await user.type(input, 'abc');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Por favor ingresa un año válido/i)).toBeInTheDocument();
    });

    expect(onYearSubmit).not.toHaveBeenCalled();
  });
});
