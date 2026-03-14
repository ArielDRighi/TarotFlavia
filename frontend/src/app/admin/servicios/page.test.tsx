/**
 * Admin Servicios Page Tests
 * TDD: Tests escritos ANTES de la implementación
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminServiciosPage from './page';

// Mock del componente de gestión
vi.mock('@/components/features/admin/HolisticServicesManagement', () => ({
  HolisticServicesManagement: () => (
    <div data-testid="holistic-services-management">HolisticServicesManagement mock</div>
  ),
}));

describe('AdminServiciosPage', () => {
  it('should render the page title', () => {
    render(<AdminServiciosPage />);

    expect(screen.getByText(/gestión de servicios/i)).toBeInTheDocument();
  });

  it('should render HolisticServicesManagement component', () => {
    render(<AdminServiciosPage />);

    expect(screen.getByTestId('holistic-services-management')).toBeInTheDocument();
  });
});
