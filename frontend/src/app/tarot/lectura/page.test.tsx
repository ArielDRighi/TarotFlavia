import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LecturaPage from './page';

// Mock Next.js navigation
const mockSearchParams = new Map<string, string>();

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) || null,
  }),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock ReadingExperience component
vi.mock('@/components/features/readings/ReadingExperience', () => ({
  ReadingExperience: function MockReadingExperience({
    spreadId,
    questionId,
    customQuestion,
  }: {
    spreadId: number;
    questionId: number | null;
    customQuestion: string | null;
  }) {
    return (
      <div data-testid="reading-experience">
        <span data-testid="spread-id">{spreadId}</span>
        <span data-testid="question-id">{questionId}</span>
        <span data-testid="custom-question">{customQuestion}</span>
      </div>
    );
  },
}));

// Query client for tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('LecturaPage', () => {
  beforeEach(() => {
    mockSearchParams.clear();
  });

  it('should show error when spreadId is missing', () => {
    renderWithProviders(<LecturaPage />);

    expect(screen.getByText(/Selecciona una tirada primero/i)).toBeInTheDocument();
  });

  it('should render ReadingExperience when spreadId is provided', () => {
    mockSearchParams.set('spreadId', '2');

    renderWithProviders(<LecturaPage />);

    expect(screen.getByTestId('reading-experience')).toBeInTheDocument();
    expect(screen.getByTestId('spread-id')).toHaveTextContent('2');
  });

  it('should pass questionId to ReadingExperience', () => {
    mockSearchParams.set('spreadId', '2');
    mockSearchParams.set('questionId', '5');

    renderWithProviders(<LecturaPage />);

    expect(screen.getByTestId('question-id')).toHaveTextContent('5');
  });

  it('should pass customQuestion to ReadingExperience', () => {
    mockSearchParams.set('spreadId', '2');
    mockSearchParams.set('customQuestion', encodeURIComponent('¿Encontraré el amor?'));

    renderWithProviders(<LecturaPage />);

    expect(screen.getByTestId('custom-question')).toHaveTextContent('¿Encontraré el amor?');
  });

  it('should decode customQuestion from URL', () => {
    mockSearchParams.set('spreadId', '2');
    mockSearchParams.set('customQuestion', '%C2%BFQu%C3%A9%20pasa%20con%20mi%20trabajo%3F');

    renderWithProviders(<LecturaPage />);

    expect(screen.getByTestId('custom-question')).toHaveTextContent('¿Qué pasa con mi trabajo?');
  });

  it('should convert spreadId to number', () => {
    mockSearchParams.set('spreadId', '3');

    renderWithProviders(<LecturaPage />);

    expect(screen.getByTestId('spread-id')).toHaveTextContent('3');
  });
});
