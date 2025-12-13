/**
 * Tests for RecentReadingsTable component
 *
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RecentReadingsTable } from '@/components/features/admin/RecentReadingsTable';
import type { RecentReading } from '@/types/admin.types';

describe('RecentReadingsTable', () => {
  const mockReadings: RecentReading[] = [
    {
      id: 1,
      userName: 'Juan Pérez',
      date: '2025-12-13T10:00:00Z',
      spreadType: 'TRES_CARTAS',
      status: 'completed',
    },
    {
      id: 2,
      userName: 'María García',
      date: '2025-12-13T09:30:00Z',
      spreadType: 'CRUZ_CELTA',
      status: 'pending',
    },
    {
      id: 3,
      userName: 'Pedro López',
      date: '2025-12-13T09:00:00Z',
      spreadType: 'SIMPLE',
      status: 'failed',
    },
  ];

  it('should render table with headers', () => {
    render(<RecentReadingsTable readings={mockReadings} />);

    expect(screen.getByText('Usuario')).toBeInTheDocument();
    expect(screen.getByText('Fecha')).toBeInTheDocument();
    expect(screen.getByText('Tipo de Tirada')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should display all readings', () => {
    render(<RecentReadingsTable readings={mockReadings} />);

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María García')).toBeInTheDocument();
    expect(screen.getByText('Pedro López')).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    render(<RecentReadingsTable readings={mockReadings} />);

    // La fecha debería formatearse (el formato exacto puede variar)
    const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('should display status badges with correct colors', () => {
    render(<RecentReadingsTable readings={mockReadings} />);

    const completedBadge = screen.getByText('Completada');
    expect(completedBadge).toBeInTheDocument();
    expect(completedBadge).toHaveClass('bg-green-100');

    const pendingBadge = screen.getByText('Pendiente');
    expect(pendingBadge).toBeInTheDocument();
    expect(pendingBadge).toHaveClass('bg-yellow-100');

    const failedBadge = screen.getByText('Fallida');
    expect(failedBadge).toBeInTheDocument();
    expect(failedBadge).toHaveClass('bg-red-100');
  });

  it('should render empty state when no readings', () => {
    render(<RecentReadingsTable readings={[]} />);

    expect(screen.getByText('No hay lecturas recientes')).toBeInTheDocument();
  });

  it('should format spread types correctly', () => {
    render(<RecentReadingsTable readings={mockReadings} />);

    expect(screen.getByText('Tres Cartas')).toBeInTheDocument();
    expect(screen.getByText('Cruz Celta')).toBeInTheDocument();
    expect(screen.getByText('Simple')).toBeInTheDocument();
  });
});
