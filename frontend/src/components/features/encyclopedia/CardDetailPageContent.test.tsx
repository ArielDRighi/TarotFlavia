import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CardDetailPageContent } from './CardDetailPageContent';
import type { CardDetail } from '@/types/encyclopedia.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

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
  useCard: (slug: string, initialData?: CardDetail) => mockUseCard(slug, initialData),
}));

vi.mock('./CardDetailView', () => ({
  CardDetailView: ({ card }: { card: { nameEs: string } }) => (
    <div data-testid="card-detail-view">{card.nameEs}</div>
  ),
}));

vi.mock('./EncyclopediaSkeleton', () => ({
  EncyclopediaSkeleton: ({ variant }: { variant: string }) => (
    <div data-testid="encyclopedia-skeleton" data-variant={variant} />
  ),
}));

const card = { id: 1, slug: 'el-loco', nameEs: 'El Loco' } as CardDetail;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CardDetailPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar CardDetailView cuando la carta existe', () => {
    mockUseCard.mockReturnValue({ data: card, isLoading: false, error: null });

    render(<CardDetailPageContent slug="el-loco" initialCard={null} />);

    expect(screen.getByTestId('card-detail-view')).toBeInTheDocument();
    expect(screen.getByText('El Loco')).toBeInTheDocument();
  });

  it('debe mostrar skeleton mientras carga', () => {
    mockUseCard.mockReturnValue({ data: undefined, isLoading: true, error: null });

    render(<CardDetailPageContent slug="el-loco" initialCard={null} />);

    expect(screen.getByTestId('encyclopedia-skeleton')).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error cuando la carta no existe (404)', () => {
    mockUseCard.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });

    render(<CardDetailPageContent slug="el-loco" initialCard={null} />);

    expect(screen.getByText('Carta no encontrada')).toBeInTheDocument();
  });

  it('⚠️ T-PROD-020: siembra la query con la carta resuelta en el servidor', () => {
    // Sin esto el HTML que recibe Googlebot es el skeleton — idéntico en las 78
    // fichas — y Google las agrupa como duplicadas eligiendo una sola canónica.
    mockUseCard.mockReturnValue({ data: card, isLoading: false, error: null });

    render(<CardDetailPageContent slug="el-loco" initialCard={card} />);

    expect(mockUseCard).toHaveBeenCalledWith('el-loco', card);
    expect(screen.getByTestId('card-detail-view')).toBeInTheDocument();
  });

  it('cae al fetch del cliente si el servidor no pudo resolver la carta', () => {
    mockUseCard.mockReturnValue({ data: undefined, isLoading: true, error: null });

    render(<CardDetailPageContent slug="el-loco" initialCard={null} />);

    expect(mockUseCard).toHaveBeenCalledWith('el-loco', undefined);
    expect(screen.getByTestId('encyclopedia-skeleton')).toBeInTheDocument();
  });
});
