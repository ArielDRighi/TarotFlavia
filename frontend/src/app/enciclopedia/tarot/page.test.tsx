import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import EnciclopediaTarotPage from './page';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/api/useEncyclopedia', () => ({
  useCards: () => ({ data: [], isLoading: false }),
  useMajorArcana: () => ({ data: [], isLoading: false }),
  useCardsBySuit: () => ({ data: [], isLoading: false }),
  useSearchCards: () => ({ data: [], isLoading: false }),
}));

// ─── Test setup ───────────────────────────────────────────────────────────────

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('EnciclopediaTarotPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el contenido de la enciclopedia de tarot', () => {
    renderWithProviders(<EnciclopediaTarotPage />);

    expect(screen.getByText('Enciclopedia del Tarot')).toBeInTheDocument();
  });
});
