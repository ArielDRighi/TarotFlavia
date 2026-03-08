import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import CardDetailPage from './page';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'el-loco' }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    'data-testid': dataTestId,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    'data-testid'?: string;
  } & Record<string, unknown>) => (
    <a href={href} data-testid={dataTestId} {...rest}>
      {children}
    </a>
  ),
}));

const mockUseCard = vi.fn();

vi.mock('@/hooks/api/useEncyclopedia', () => ({
  useCard: (slug: string) => mockUseCard(slug),
}));

vi.mock('@/components/features/encyclopedia', () => ({
  CardDetailView: ({ card }: { card: { nameEs: string } }) => (
    <div data-testid="card-detail-view">{card.nameEs}</div>
  ),
  EncyclopediaSkeleton: ({ variant }: { variant: string }) => (
    <div data-testid="encyclopedia-skeleton" data-variant={variant} />
  ),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CardDetailPage (/enciclopedia/tarot/[slug])', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar CardDetailView cuando la carta existe', () => {
    mockUseCard.mockReturnValue({
      data: { id: 1, slug: 'el-loco', nameEs: 'El Loco' },
      isLoading: false,
      error: null,
    });

    render(<CardDetailPage />);

    expect(screen.getByTestId('card-detail-view')).toBeInTheDocument();
    expect(screen.getByText('El Loco')).toBeInTheDocument();
  });

  it('debe mostrar skeleton mientras carga', () => {
    mockUseCard.mockReturnValue({ data: undefined, isLoading: true, error: null });

    render(<CardDetailPage />);

    expect(screen.getByTestId('encyclopedia-skeleton')).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error cuando la carta no existe (404)', () => {
    mockUseCard.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });

    render(<CardDetailPage />);

    expect(screen.getByText('Carta no encontrada')).toBeInTheDocument();
  });
});
