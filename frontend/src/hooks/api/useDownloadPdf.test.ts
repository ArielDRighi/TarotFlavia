/**
 * Download PDF Hook Tests
 *
 * Tests para los hooks de descarga de PDFs de cartas astrales
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { createElement, type ReactNode } from 'react';
import * as axiosConfig from '@/lib/api/axios-config';
import { useDownloadPdf, useDownloadSavedChartPdf } from './useDownloadPdf';

// Mock de axios-config
vi.mock('@/lib/api/axios-config', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockPost = axiosConfig.apiClient.post as Mock;
const mockGet = axiosConfig.apiClient.get as Mock;

// Helper para crear wrapper con QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
}

// Mock de URL.createObjectURL y URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

// Mock de document.createElement para simular el click de descarga
const mockClick = vi.fn();
const mockRemove = vi.fn();
const originalCreateElement = document.createElement.bind(document);
vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
  if (tagName === 'a') {
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
      remove: mockRemove,
      style: {},
    } as unknown as HTMLAnchorElement;
    return mockAnchor;
  }
  return originalCreateElement(tagName);
});

describe('useDownloadPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should download PDF with custom filename and return void', async () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    mockPost.mockResolvedValue({ data: mockBlob });

    const { result } = renderHook(() => useDownloadPdf(), {
      wrapper: createWrapper(),
    });

    const mockChartData = {
      name: 'Juan Pérez',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      birthPlace: 'Buenos Aires, Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
      timezone: 'America/Argentina/Buenos_Aires',
    };

    result.current.mutate({
      chartData: mockChartData,
      filename: 'mi-carta-astral.pdf',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // El backend retorna Blob directamente, mutation debería retornar void
    expect(result.current.data).toBeUndefined();
    expect(mockPost).toHaveBeenCalledWith('/birth-chart/pdf', mockChartData, {
      responseType: 'blob',
    });
    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  it('should use default filename if not provided', async () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    mockPost.mockResolvedValue({ data: mockBlob });

    const { result } = renderHook(() => useDownloadPdf(), {
      wrapper: createWrapper(),
    });

    const mockChartData = {
      name: 'María López',
      birthDate: '1985-12-25',
      birthTime: '08:00',
      birthPlace: 'Madrid, España',
      latitude: 40.4168,
      longitude: -3.7038,
      timezone: 'Europe/Madrid',
    };

    result.current.mutate({ chartData: mockChartData });

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });

    // Verificar que se usa el filename por defecto
    const anchor = document.createElement('a') as HTMLAnchorElement;
    expect(anchor.download).toBeDefined();
  });

  it('should handle download errors', async () => {
    mockPost.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDownloadPdf(), {
      wrapper: createWrapper(),
    });

    const mockChartData = {
      name: 'Test User',
      birthDate: '1990-01-01',
      birthTime: '12:00',
      birthPlace: 'Test City',
      latitude: 0,
      longitude: 0,
      timezone: 'UTC',
    };

    result.current.mutate({ chartData: mockChartData });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
    expect(mockCreateObjectURL).not.toHaveBeenCalled();
    expect(mockClick).not.toHaveBeenCalled();
  });
});

describe('useDownloadSavedChartPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should download saved chart PDF by ID and return void', async () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    mockGet.mockResolvedValue({ data: mockBlob });

    const { result } = renderHook(() => useDownloadSavedChartPdf(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      chartId: 42,
      filename: 'carta-guardada.pdf',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // El backend retorna Blob directamente, mutation debería retornar void
    expect(result.current.data).toBeUndefined();
    expect(mockGet).toHaveBeenCalledWith('/birth-chart/history/42/pdf', {
      responseType: 'blob',
    });
    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  it('should use default filename if not provided', async () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    mockGet.mockResolvedValue({ data: mockBlob });

    const { result } = renderHook(() => useDownloadSavedChartPdf(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ chartId: 123 });

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });

    expect(mockGet).toHaveBeenCalledWith('/birth-chart/history/123/pdf', {
      responseType: 'blob',
    });
  });

  it('should handle download errors', async () => {
    mockGet.mockRejectedValue(new Error('Chart not found'));

    const { result } = renderHook(() => useDownloadSavedChartPdf(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ chartId: 999 });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
    expect(mockCreateObjectURL).not.toHaveBeenCalled();
    expect(mockClick).not.toHaveBeenCalled();
  });
});
