/**
 * Download PDF Hooks
 *
 * Hooks para descargar PDFs de cartas astrales
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios-config';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { GenerateChartRequest } from '@/types/birth-chart-api.types';

/**
 * Helper para descargar un blob como archivo
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

interface DownloadPdfParams {
  chartData: GenerateChartRequest;
  filename?: string;
}

/**
 * Hook para descargar PDF de una carta astral recién generada
 */
export function useDownloadPdf() {
  return useMutation({
    mutationFn: async ({ chartData, filename }: DownloadPdfParams) => {
      const response = await apiClient.post<Blob>(API_ENDPOINTS.BIRTH_CHART.PDF, chartData, {
        responseType: 'blob',
      });

      const finalFilename = filename || `carta-astral-${chartData.name || 'anon'}.pdf`;
      downloadBlob(response.data, finalFilename);

      return { success: true };
    },
  });
}

interface DownloadSavedChartParams {
  chartId: number;
  filename?: string;
}

/**
 * Hook para descargar PDF de una carta guardada (por ID)
 */
export function useDownloadSavedChartPdf() {
  return useMutation({
    mutationFn: async ({ chartId, filename }: DownloadSavedChartParams) => {
      const response = await apiClient.get<Blob>(API_ENDPOINTS.BIRTH_CHART.PDF_BY_ID(chartId), {
        responseType: 'blob',
      });

      const finalFilename = filename || `carta-astral-${chartId}.pdf`;
      downloadBlob(response.data, finalFilename);

      return { success: true };
    },
  });
}
