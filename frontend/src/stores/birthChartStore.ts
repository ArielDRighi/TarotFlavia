/**
 * Birth Chart Store
 *
 * Zustand store para manejar el estado temporal de la carta astral
 * durante el flujo de generación y visualización
 */

import { create } from 'zustand';
import type { ChartResponse } from '@/types/birth-chart-api.types';
import type { BirthDataFormValues } from '@/components/features/birth-chart/BirthDataForm/BirthDataForm.schema';

interface BirthChartState {
  // Datos del formulario
  formData: BirthDataFormValues | null;
  setFormData: (data: BirthDataFormValues) => void;

  // Resultado de la carta
  chartResult: ChartResponse | null;
  setChartResult: (result: ChartResponse) => void;

  // Limpiar todo
  reset: () => void;
}

export const useBirthChartStore = create<BirthChartState>((set) => ({
  formData: null,
  setFormData: (data) => set({ formData: data }),

  chartResult: null,
  setChartResult: (result) => set({ chartResult: result }),

  reset: () => set({ formData: null, chartResult: null }),
}));
