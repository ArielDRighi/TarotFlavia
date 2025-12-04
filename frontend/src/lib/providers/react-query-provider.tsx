'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * TanStack Query configuration constants
 */
const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Creates a QueryClient with default configuration optimized for the app.
 *
 * Configuration:
 * - staleTime: 5 minutes - Data is considered fresh for 5 minutes
 * - refetchOnWindowFocus: false - Prevent automatic refetch when user returns to tab
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        refetchOnWindowFocus: false,
      },
    },
  });
}

// Browser: use a singleton to avoid creating a new QueryClient on each render
let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always create a new QueryClient
    return makeQueryClient();
  }

  // Browser: reuse the existing QueryClient or create a new one
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

interface ReactQueryProviderProps {
  children: ReactNode;
}

/**
 * ReactQueryProvider - Wraps the application with TanStack Query provider
 *
 * Features:
 * - Configured with 5-minute stale time for optimal caching
 * - Disabled refetchOnWindowFocus for better UX
 * - Includes ReactQueryDevtools in development mode
 *
 * @example
 * ```tsx
 * <ReactQueryProvider>
 *   <App />
 * </ReactQueryProvider>
 * ```
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Use useState to ensure QueryClient is created only once per component lifecycle
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
