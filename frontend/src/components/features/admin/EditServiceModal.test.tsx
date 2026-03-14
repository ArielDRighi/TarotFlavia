/**
 * EditServiceModal Component Tests
 * TDD: Tests escritos ANTES de la implementación
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditServiceModal } from './EditServiceModal';
import type { HolisticServiceAdmin } from '@/types';

const mockService: HolisticServiceAdmin = {
  id: 1,
  name: 'Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: 'Sanación de linaje familiar',
  longDescription: 'Descripción larga del árbol genealógico que tiene más de 20 caracteres',
  priceArs: 15000,
  durationMinutes: 60,
  sessionType: 'family_tree',
  whatsappNumber: '+54911234567',
  mercadoPagoLink: 'https://mpago.la/test1',
  imageUrl: null,
  displayOrder: 1,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('EditServiceModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSubmit.mockClear();
  });

  it('should not render when closed', () => {
    render(
      <EditServiceModal
        service={mockService}
        open={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render modal when open', () => {
    render(
      <EditServiceModal
        service={mockService}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should show service title in dialog header', () => {
    render(
      <EditServiceModal
        service={mockService}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    expect(screen.getByText(/editar servicio/i)).toBeInTheDocument();
  });

  it('should pre-fill form with service data', () => {
    render(
      <EditServiceModal
        service={mockService}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    expect(screen.getByDisplayValue('Árbol Genealógico')).toBeInTheDocument();
    expect(screen.getByDisplayValue('arbol-genealogico')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+54911234567')).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <EditServiceModal
        service={mockService}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons while pending', () => {
    render(
      <EditServiceModal
        service={mockService}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={true}
      />
    );

    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /guardando/i })).toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted with valid data', async () => {
    render(
      <EditServiceModal
        service={mockService}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should render modal for creating new service when no service provided', () => {
    render(
      <EditServiceModal
        service={null}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    expect(screen.getByText(/nuevo servicio/i)).toBeInTheDocument();
  });
});
