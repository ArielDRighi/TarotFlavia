import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import ServiciosRoute from './page';
import type { HolisticService } from '@/types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockGetHolisticServices = vi.fn();

vi.mock('@/lib/api/holistic-services-api', () => ({
  getHolisticServices: () => mockGetHolisticServices(),
}));

// El catálogo en sí ya está cubierto por `ServiciosPage.test.tsx`; acá interesa
// qué le pasa la ruta.
const mockServiciosPage = vi.fn();

vi.mock('@/components/features/holistic-services', () => ({
  ServiciosPage: (props: { initialServices?: HolisticService[] }) => {
    mockServiciosPage(props);
    return <div data-testid="servicios-page">{props.initialServices?.length ?? 0}</div>;
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const service = {
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
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
} as HolisticService;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ServiciosRoute (/servicios)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetHolisticServices.mockResolvedValue([service]);
  });

  it('⚠️ T-SEO-003: resuelve el catálogo en el servidor y lo siembra en el cliente', async () => {
    render(await ServiciosRoute());

    expect(mockGetHolisticServices).toHaveBeenCalledTimes(1);
    expect(mockServiciosPage).toHaveBeenCalledWith({ initialServices: [service] });
  });

  it('⚠️ T-SEO-003: si la API falla, la ruta sigue sirviendo su contenido propio', async () => {
    mockGetHolisticServices.mockRejectedValue(new Error('API caída'));

    render(await ServiciosRoute());

    expect(mockServiciosPage).toHaveBeenCalledWith({ initialServices: undefined });
    expect(
      screen.getByRole('heading', { level: 2, name: 'Cómo funcionan los servicios holísticos' })
    ).toBeInTheDocument();
  });

  it('renderiza la introducción editorial indexable', async () => {
    render(await ServiciosRoute());

    expect(screen.getByTestId('listing-intro')).toBeInTheDocument();
  });
});
