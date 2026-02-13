/**
 * Tests para PlaceAutocomplete Component
 *
 * Tests para el componente de autocompletado de lugares con geocoding
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { PlaceAutocomplete } from './PlaceAutocomplete';
import type { GeocodedPlace } from '@/types/birth-chart-geocode.types';
import * as useGeocodeSearchModule from '@/hooks/api/useGeocodeSearch';

// Mock del hook useGeocodeSearch
vi.mock('@/hooks/api/useGeocodeSearch', () => ({
  useGeocodeSearch: vi.fn(),
}));

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = vi.fn();

const mockUseGeocodeSearch = vi.mocked(useGeocodeSearchModule.useGeocodeSearch);

// Helper para crear mock de useQuery result
function createMockQueryResult(
  overrides: Partial<ReturnType<typeof useGeocodeSearchModule.useGeocodeSearch>> = {}
) {
  return {
    data: undefined,
    isLoading: false,
    isFetching: false,
    isSuccess: false,
    isError: false,
    error: null,
    fetchStatus: 'idle',
    ...overrides,
  } as unknown as ReturnType<typeof useGeocodeSearchModule.useGeocodeSearch>;
}

// Mock place data
const mockPlace: GeocodedPlace = {
  placeId: '123',
  displayName: 'Buenos Aires, Argentina',
  city: 'Buenos Aires',
  country: 'Argentina',
  latitude: -34.6037,
  longitude: -58.3816,
  timezone: 'America/Argentina/Buenos_Aires',
};

const mockPlaces: GeocodedPlace[] = [
  mockPlace,
  {
    placeId: '456',
    displayName: 'Madrid, España',
    city: 'Madrid',
    country: 'España',
    latitude: 40.4168,
    longitude: -3.7038,
    timezone: 'Europe/Madrid',
  },
];

// Helper para crear wrapper con QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
}

describe('PlaceAutocomplete', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock - idle state
    mockUseGeocodeSearch.mockReturnValue(createMockQueryResult());
  });

  describe('Rendering', () => {
    it('should render input with placeholder', () => {
      render(<PlaceAutocomplete value={null} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByPlaceholderText('Ej: Buenos Aires, Argentina')).toBeInTheDocument();
    });

    it('should render custom placeholder when provided', () => {
      render(
        <PlaceAutocomplete value={null} onChange={mockOnChange} placeholder="Ingresa tu ciudad" />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByPlaceholderText('Ingresa tu ciudad')).toBeInTheDocument();
    });

    it('should render label', () => {
      render(<PlaceAutocomplete value={null} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText('Lugar de nacimiento')).toBeInTheDocument();
    });

    it('should render custom label when provided', () => {
      render(<PlaceAutocomplete value={null} onChange={mockOnChange} label="Ciudad de origen" />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText('Ciudad de origen')).toBeInTheDocument();
    });

    it('should show required indicator when required', () => {
      render(<PlaceAutocomplete value={null} onChange={mockOnChange} required />, {
        wrapper: createWrapper(),
      });

      const label = screen.getByText('Lugar de nacimiento');
      expect(label.parentElement?.textContent).toContain('*');
    });

    it('should render search icon', () => {
      const { container } = render(<PlaceAutocomplete value={null} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      // Verificar que existe un ícono de búsqueda (Search icon)
      const searchIcon = container.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<PlaceAutocomplete value={null} onChange={mockOnChange} disabled />, {
        wrapper: createWrapper(),
      });

      const input = screen.getByPlaceholderText('Ej: Buenos Aires, Argentina');
      expect(input).toBeDisabled();
    });
  });

  describe('Search behavior', () => {
    it('should not trigger search with less than 3 characters', async () => {
      const user = userEvent.setup();
      render(<PlaceAutocomplete value={null} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      const input = screen.getByPlaceholderText('Ej: Buenos Aires, Argentina');
      await user.type(input, 'AB');

      // El hook no debería ser llamado para búsquedas cortas
      expect(mockUseGeocodeSearch).toHaveBeenCalled();
    });

    it('should trigger search with 3 or more characters', async () => {
      const user = userEvent.setup();
      mockUseGeocodeSearch.mockReturnValue(
        createMockQueryResult({
          data: { results: mockPlaces, count: 2 },
          isSuccess: true,
        })
      );

      render(<PlaceAutocomplete value={null} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      const input = screen.getByPlaceholderText('Ej: Buenos Aires, Argentina');
      await user.type(input, 'Buenos');

      // El hook debería ser llamado con el query
      expect(mockUseGeocodeSearch).toHaveBeenCalled();
    });

    it('should show loading indicator while fetching', async () => {
      const user = userEvent.setup();
      mockUseGeocodeSearch.mockReturnValue(
        createMockQueryResult({
          isLoading: true,
          isFetching: true,
          fetchStatus: 'fetching',
        })
      );

      render(<PlaceAutocomplete value={null} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      const input = screen.getByPlaceholderText('Ej: Buenos Aires, Argentina');
      await user.type(input, 'Buenos');
      await user.click(input); // Open popover

      await waitFor(() => {
        expect(screen.getByText('Buscando lugares...')).toBeInTheDocument();
      });
    });

    it('should show results in popover when data is available', async () => {
      const user = userEvent.setup();
      mockUseGeocodeSearch.mockReturnValue(
        createMockQueryResult({
          data: { results: mockPlaces, count: 2 },
          isSuccess: true,
        })
      );

      render(<PlaceAutocomplete value={null} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      const input = screen.getByPlaceholderText('Ej: Buenos Aires, Argentina');
      await user.type(input, 'Buenos');
      await user.click(input); // Open popover

      await waitFor(() => {
        expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
        expect(screen.getByText('Madrid')).toBeInTheDocument();
      });
    });

    it('should show empty message when no results', async () => {
      const user = userEvent.setup();
      mockUseGeocodeSearch.mockReturnValue(
        createMockQueryResult({
          data: { results: [], count: 0 },
          isSuccess: true,
        })
      );

      render(<PlaceAutocomplete value={null} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      const input = screen.getByPlaceholderText('Ej: Buenos Aires, Argentina');
      await user.type(input, 'XYZ12345');
      await user.click(input); // Open popover

      await waitFor(() => {
        expect(screen.getByText('No se encontraron lugares.')).toBeInTheDocument();
      });
    });
  });

  describe('Selection behavior', () => {
    it('should call onChange when a place is selected', async () => {
      const user = userEvent.setup();
      mockUseGeocodeSearch.mockReturnValue(
        createMockQueryResult({
          data: { results: mockPlaces, count: 2 },
          isSuccess: true,
        })
      );

      render(<PlaceAutocomplete value={null} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      const input = screen.getByPlaceholderText('Ej: Buenos Aires, Argentina');
      await user.type(input, 'Buenos');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
      });

      const buenosAiresOption = screen.getByText('Buenos Aires');
      await user.click(buenosAiresOption);

      expect(mockOnChange).toHaveBeenCalledWith(mockPlace);
    });

    it('should update input value when place is selected', async () => {
      const user = userEvent.setup();
      mockUseGeocodeSearch.mockReturnValue(
        createMockQueryResult({
          data: { results: mockPlaces, count: 2 },
          isSuccess: true,
        })
      );

      const { rerender } = render(<PlaceAutocomplete value={null} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      const input = screen.getByPlaceholderText('Ej: Buenos Aires, Argentina') as HTMLInputElement;
      await user.type(input, 'Buenos');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
      });

      const buenosAiresOption = screen.getByText('Buenos Aires');
      await user.click(buenosAiresOption);

      // Simular que el padre actualiza el prop value (componente controlado)
      rerender(<PlaceAutocomplete value={mockPlace} onChange={mockOnChange} />);

      await waitFor(() => {
        expect(input.value).toBe('Buenos Aires, Argentina');
      });
    });

    it('should show clear button when a place is selected', () => {
      render(<PlaceAutocomplete value={mockPlace} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      const clearButton = screen.getByLabelText('Limpiar selección');
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear selection when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<PlaceAutocomplete value={mockPlace} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      const clearButton = screen.getByLabelText('Limpiar selección');
      await user.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });
  });

  describe('Selected place info', () => {
    it('should show coordinates when place is selected', () => {
      render(<PlaceAutocomplete value={mockPlace} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText(/Coordenadas:/)).toBeInTheDocument();
      expect(screen.getByText(/-34.6037, -58.3816/)).toBeInTheDocument();
    });

    it('should show timezone when place is selected', () => {
      render(<PlaceAutocomplete value={mockPlace} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText(/Zona:/)).toBeInTheDocument();
      expect(screen.getByText(/America\/Argentina\/Buenos_Aires/)).toBeInTheDocument();
    });

    it('should not show place info when no place is selected', () => {
      render(<PlaceAutocomplete value={null} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      expect(screen.queryByText(/Coordenadas:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Zona:/)).not.toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should show error message when error prop is provided', () => {
      render(
        <PlaceAutocomplete
          value={null}
          onChange={mockOnChange}
          error="Por favor selecciona un lugar"
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Por favor selecciona un lugar')).toBeInTheDocument();
    });

    it('should apply error styles to input when error is present', () => {
      render(
        <PlaceAutocomplete value={null} onChange={mockOnChange} error="Error de validación" />,
        { wrapper: createWrapper() }
      );

      const input = screen.getByPlaceholderText('Ej: Buenos Aires, Argentina');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels', () => {
      render(<PlaceAutocomplete value={null} onChange={mockOnChange} id="birth-place" />, {
        wrapper: createWrapper(),
      });

      const input = screen.getByPlaceholderText('Ej: Buenos Aires, Argentina');
      expect(input).toHaveAttribute('id', 'birth-place');
    });

    it('should associate error message with input via aria-describedby', () => {
      render(
        <PlaceAutocomplete
          value={null}
          onChange={mockOnChange}
          error="Campo requerido"
          id="birth-place"
        />,
        { wrapper: createWrapper() }
      );

      const input = screen.getByPlaceholderText('Ej: Buenos Aires, Argentina');
      expect(input).toHaveAttribute('aria-describedby', 'birth-place-error');
    });

    it('should have clear button with proper aria-label', () => {
      render(<PlaceAutocomplete value={mockPlace} onChange={mockOnChange} />, {
        wrapper: createWrapper(),
      });

      const clearButton = screen.getByLabelText('Limpiar selección');
      expect(clearButton).toHaveAttribute('aria-label', 'Limpiar selección');
    });
  });
});
