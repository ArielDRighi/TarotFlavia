import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { ReactQueryProvider } from './react-query-provider';

// Helper component to test QueryClient configuration
function QueryClientConfigTester() {
  const queryClient = useQueryClient();
  const defaultOptions = queryClient.getDefaultOptions();

  // Cast to number since staleTime can be a function in some versions
  const staleTime =
    typeof defaultOptions.queries?.staleTime === 'number' ? defaultOptions.queries.staleTime : 0;

  return (
    <div>
      <span data-testid="stale-time">{staleTime}</span>
      <span data-testid="refetch-on-focus">
        {String(defaultOptions.queries?.refetchOnWindowFocus)}
      </span>
    </div>
  );
}

describe('ReactQueryProvider', () => {
  afterEach(() => {
    // Cleanup after each test
  });

  it('should render children correctly', () => {
    render(
      <ReactQueryProvider>
        <div data-testid="child">Test Child</div>
      </ReactQueryProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should provide QueryClient with correct staleTime (5 minutes)', () => {
    render(
      <ReactQueryProvider>
        <QueryClientConfigTester />
      </ReactQueryProvider>
    );

    const staleTime = screen.getByTestId('stale-time').textContent;
    expect(Number(staleTime)).toBe(5 * 60 * 1000); // 5 minutes in ms
  });

  it('should provide QueryClient with refetchOnWindowFocus disabled', () => {
    render(
      <ReactQueryProvider>
        <QueryClientConfigTester />
      </ReactQueryProvider>
    );

    const refetchOnFocus = screen.getByTestId('refetch-on-focus').textContent;
    expect(refetchOnFocus).toBe('false');
  });

  it('should be a Client Component (use client directive)', async () => {
    // Read the file content to verify 'use client' directive
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, './react-query-provider.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content.startsWith("'use client'")).toBe(true);
  });
});
