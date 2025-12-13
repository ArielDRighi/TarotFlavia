/**
 * Tests para ApplicationCard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApplicationCard } from './ApplicationCard';
import type { TarotistaApplication } from '@/types/admin-tarotistas.types';

describe('ApplicationCard', () => {
  const mockApplication: TarotistaApplication = {
    id: 1,
    userId: 20,
    nombrePublico: 'Luna Mística',
    biografia: 'Tarotista apasionada con don innato',
    especialidades: ['amor', 'trabajo', 'espiritual'],
    motivacion: 'Quiero compartir mi don con más personas y ayudarlas en su camino',
    experiencia: '10 años leyendo tarot profesionalmente, certificada en escuela místicaX',
    status: 'pending',
    adminNotes: null,
    reviewedByUserId: null,
    reviewedAt: null,
    createdAt: '2025-12-01T10:30:00Z',
    updatedAt: '2025-12-01T10:30:00Z',
    user: {
      id: 20,
      email: 'luna@test.com',
      name: 'Luna García',
    },
  };

  it('should render application details', () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();

    render(
      <ApplicationCard application={mockApplication} onApprove={onApprove} onReject={onReject} />
    );

    expect(screen.getByText('Luna Mística')).toBeInTheDocument();
    expect(screen.getByText('Luna García')).toBeInTheDocument();
    expect(screen.getByText('luna@test.com')).toBeInTheDocument();
    // Should display formatted date (es-ES: "1/12/2025")
    expect(screen.getByText(/Aplicó: 1\/12\/2025/)).toBeInTheDocument();
  });

  it('should render specialties', () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();

    render(
      <ApplicationCard application={mockApplication} onApprove={onApprove} onReject={onReject} />
    );

    expect(screen.getByText('amor')).toBeInTheDocument();
    expect(screen.getByText('trabajo')).toBeInTheDocument();
    expect(screen.getByText('espiritual')).toBeInTheDocument();
  });

  it('should render biografia, motivacion and experiencia', () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();

    render(
      <ApplicationCard application={mockApplication} onApprove={onApprove} onReject={onReject} />
    );

    expect(screen.getByText(/Tarotista apasionada/i)).toBeInTheDocument();
    expect(screen.getByText(/Quiero compartir mi don/i)).toBeInTheDocument();
    expect(screen.getByText(/10 años leyendo tarot/i)).toBeInTheDocument();
  });

  it('should call onApprove when clicking approve button', () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();

    render(
      <ApplicationCard application={mockApplication} onApprove={onApprove} onReject={onReject} />
    );

    const approveButton = screen.getByRole('button', { name: /Aprobar/i });
    fireEvent.click(approveButton);

    expect(onApprove).toHaveBeenCalledWith(mockApplication);
  });

  it('should call onReject when clicking reject button', () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();

    render(
      <ApplicationCard application={mockApplication} onApprove={onApprove} onReject={onReject} />
    );

    const rejectButton = screen.getByRole('button', { name: /Rechazar/i });
    fireEvent.click(rejectButton);

    expect(onReject).toHaveBeenCalledWith(mockApplication);
  });

  it('should format date correctly', () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();

    render(
      <ApplicationCard application={mockApplication} onApprove={onApprove} onReject={onReject} />
    );

    // Should display formatted date (format depends on locale)
    expect(screen.getByText(/1\/12\/2025|12\/1\/2025/)).toBeInTheDocument();
  });

  it('should disable buttons when loading', () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();

    render(
      <ApplicationCard
        application={mockApplication}
        onApprove={onApprove}
        onReject={onReject}
        isLoading={true}
      />
    );

    const approveButton = screen.getByRole('button', { name: /Aprobar/i });
    const rejectButton = screen.getByRole('button', { name: /Rechazar/i });

    expect(approveButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();
  });
});
