/**
 * Tests for ReadingsManagementContent Component (T-ADM-001-B)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ReadingsManagementContent } from './ReadingsManagementContent';
import * as useAdminReadingsHook from '@/hooks/api/useAdminReadings';
import type { AdminReadingsResponse } from '@/types/admin-readings.types';

vi.mock('@/hooks/api/useAdminReadings');
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

const mockReadingsResponse: AdminReadingsResponse = {
  data: [
    {
      id: 1,
      question: '¿Qué me depara el futuro?',
      spreadId: 2,
      spreadName: 'Tirada de 3 cartas',
      cardsCount: 3,
      cardPreviews: [],
      createdAt: '2024-06-01T10:00:00Z',
      deletedAt: undefined,
    },
    {
      id: 2,
      question: '¿Cómo mejorar mi situación?',
      spreadId: 1,
      spreadName: 'Carta del Día',
      cardsCount: 1,
      cardPreviews: [],
      createdAt: '2024-06-02T12:00:00Z',
      deletedAt: '2024-06-03T08:00:00Z',
    },
  ],
  meta: {
    page: 1,
    limit: 50,
    totalItems: 2,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

describe('ReadingsManagementContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useAdminReadingsHook, 'useSoftDeleteReading').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
    vi.spyOn(useAdminReadingsHook, 'useRestoreReading').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });

  describe('Estado de carga', () => {
    it('debe mostrar skeletons mientras carga', () => {
      vi.spyOn(useAdminReadingsHook, 'useAdminReadings').mockReturnValue({
        isLoading: true,
        isError: false,
        isSuccess: false,
        data: undefined,
        error: null,
      } as never);

      render(<ReadingsManagementContent />, { wrapper: createWrapper() });

      expect(screen.getByTestId('readings-management-loading')).toBeInTheDocument();
    });
  });

  describe('Estado de error', () => {
    it('debe mostrar mensaje de error cuando falla la carga', () => {
      vi.spyOn(useAdminReadingsHook, 'useAdminReadings').mockReturnValue({
        isLoading: false,
        isError: true,
        isSuccess: false,
        data: undefined,
        error: new Error('Error de red'),
      } as never);

      render(<ReadingsManagementContent />, { wrapper: createWrapper() });

      expect(screen.getByTestId('readings-management-error')).toBeInTheDocument();
    });
  });

  describe('Estado vacío', () => {
    it('debe mostrar mensaje vacío cuando no hay lecturas', () => {
      vi.spyOn(useAdminReadingsHook, 'useAdminReadings').mockReturnValue({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: {
          data: [],
          meta: {
            page: 1,
            limit: 50,
            totalItems: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
        error: null,
      } as never);

      render(<ReadingsManagementContent />, { wrapper: createWrapper() });

      expect(screen.getByTestId('readings-management-empty')).toBeInTheDocument();
    });
  });

  describe('Con datos', () => {
    beforeEach(() => {
      vi.spyOn(useAdminReadingsHook, 'useAdminReadings').mockReturnValue({
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: mockReadingsResponse,
        error: null,
      } as never);
    });

    it('debe renderizar el contenedor principal', () => {
      render(<ReadingsManagementContent />, { wrapper: createWrapper() });
      expect(screen.getByTestId('readings-management-content')).toBeInTheDocument();
    });

    it('debe mostrar el título "Lecturas"', () => {
      render(<ReadingsManagementContent />, { wrapper: createWrapper() });
      expect(screen.getByText('Lecturas')).toBeInTheDocument();
    });

    it('debe mostrar el total de lecturas en el meta', () => {
      render(<ReadingsManagementContent />, { wrapper: createWrapper() });
      expect(screen.getByTestId('readings-total-count')).toBeInTheDocument();
    });

    it('debe mostrar las filas de lecturas', () => {
      render(<ReadingsManagementContent />, { wrapper: createWrapper() });
      expect(screen.getByText('¿Qué me depara el futuro?')).toBeInTheDocument();
      expect(screen.getByText('¿Cómo mejorar mi situación?')).toBeInTheDocument();
    });

    it('debe mostrar el toggle "Incluir eliminadas"', () => {
      render(<ReadingsManagementContent />, { wrapper: createWrapper() });
      expect(screen.getByTestId('toggle-include-deleted')).toBeInTheDocument();
    });

    it('debe activar includeDeleted al hacer click en el toggle', () => {
      const mockUseAdminReadings = vi
        .spyOn(useAdminReadingsHook, 'useAdminReadings')
        .mockReturnValue({
          isLoading: false,
          isError: false,
          isSuccess: true,
          data: mockReadingsResponse,
          error: null,
        } as never);

      render(<ReadingsManagementContent />, { wrapper: createWrapper() });

      const toggle = screen.getByTestId('toggle-include-deleted');
      fireEvent.click(toggle);

      expect(mockUseAdminReadings).toHaveBeenCalledWith(
        expect.objectContaining({ includeDeleted: true })
      );
    });

    it('debe marcar visualmente las lecturas eliminadas', () => {
      render(<ReadingsManagementContent />, { wrapper: createWrapper() });
      const deletedBadge = screen.getAllByTestId('reading-deleted-badge');
      expect(deletedBadge.length).toBeGreaterThan(0);
    });
  });
});
