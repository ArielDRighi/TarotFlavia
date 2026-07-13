/**
 * Tests for useSendContactMessage (T-PROD-014)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useSendContactMessage } from './useSendContactMessage';
import * as contactApi from '@/lib/api/contact-api';
import type { ContactFormData } from '@/lib/validations/contact.schemas';

vi.mock('@/lib/api/contact-api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestQueryClientWrapper';
  return Wrapper;
};

const formData: ContactFormData = {
  name: 'Ana García',
  email: 'ana@example.com',
  subject: 'Consulta de prueba',
  message: 'Este es un mensaje de prueba.',
};

describe('useSendContactMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send the message through the contact API', async () => {
    vi.mocked(contactApi.sendContactMessage).mockResolvedValue({ message: 'Mensaje enviado' });

    const { result } = renderHook(() => useSendContactMessage(), { wrapper: createWrapper() });

    result.current.mutate(formData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Se compara el primer argumento: TanStack Query v5 le pasa además un segundo
    // parámetro de contexto al mutationFn.
    expect(vi.mocked(contactApi.sendContactMessage).mock.calls[0][0]).toEqual(formData);
  });

  it('should expose the error state when the backend fails', async () => {
    vi.mocked(contactApi.sendContactMessage).mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useSendContactMessage(), { wrapper: createWrapper() });

    result.current.mutate(formData);

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('should expose the pending state while the message is in flight', async () => {
    vi.mocked(contactApi.sendContactMessage).mockImplementation(
      () => new Promise(() => {}) // nunca resuelve: el envío queda en vuelo
    );

    const { result } = renderHook(() => useSendContactMessage(), { wrapper: createWrapper() });

    result.current.mutate(formData);

    await waitFor(() => expect(result.current.isPending).toBe(true));
  });
});
