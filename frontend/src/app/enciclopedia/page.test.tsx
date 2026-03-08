import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import EnciclopediaPage from './page';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
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
    className,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    'data-testid'?: string;
    className?: string;
  } & Record<string, unknown>) => (
    <a href={href} data-testid={dataTestId} className={className} {...rest}>
      {children}
    </a>
  ),
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

describe('EnciclopediaPage (Hub principal)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar las 3 secciones principales', () => {
    renderWithProviders(<EnciclopediaPage />);

    expect(screen.getByTestId('encyclopedia-section-tarot')).toBeInTheDocument();
    expect(screen.getByTestId('encyclopedia-section-astrologia')).toBeInTheDocument();
    expect(screen.getByTestId('encyclopedia-section-guias')).toBeInTheDocument();
  });

  it('links de categorías deben tener href correcto', () => {
    renderWithProviders(<EnciclopediaPage />);

    const tarotLink = screen.getByTestId('encyclopedia-link-tarot');
    const astrologiaLink = screen.getByTestId('encyclopedia-link-astrologia');
    const guiasLink = screen.getByTestId('encyclopedia-link-guias');

    expect(tarotLink).toHaveAttribute('href', '/enciclopedia/tarot');
    expect(astrologiaLink).toHaveAttribute('href', '/enciclopedia/astrologia');
    expect(guiasLink).toHaveAttribute('href', '/enciclopedia/guias');
  });

  it('debe mostrar título de la sección Tarot', () => {
    renderWithProviders(<EnciclopediaPage />);

    expect(screen.getByTestId('encyclopedia-section-tarot')).toHaveTextContent('Tarot');
  });

  it('debe mostrar título de la sección Astrología', () => {
    renderWithProviders(<EnciclopediaPage />);

    expect(screen.getByTestId('encyclopedia-section-astrologia')).toHaveTextContent('Astrología');
  });

  it('debe mostrar título de la sección Guías', () => {
    renderWithProviders(<EnciclopediaPage />);

    expect(screen.getByTestId('encyclopedia-section-guias')).toHaveTextContent('Guías');
  });
});
