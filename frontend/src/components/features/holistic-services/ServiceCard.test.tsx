/**
 * Tests for ServiceCard component
 *
 * TDD RED phase — tests written before implementation.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServiceCard } from './ServiceCard';
import type { HolisticService } from '@/types';

const mockService: HolisticService = {
  id: 1,
  name: 'Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: 'Sanación a través del árbol genealógico familiar',
  priceArs: 15000,
  durationMinutes: 90,
  sessionType: 'family_tree',
  imageUrl: null,
  displayOrder: 1,
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('ServiceCard', () => {
  it('should render service name', () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByText('Árbol Genealógico')).toBeInTheDocument();
  });

  it('should render short description', () => {
    render(<ServiceCard service={mockService} />);
    expect(
      screen.getByText('Sanación a través del árbol genealógico familiar')
    ).toBeInTheDocument();
  });

  it('should render price in ARS', () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByText(/15\.000/)).toBeInTheDocument();
    expect(screen.getByText(/ARS/i)).toBeInTheDocument();
  });

  it('should render duration in minutes', () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByText(/90/)).toBeInTheDocument();
    expect(screen.getByText(/min/i)).toBeInTheDocument();
  });

  it('should render a "Ver más" button', () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByRole('link', { name: /ver más/i })).toBeInTheDocument();
  });

  it('should link to the service detail page', () => {
    render(<ServiceCard service={mockService} />);
    const link = screen.getByRole('link', { name: /ver más/i });
    expect(link).toHaveAttribute('href', '/servicios/arbol-genealogico');
  });

  it('should have data-testid attribute', () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByTestId('service-card')).toBeInTheDocument();
  });

  it('should render price formatted with period thousands separator', () => {
    const serviceWithHighPrice: HolisticService = { ...mockService, priceArs: 1000000 };
    render(<ServiceCard service={serviceWithHighPrice} />);
    expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument();
  });
});
