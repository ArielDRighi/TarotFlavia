/**
 * ServicesTable Component Tests
 * TDD: Tests escritos ANTES de la implementación
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServicesTable } from './ServicesTable';
import type { HolisticServiceAdmin } from '@/types';

const mockServices: HolisticServiceAdmin[] = [
  {
    id: 1,
    name: 'Árbol Genealógico',
    slug: 'arbol-genealogico',
    shortDescription: 'Sanación de linaje familiar',
    longDescription: 'Descripción larga del árbol genealógico',
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
  },
  {
    id: 2,
    name: 'Péndulo Hebreo',
    slug: 'pendulo-hebreo',
    shortDescription: 'Sanación energética',
    longDescription: 'Descripción larga del péndulo hebreo',
    priceArs: 12000,
    durationMinutes: 60,
    sessionType: 'hebrew_pendulum',
    whatsappNumber: '+54911234567',
    mercadoPagoLink: 'https://mpago.la/test2',
    imageUrl: null,
    displayOrder: 2,
    isActive: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('ServicesTable', () => {
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
  });

  it('should render service names', () => {
    render(<ServicesTable services={mockServices} onEdit={mockOnEdit} />);

    expect(screen.getByText('Árbol Genealógico')).toBeInTheDocument();
    expect(screen.getByText('Péndulo Hebreo')).toBeInTheDocument();
  });

  it('should render formatted prices in ARS', () => {
    render(<ServicesTable services={mockServices} onEdit={mockOnEdit} />);

    expect(screen.getByText('$15.000')).toBeInTheDocument();
    expect(screen.getByText('$12.000')).toBeInTheDocument();
  });

  it('should render duration in minutes', () => {
    render(<ServicesTable services={mockServices} onEdit={mockOnEdit} />);

    const durations = screen.getAllByText('60 min');
    expect(durations).toHaveLength(2);
  });

  it('should render active badge for active services', () => {
    render(<ServicesTable services={mockServices} onEdit={mockOnEdit} />);

    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('should render all service names in the table', () => {
    render(<ServicesTable services={mockServices} onEdit={mockOnEdit} />);

    expect(screen.getByText('Árbol Genealógico')).toBeInTheDocument();
    expect(screen.getByText('Péndulo Hebreo')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<ServicesTable services={mockServices} onEdit={mockOnEdit} />);

    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockServices[0]);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('should render empty state when no services', () => {
    render(<ServicesTable services={[]} onEdit={mockOnEdit} />);

    expect(screen.getByText(/no hay servicios/i)).toBeInTheDocument();
  });

  it('should have correct data-testid', () => {
    render(<ServicesTable services={mockServices} onEdit={mockOnEdit} />);

    expect(screen.getByTestId('services-table')).toBeInTheDocument();
  });
});
