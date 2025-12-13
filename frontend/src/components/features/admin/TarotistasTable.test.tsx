/**
 * Tests para TarotistasTable Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TarotistasTable } from './TarotistasTable';
import type { AdminTarotista } from '@/types/admin-tarotistas.types';

describe('TarotistasTable', () => {
  const mockTarotistas: AdminTarotista[] = [
    {
      id: 1,
      userId: 10,
      nombrePublico: 'Luna Mística',
      bio: 'Tarotista con 10 años de experiencia',
      fotoPerfil: null,
      especialidades: ['amor', 'trabajo'],
      idiomas: ['español'],
      añosExperiencia: 10,
      ofreceSesionesVirtuales: true,
      precioSesionUsd: 50.0,
      duracionSesionMinutos: 60,
      isActive: true,
      isAcceptingNewClients: true,
      isFeatured: false,
      comisiónPorcentaje: 30.0,
      ratingPromedio: 4.5,
      totalReviews: 25,
      totalLecturas: 150,
      totalIngresos: 7500.0,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      userId: 11,
      nombrePublico: 'Estrella del Tarot',
      bio: 'Especialista en amor',
      fotoPerfil: null,
      especialidades: ['amor'],
      idiomas: ['español', 'inglés'],
      añosExperiencia: 5,
      ofreceSesionesVirtuales: false,
      precioSesionUsd: null,
      duracionSesionMinutos: null,
      isActive: false,
      isAcceptingNewClients: false,
      isFeatured: false,
      comisiónPorcentaje: 30.0,
      ratingPromedio: null,
      totalReviews: 0,
      totalLecturas: 0,
      totalIngresos: null,
      createdAt: '2025-02-01T00:00:00Z',
      updatedAt: '2025-02-01T00:00:00Z',
    },
  ];

  it('should render empty state when no tarotistas', () => {
    const onAction = vi.fn();
    render(<TarotistasTable tarotistas={[]} onAction={onAction} />);

    expect(screen.getByText('No hay tarotistas para mostrar')).toBeInTheDocument();
  });

  it('should render tarotistas table with data', () => {
    const onAction = vi.fn();
    render(<TarotistasTable tarotistas={mockTarotistas} onAction={onAction} />);

    expect(screen.getByText('Luna Mística')).toBeInTheDocument();
    expect(screen.getByText('Estrella del Tarot')).toBeInTheDocument();
    expect(screen.getByText('amor, trabajo')).toBeInTheDocument();
  });

  it('should display rating and stats', () => {
    const onAction = vi.fn();
    render(<TarotistasTable tarotistas={mockTarotistas} onAction={onAction} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    // Currency format uses Spanish locale: 7500,00 US$
    expect(screen.getByText(/7500,00/)).toBeInTheDocument();
  });

  it('should display active/inactive badges', () => {
    const onAction = vi.fn();
    render(<TarotistasTable tarotistas={mockTarotistas} onAction={onAction} />);

    const badges = screen.getAllByText('Activo');
    expect(badges.length).toBeGreaterThan(0);

    const inactiveBadges = screen.getAllByText('Inactivo');
    expect(inactiveBadges.length).toBeGreaterThan(0);
  });

  it('should render action buttons', () => {
    const onAction = vi.fn();
    render(<TarotistasTable tarotistas={mockTarotistas} onAction={onAction} />);

    // Should have dropdown buttons for each tarotista
    const actionButtons = screen.getAllByRole('button');
    expect(actionButtons.length).toBe(mockTarotistas.length);
  });

  it('should display "N/A" for null rating', () => {
    const onAction = vi.fn();
    render(<TarotistasTable tarotistas={mockTarotistas} onAction={onAction} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should format revenue correctly', () => {
    const onAction = vi.fn();
    render(<TarotistasTable tarotistas={mockTarotistas} onAction={onAction} />);

    // Spanish locale format: 7500,00 US$
    expect(screen.getByText(/7500,00/)).toBeInTheDocument();
  });
});
