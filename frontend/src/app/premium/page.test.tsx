import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import PremiumRoute from './page';
import type { PlanConfig } from '@/types/admin.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockFetchPublicPlans = vi.fn();

vi.mock('@/lib/api/public-plans-api', () => ({
  fetchPublicPlans: () => mockFetchPublicPlans(),
}));

// La página en sí ya está cubierta por `PremiumPage.test.tsx`; acá interesa qué
// le pasa la ruta.
const mockPremiumPage = vi.fn();

vi.mock('@/components/features/premium', () => ({
  PremiumPage: (props: { initialPlans?: PlanConfig[] }) => {
    mockPremiumPage(props);
    return <div data-testid="premium-page">{props.initialPlans?.length ?? 0}</div>;
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const premiumPlan = {
  id: 2,
  planType: 'premium',
  name: 'Premium',
  description: 'Todo el potencial del tarot',
  price: 4999,
} as PlanConfig;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PremiumRoute (/premium)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchPublicPlans.mockResolvedValue([premiumPlan]);
  });

  it('⚠️ T-SEO-003: resuelve los planes en el servidor y los siembra en el cliente', async () => {
    render(await PremiumRoute());

    expect(mockFetchPublicPlans).toHaveBeenCalledTimes(1);
    expect(mockPremiumPage).toHaveBeenCalledWith({ initialPlans: [premiumPlan] });
  });

  it('⚠️ T-SEO-003: si la API falla, la ruta igual renderiza la página', async () => {
    // El contenido estático —comparativa y FAQ— ya no depende de los planes.
    mockFetchPublicPlans.mockRejectedValue(new Error('API caída'));

    render(await PremiumRoute());

    expect(mockPremiumPage).toHaveBeenCalledWith({ initialPlans: undefined });
    expect(screen.getByTestId('premium-page')).toBeInTheDocument();
  });
});
