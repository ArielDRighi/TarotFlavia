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
  CardDetailView: ({
    card,
    combinationCardNames,
  }: {
    card: { nameEs: string };
    combinationCardNames?: Record<string, string>;
  }) => (
    <div
      data-testid="card-detail-view"
      data-combination-names={JSON.stringify(combinationCardNames)}
    >
      {card.nameEs}
    </div>
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

    render(<CardDetailPageContent slug="el-loco" initialCard={card} />);

    expect(screen.getByTestId('card-detail-view')).toBeInTheDocument();
    expect(screen.getByText('El Loco')).toBeInTheDocument();
  });

  it('⚠️ T-SEO-010: pasa al render los nombres de las combinaciones resueltos en el servidor', () => {
    // El nombre del cross-link se resuelve en la ruta; si se corta acá, el
    // enlace cae al slug en inglés sin que nada avise.
    mockUseCard.mockReturnValue({ data: card, isLoading: false, error: null });

    render(
      <CardDetailPageContent
        slug="el-loco"
        initialCard={card}
        combinationCardNames={{ 'el-mago': 'El Mago' }}
      />
    );

    expect(screen.getByTestId('card-detail-view')).toHaveAttribute(
      'data-combination-names',
      JSON.stringify({ 'el-mago': 'El Mago' })
    );
  });

  it('debe mostrar skeleton mientras carga', () => {
    mockUseCard.mockReturnValue({ data: undefined, isLoading: true, error: null });

    render(<CardDetailPageContent slug="el-loco" initialCard={card} />);

    expect(screen.getByTestId('encyclopedia-skeleton')).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error cuando no hay carta', () => {
    mockUseCard.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });

    render(<CardDetailPageContent slug="el-loco" initialCard={card} />);

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

  it('mantiene la ficha visible si falla un refetch en background', () => {
    // React Query v5 puebla `error` conservando el `data` bueno: mirar `error`
    // tiraría abajo una carta ya cargada por un fallo transitorio de la API.
    mockUseCard.mockReturnValue({ data: card, isLoading: false, error: new Error('Network') });

    render(<CardDetailPageContent slug="el-loco" initialCard={card} />);

    expect(screen.getByTestId('card-detail-view')).toBeInTheDocument();
    expect(screen.queryByText('Carta no encontrada')).not.toBeInTheDocument();
  });
});
