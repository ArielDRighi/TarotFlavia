import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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

// Mock next/image (render a plain img so we can assert src/alt)
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="next-image" />
  ),
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

  // ─── Rediseño T-ENC-005: identidad de marca ──────────────────────────────────

  it('debe mostrar una banda de cabecera con identidad de marca', () => {
    renderWithProviders(<EnciclopediaPage />);

    const hero = screen.getByTestId('encyclopedia-hub-hero');
    expect(hero).toBeInTheDocument();
    expect(hero).toHaveTextContent('Enciclopedia Mística');
  });

  it('cada sección debe mostrar una imagen temática con alt descriptivo (no emojis)', () => {
    renderWithProviders(<EnciclopediaPage />);

    const tarot = screen.getByTestId('encyclopedia-section-tarot');
    const astrologia = screen.getByTestId('encyclopedia-section-astrologia');
    const guias = screen.getByTestId('encyclopedia-section-guias');

    const tarotImg = within(tarot).getByTestId('next-image');
    const astrologiaImg = within(astrologia).getByTestId('next-image');
    const guiasImg = within(guias).getByTestId('next-image');

    expect(tarotImg).toHaveAttribute('src', '/images/enciclopedia/hub-tarot.webp');
    expect(astrologiaImg).toHaveAttribute('src', '/images/enciclopedia/hub-astrologia.webp');
    expect(guiasImg).toHaveAttribute('src', '/images/enciclopedia/hub-guias.webp');

    // alt no vacío y en español
    expect(tarotImg.getAttribute('alt')).toBeTruthy();
    expect(astrologiaImg.getAttribute('alt')).toBeTruthy();
    expect(guiasImg.getAttribute('alt')).toBeTruthy();
  });

  it('no debe usar emojis del sistema como íconos de sección', () => {
    renderWithProviders(<EnciclopediaPage />);

    const hub = screen.getByTestId('encyclopedia-hub');
    expect(hub.textContent ?? '').not.toMatch(/[🃏⭐📚]/u);
  });
});
