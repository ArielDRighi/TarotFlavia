/**
 * Tests for Birth Chart Store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useBirthChartStore } from './birthChartStore';
import type { ChartResponse } from '@/types/birth-chart-api.types';
import type { BirthDataFormValues } from '@/components/features/birth-chart/BirthDataForm/BirthDataForm.schema';
import { ZodiacSign } from '@/types/birth-chart.enums';

// Mock form data
const createMockFormData = (overrides?: Partial<BirthDataFormValues>): BirthDataFormValues => ({
  name: 'Test User',
  birthDate: '1990-01-01',
  birthTime: '12:00',
  birthPlace: 'Buenos Aires, Argentina',
  latitude: -34.6037,
  longitude: -58.3816,
  timezone: 'America/Argentina/Buenos_Aires',
  ...overrides,
});

// Mock chart response
const createMockChartResponse = (overrides?: Partial<ChartResponse>): ChartResponse => ({
  success: true,
  chartSvgData: {
    planets: [],
    houses: [],
    aspects: [],
  },
  planets: [],
  houses: [],
  aspects: [],
  bigThree: {
    sun: {
      sign: ZodiacSign.CAPRICORN,
      signName: 'Capricornio',
      interpretation: 'Test sun interpretation',
    },
    moon: {
      sign: ZodiacSign.PISCES,
      signName: 'Piscis',
      interpretation: 'Test moon interpretation',
    },
    ascendant: {
      sign: ZodiacSign.ARIES,
      signName: 'Aries',
      interpretation: 'Test ascendant interpretation',
    },
  },
  calculationTimeMs: 123,
  ...overrides,
});

// Helper to reset store completely
const resetStore = () => {
  useBirthChartStore.setState({
    formData: null,
    chartResult: null,
  });
};

describe('birthChartStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    resetStore();
  });

  describe('Initial State', () => {
    it('should have null formData by default', () => {
      const state = useBirthChartStore.getState();
      expect(state.formData).toBeNull();
    });

    it('should have null chartResult by default', () => {
      const state = useBirthChartStore.getState();
      expect(state.chartResult).toBeNull();
    });
  });

  describe('setFormData', () => {
    it('should set formData correctly', () => {
      const formData = createMockFormData();

      useBirthChartStore.getState().setFormData(formData);

      const state = useBirthChartStore.getState();
      expect(state.formData).toEqual(formData);
    });

    it('should overwrite existing formData', () => {
      const firstFormData = createMockFormData({ name: 'First User' });
      const secondFormData = createMockFormData({ name: 'Second User' });

      useBirthChartStore.getState().setFormData(firstFormData);
      useBirthChartStore.getState().setFormData(secondFormData);

      const state = useBirthChartStore.getState();
      expect(state.formData).toEqual(secondFormData);
      expect(state.formData?.name).toBe('Second User');
    });

    it('should preserve other state properties when setting formData', () => {
      const chartResult = createMockChartResponse();
      useBirthChartStore.getState().setChartResult(chartResult);

      const formData = createMockFormData();
      useBirthChartStore.getState().setFormData(formData);

      const state = useBirthChartStore.getState();
      expect(state.formData).toEqual(formData);
      expect(state.chartResult).toEqual(chartResult);
    });
  });

  describe('setChartResult', () => {
    it('should set chartResult correctly', () => {
      const chartResult = createMockChartResponse();

      useBirthChartStore.getState().setChartResult(chartResult);

      const state = useBirthChartStore.getState();
      expect(state.chartResult).toEqual(chartResult);
    });

    it('should overwrite existing chartResult', () => {
      const firstResult = createMockChartResponse({
        calculationTimeMs: 100,
      });
      const secondResult = createMockChartResponse({
        calculationTimeMs: 200,
      });

      useBirthChartStore.getState().setChartResult(firstResult);
      useBirthChartStore.getState().setChartResult(secondResult);

      const state = useBirthChartStore.getState();
      expect(state.chartResult).toEqual(secondResult);
      expect(state.chartResult?.calculationTimeMs).toBe(200);
    });

    it('should preserve other state properties when setting chartResult', () => {
      const formData = createMockFormData();
      useBirthChartStore.getState().setFormData(formData);

      const chartResult = createMockChartResponse();
      useBirthChartStore.getState().setChartResult(chartResult);

      const state = useBirthChartStore.getState();
      expect(state.chartResult).toEqual(chartResult);
      expect(state.formData).toEqual(formData);
    });
  });

  describe('reset', () => {
    it('should reset formData to null', () => {
      const formData = createMockFormData();
      useBirthChartStore.getState().setFormData(formData);

      useBirthChartStore.getState().reset();

      const state = useBirthChartStore.getState();
      expect(state.formData).toBeNull();
    });

    it('should reset chartResult to null', () => {
      const chartResult = createMockChartResponse();
      useBirthChartStore.getState().setChartResult(chartResult);

      useBirthChartStore.getState().reset();

      const state = useBirthChartStore.getState();
      expect(state.chartResult).toBeNull();
    });

    it('should reset both formData and chartResult to null', () => {
      const formData = createMockFormData();
      const chartResult = createMockChartResponse();

      useBirthChartStore.getState().setFormData(formData);
      useBirthChartStore.getState().setChartResult(chartResult);

      useBirthChartStore.getState().reset();

      const state = useBirthChartStore.getState();
      expect(state.formData).toBeNull();
      expect(state.chartResult).toBeNull();
    });

    it('should be idempotent (safe to call multiple times)', () => {
      const formData = createMockFormData();
      useBirthChartStore.getState().setFormData(formData);

      useBirthChartStore.getState().reset();
      useBirthChartStore.getState().reset();
      useBirthChartStore.getState().reset();

      const state = useBirthChartStore.getState();
      expect(state.formData).toBeNull();
      expect(state.chartResult).toBeNull();
    });
  });

  describe('Complete Flow', () => {
    it('should handle typical user flow: set form data → set result → reset', () => {
      // Step 1: User fills form
      const formData = createMockFormData();
      useBirthChartStore.getState().setFormData(formData);

      let state = useBirthChartStore.getState();
      expect(state.formData).toEqual(formData);
      expect(state.chartResult).toBeNull();

      // Step 2: Server returns chart
      const chartResult = createMockChartResponse();
      useBirthChartStore.getState().setChartResult(chartResult);

      state = useBirthChartStore.getState();
      expect(state.formData).toEqual(formData);
      expect(state.chartResult).toEqual(chartResult);

      // Step 3: User navigates away or generates new chart
      useBirthChartStore.getState().reset();

      state = useBirthChartStore.getState();
      expect(state.formData).toBeNull();
      expect(state.chartResult).toBeNull();
    });
  });
});
