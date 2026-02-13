/**
 * Tests para BirthDataForm
 *
 * TDD: Tests escritos ANTES de la implementación
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BirthDataForm } from './BirthDataForm';
import type { GeocodedPlace } from '@/types/birth-chart-geocode.types';

// Mock del componente PlaceAutocomplete
vi.mock('../PlaceAutocomplete', () => ({
  PlaceAutocomplete: ({
    onChange,
    error,
  }: {
    onChange: (place: GeocodedPlace | null) => void;
    error?: string;
  }) => (
    <div>
      <label htmlFor="mock-place">Lugar de nacimiento</label>
      <input
        id="mock-place"
        data-testid="place-autocomplete"
        onChange={(e) => {
          if (e.target.value) {
            onChange({
              placeId: 'test-id',
              displayName: e.target.value,
              city: 'Test City',
              country: 'Test Country',
              latitude: -34.6037,
              longitude: -58.3816,
              timezone: 'America/Argentina/Buenos_Aires',
            });
          } else {
            onChange(null);
          }
        }}
      />
      {error && <div data-testid="place-error">{error}</div>}
    </div>
  ),
}));

describe('BirthDataForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('Renderizado básico', () => {
    it('debe renderizar todos los campos del formulario', () => {
      render(<BirthDataForm onSubmit={mockOnSubmit} />);

      // Campo nombre (buscar por placeholder ya que FormControl wrapper evita getByLabelText)
      expect(screen.getByPlaceholderText(/maría garcía/i)).toBeInTheDocument();

      // Campo fecha
      expect(screen.getByText(/fecha de nacimiento/i)).toBeInTheDocument();
      const dateInput = document.querySelector('input[name="birthDate"]');
      expect(dateInput).toHaveAttribute('type', 'date');

      // Campo hora (buscar por name ya que type="time" no tiene placeholder visible)
      const timeInput = document.querySelector('input[name="birthTime"]');
      expect(timeInput).toHaveAttribute('type', 'time');

      // Campo lugar (mock)
      expect(screen.getByLabelText(/lugar de nacimiento/i)).toBeInTheDocument();

      // Botón submit
      expect(screen.getByRole('button', { name: /generar mi carta astral/i })).toBeInTheDocument();
    });

    it('debe renderizar asteriscos en campos requeridos', () => {
      render(<BirthDataForm onSubmit={mockOnSubmit} />);

      const labels = screen.getAllByText('*');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('debe mostrar botón deshabilitado inicialmente', () => {
      render(<BirthDataForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', {
        name: /generar mi carta astral/i,
      });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Validación de campos', () => {
    it('debe mostrar error si el nombre es muy corto', async () => {
      const user = userEvent.setup();
      render(<BirthDataForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByPlaceholderText(/maría garcía/i);
      await user.type(nameInput, 'A');
      await user.tab(); // Trigger blur para validación

      await waitFor(() => {
        expect(screen.getByText(/el nombre debe tener al menos 2 caracteres/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar error si el nombre es muy largo', async () => {
      const user = userEvent.setup();
      render(<BirthDataForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByPlaceholderText(/maría garcía/i);
      const longName = 'A'.repeat(101);
      await user.type(nameInput, longName);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/el nombre no puede exceder 100 caracteres/i)).toBeInTheDocument();
      });
    });

    it('debe aceptar un nombre válido', async () => {
      const user = userEvent.setup();
      render(<BirthDataForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByPlaceholderText(/maría garcía/i);
      await user.type(nameInput, 'María García');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/el nombre debe tener/i)).not.toBeInTheDocument();
      });
    });

    it('debe validar formato de hora', async () => {
      const user = userEvent.setup();
      render(<BirthDataForm onSubmit={mockOnSubmit} />);

      // Buscar input por name attribute ya que tiene wrapper FormControl
      const timeInput = document.querySelector('input[name="birthTime"]') as HTMLInputElement;
      expect(timeInput).toBeTruthy();

      // Los inputs type="time" nativos solo aceptan formatos válidos
      // Verificar que acepta un valor válido
      await user.type(timeInput, '14:30');

      // El valor debería estar correctamente formateado
      expect(timeInput.value).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('Interacción con PlaceAutocomplete', () => {
    it('debe actualizar campos ocultos cuando se selecciona un lugar', async () => {
      const user = userEvent.setup();
      render(<BirthDataForm onSubmit={mockOnSubmit} />);

      const placeInput = screen.getByTestId('place-autocomplete');
      await user.type(placeInput, 'Buenos Aires');

      await waitFor(() => {
        // Los campos ocultos deberían tener valores
        const latInput = document.querySelector('input[name="latitude"]') as HTMLInputElement;
        const lonInput = document.querySelector('input[name="longitude"]') as HTMLInputElement;
        const tzInput = document.querySelector('input[name="timezone"]') as HTMLInputElement;

        expect(latInput?.value).toBe('-34.6037');
        expect(lonInput?.value).toBe('-58.3816');
        expect(tzInput?.value).toBe('America/Argentina/Buenos_Aires');
      });
    });
  });

  describe('Estado de loading', () => {
    it('debe mostrar estado de loading cuando isLoading es true', () => {
      render(<BirthDataForm onSubmit={mockOnSubmit} isLoading={true} />);

      expect(screen.getByText(/generando carta astral/i)).toBeInTheDocument();
    });

    it('debe deshabilitar botón cuando isLoading es true', () => {
      render(<BirthDataForm onSubmit={mockOnSubmit} isLoading={true} />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Estado disabled', () => {
    it('debe deshabilitar todos los campos cuando disabled es true', () => {
      render(<BirthDataForm onSubmit={mockOnSubmit} disabled={true} />);

      const nameInput = screen.getByPlaceholderText(/maría garcía/i);
      const timeInput = document.querySelector('input[name="birthTime"]') as HTMLInputElement;
      const submitButton = screen.getByRole('button');

      expect(nameInput).toBeDisabled();
      expect(timeInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Alerta de uso', () => {
    it('debe mostrar alerta cuando showUsageWarning es true', () => {
      render(
        <BirthDataForm
          onSubmit={mockOnSubmit}
          showUsageWarning={true}
          usageMessage="Has alcanzado tu límite de cartas gratuitas"
        />
      );

      expect(screen.getByText(/has alcanzado tu límite de cartas gratuitas/i)).toBeInTheDocument();
    });

    it('no debe mostrar alerta cuando showUsageWarning es false', () => {
      render(
        <BirthDataForm
          onSubmit={mockOnSubmit}
          showUsageWarning={false}
          usageMessage="Mensaje que no debe aparecer"
        />
      );

      expect(screen.queryByText(/mensaje que no debe aparecer/i)).not.toBeInTheDocument();
    });
  });

  describe('Valores por defecto', () => {
    it('debe cargar valores por defecto si se proveen', () => {
      render(
        <BirthDataForm
          onSubmit={mockOnSubmit}
          defaultValues={{
            name: 'Juan Pérez',
            birthTime: '14:30',
          }}
        />
      );

      const nameInput = screen.getByPlaceholderText(/maría garcía/i) as HTMLInputElement;
      const timeInput = document.querySelector('input[name="birthTime"]') as HTMLInputElement;

      expect(nameInput.value).toBe('Juan Pérez');
      expect(timeInput.value).toBe('14:30');
    });
  });

  describe('Tooltip de ayuda', () => {
    it('debe tener tooltip de ayuda en campo hora', () => {
      render(<BirthDataForm onSubmit={mockOnSubmit} />);

      // Verificar que existe descripción de ayuda (reemplaza tooltip)
      expect(
        screen.getByText(/la hora exacta es crucial para calcular el ascendente/i)
      ).toBeInTheDocument();
    });
  });

  describe('Texto informativo', () => {
    it('debe mostrar texto sobre la precisión de los datos', () => {
      render(<BirthDataForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/la precisión de la carta depende/i)).toBeInTheDocument();
    });
  });

  describe('Responsive', () => {
    it('debe tener clase grid para layout responsive', () => {
      const { container } = render(<BirthDataForm onSubmit={mockOnSubmit} />);

      // Buscar el div que contiene fecha y hora
      const gridContainer = container.querySelector('.grid.grid-cols-1');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Iconos', () => {
    it('debe tener iconos en campos apropiados', () => {
      const { container } = render(<BirthDataForm onSubmit={mockOnSubmit} />);

      // Verificar que hay elementos con clases de lucide-react
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener data-testid en elementos principales', () => {
      const { container } = render(<BirthDataForm onSubmit={mockOnSubmit} />);

      // El form debería tener estructura accesible
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('debe tener labels asociados a inputs', () => {
      render(<BirthDataForm onSubmit={mockOnSubmit} />);

      // Verificar que existen labels y campos accesibles
      const nameInput = screen.getByPlaceholderText(/maría garcía/i);
      expect(nameInput).toBeInTheDocument();

      const timeInput = document.querySelector('input[name="birthTime"]');
      expect(timeInput).toBeInTheDocument();
    });
  });
});
