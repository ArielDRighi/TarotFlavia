/**
 * Admin Agenda Page Tests
 * TDD: Tests escritos ANTES de la implementación
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminAgendaPage from './page';

// Mock del componente de gestión
vi.mock('@/components/features/admin/AgendaManagementContent', () => ({
  AgendaManagementContent: () => (
    <div data-testid="agenda-management-content">AgendaManagementContent mock</div>
  ),
}));

describe('AdminAgendaPage', () => {
  it('should render the page title', () => {
    render(<AdminAgendaPage />);
    expect(screen.getByText(/gestión de agenda/i)).toBeInTheDocument();
  });

  it('should render AgendaManagementContent component', () => {
    render(<AdminAgendaPage />);
    expect(screen.getByTestId('agenda-management-content')).toBeInTheDocument();
  });
});
