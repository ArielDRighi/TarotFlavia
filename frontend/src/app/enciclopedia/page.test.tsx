import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import EnciclopediaPage from './page';
import { ArcanaType, Suit } from '@/types/encyclopedia.types';
import type { CardSummary } from '@/types/encyclopedia.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const mockUseCards = vi.fn();
const mockUseMajorArcana = vi.fn();
const mockUseCardsBySuit = vi.fn();
const mockUseSearchCards = vi.fn();

vi.mock('@/hooks/api/useEncyclopedia', () => ({
  useCards: () => mockUseCards(),
  useMajorArcana: () => mockUseMajorArcana(),
  useCardsBySuit: (suit: Suit) => mockUseCardsBySuit(suit),
  useSearchCards: (query: string) => mockUseSearchCards(query),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCard(id: number, arcanaType: ArcanaType, suit: Suit | null = null): CardSummary {
  return {
    id,
    slug: `carta-${id}`,
    nameEs: `Carta ${id}`,
    arcanaType,
    number: id,
    suit,
    thumbnailUrl: `/img/card-${id}.jpg`,
  };
}

const MAJOR_CARDS: CardSummary[] = Array.from({ length: 22 }, (_, i) =>
  buildCard(i + 1, ArcanaType.MAJOR)
);

const WANDS_CARDS: CardSummary[] = Array.from({ length: 14 }, (_, i) =>
  buildCard(100 + i, ArcanaType.MINOR, Suit.WANDS)
);

const CUPS_CARDS: CardSummary[] = Array.from({ length: 14 }, (_, i) =>
  buildCard(200 + i, ArcanaType.MINOR, Suit.CUPS)
);

const SWORDS_CARDS: CardSummary[] = Array.from({ length: 14 }, (_, i) =>
  buildCard(300 + i, ArcanaType.MINOR, Suit.SWORDS)
);

const PENTACLES_CARDS: CardSummary[] = Array.from({ length: 14 }, (_, i) =>
  buildCard(400 + i, ArcanaType.MINOR, Suit.PENTACLES)
);

const MINOR_CARDS: CardSummary[] = [
  ...WANDS_CARDS,
  ...CUPS_CARDS,
  ...SWORDS_CARDS,
  ...PENTACLES_CARDS,
];

const ALL_CARDS: CardSummary[] = [...MAJOR_CARDS, ...MINOR_CARDS];

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

function setupDefaultMocks() {
  mockUseCards.mockReturnValue({ data: ALL_CARDS, isLoading: false });
  mockUseMajorArcana.mockReturnValue({ data: MAJOR_CARDS, isLoading: false });
  mockUseCardsBySuit.mockReturnValue({ data: [], isLoading: false });
  mockUseSearchCards.mockReturnValue({ data: [], isLoading: false });
}

// Helper to count rendered card thumbnails inside the grid
function countCardThumbnails() {
  const grid = screen.getByTestId('card-grid');
  // Each card is a link wrapping a div with data-testid="card-thumbnail-{slug}"
  return grid.querySelectorAll('[data-testid^="card-thumbnail-"]').length;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('EnciclopediaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
  });

  it('should render page title and description', () => {
    renderWithProviders(<EnciclopediaPage />);

    expect(screen.getByText('Enciclopedia del Tarot')).toBeInTheDocument();
    expect(
      screen.getByText('Explora las 78 cartas y descubre sus significados')
    ).toBeInTheDocument();
  });

  it('should display all 78 cards by default', () => {
    renderWithProviders(<EnciclopediaPage />);

    expect(screen.getByTestId('card-grid')).toBeInTheDocument();
    expect(countCardThumbnails()).toBe(78);
  });

  it('should show loading skeleton when cards are loading', () => {
    mockUseCards.mockReturnValue({ data: undefined, isLoading: true });

    renderWithProviders(<EnciclopediaPage />);

    expect(screen.getByTestId('encyclopedia-skeleton')).toBeInTheDocument();
  });

  it('should render search bar', () => {
    renderWithProviders(<EnciclopediaPage />);

    expect(screen.getByTestId('encyclopedia-search-bar')).toBeInTheDocument();
  });

  it('should render category tabs when not searching', () => {
    renderWithProviders(<EnciclopediaPage />);

    expect(screen.getByTestId('category-tabs')).toBeInTheDocument();
  });

  it('should filter by major arcana when category tab is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EnciclopediaPage />);

    const majorTab = screen.getByRole('button', { name: /arcanos mayores/i });
    await user.click(majorTab);

    // Now should show 22 major arcana cards
    expect(countCardThumbnails()).toBe(22);
  });

  it('should filter by minor arcana when category tab is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EnciclopediaPage />);

    const minorTab = screen.getByRole('button', { name: /arcanos menores/i });
    await user.click(minorTab);

    // Should show 56 minor arcana cards (from allCards filtered)
    expect(countCardThumbnails()).toBe(56);
  });

  it('should show suit selector when minor arcana tab is active', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EnciclopediaPage />);

    const minorTab = screen.getByRole('button', { name: /arcanos menores/i });
    await user.click(minorTab);

    expect(screen.getByTestId('suit-selector')).toBeInTheDocument();
  });

  it('should not show suit selector when all cards tab is active', () => {
    renderWithProviders(<EnciclopediaPage />);

    expect(screen.queryByTestId('suit-selector')).not.toBeInTheDocument();
  });

  it('should filter by suit when a suit is selected in minor arcana', async () => {
    const user = userEvent.setup();
    mockUseCardsBySuit.mockReturnValue({ data: WANDS_CARDS, isLoading: false });

    renderWithProviders(<EnciclopediaPage />);

    // Switch to minor arcana
    const minorTab = screen.getByRole('button', { name: /arcanos menores/i });
    await user.click(minorTab);

    // Select Wands suit
    const wandsButton = screen.getByRole('button', { name: /bastos/i });
    await user.click(wandsButton);

    // Should show 14 wands cards (from useCardsBySuit)
    expect(countCardThumbnails()).toBe(14);
  });

  it('should search cards when query has at least 2 characters', async () => {
    const user = userEvent.setup();
    const searchResults: CardSummary[] = [buildCard(1, ArcanaType.MAJOR)];
    mockUseSearchCards.mockReturnValue({ data: searchResults, isLoading: false });

    renderWithProviders(<EnciclopediaPage />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'lo');

    await waitFor(() => {
      expect(countCardThumbnails()).toBe(1);
    });
  });

  it('should hide category tabs when searching', async () => {
    const user = userEvent.setup();
    mockUseSearchCards.mockReturnValue({ data: [], isLoading: false });

    renderWithProviders(<EnciclopediaPage />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'lo');

    await waitFor(() => {
      expect(screen.queryByTestId('category-tabs')).not.toBeInTheDocument();
    });
  });

  it('should show result count when searching', async () => {
    const user = userEvent.setup();
    const searchResults: CardSummary[] = [
      buildCard(1, ArcanaType.MAJOR),
      buildCard(2, ArcanaType.MAJOR),
    ];
    mockUseSearchCards.mockReturnValue({ data: searchResults, isLoading: false });

    renderWithProviders(<EnciclopediaPage />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'lo');

    await waitFor(() => {
      expect(screen.getByText(/2 resultado/i)).toBeInTheDocument();
    });
  });

  it('should not show result count while search is loading', async () => {
    const user = userEvent.setup();
    mockUseSearchCards.mockReturnValue({ data: undefined, isLoading: true });

    renderWithProviders(<EnciclopediaPage />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'lo');

    // Counter must NOT appear while loading (avoids flash of "0 resultados")
    expect(screen.queryByText(/resultado/i)).not.toBeInTheDocument();
  });

  it('should reset suit when switching categories', async () => {
    const user = userEvent.setup();
    mockUseCardsBySuit.mockReturnValue({ data: WANDS_CARDS, isLoading: false });

    renderWithProviders(<EnciclopediaPage />);

    // Switch to minor and select a suit
    await user.click(screen.getByRole('button', { name: /arcanos menores/i }));
    await user.click(screen.getByRole('button', { name: /bastos/i }));

    // Switch back to all — suit selector should disappear
    await user.click(screen.getByRole('button', { name: /todas/i }));

    expect(screen.queryByTestId('suit-selector')).not.toBeInTheDocument();
  });
});
