/**
 * Tests for Admin Plans Page
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PlanesPage from './page';
import { ReactNode } from 'react';

// Mock del container
vi.mock('@/components/features/admin/PlanesConfigContainer', () => ({
  PlanesConfigContainer: () => <div data-testid="planes-config-container">Container</div>,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';

  return Wrapper;
};

describe('PlanesPage', () => {
  it('should render PlanesConfigContainer', () => {
    render(<PlanesPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId('planes-config-container')).toBeInTheDocument();
  });
});
