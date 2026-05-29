/**
 * Tests para ai-usage utils
 */

import { describe, it, expect } from 'vitest';
import {
  getProviderLabel,
  calculateTotalCost,
  calculateTotalCalls,
  calculateSuccessRate,
} from './ai-usage';
import type { AIProviderStats } from '@/types/admin.types';

describe('getProviderLabel', () => {
  it('should return "Groq" for provider "groq"', () => {
    expect(getProviderLabel('groq')).toBe('Groq');
  });

  it('should return "OpenAI" for provider "openai"', () => {
    expect(getProviderLabel('openai')).toBe('OpenAI');
  });

  it('should return "DeepSeek" for provider "deepseek"', () => {
    expect(getProviderLabel('deepseek')).toBe('DeepSeek');
  });

  it('should return "Gemini" for provider "gemini"', () => {
    expect(getProviderLabel('gemini')).toBe('Gemini');
  });

  it('should capitalize unknown providers as fallback', () => {
    expect(getProviderLabel('unknown')).toBe('Unknown');
  });

  it('should be case-insensitive', () => {
    expect(getProviderLabel('GROQ')).toBe('Groq');
    expect(getProviderLabel('OpenAI')).toBe('OpenAI');
  });
});

const makeProvider = (overrides: Partial<AIProviderStats>): AIProviderStats => ({
  provider: 'groq',
  totalCalls: 100,
  successCalls: 90,
  errorCalls: 10,
  cachedCalls: 5,
  totalTokens: 50000,
  totalCost: 0.5,
  avgDuration: 200,
  errorRate: 10.0,
  cacheHitRate: 5.0,
  fallbackRate: 2.0,
  ...overrides,
});

describe('calculateTotalCost', () => {
  it('should sum totalCost across all providers', () => {
    const providers = [makeProvider({ totalCost: 0.5 }), makeProvider({ totalCost: 0.25 })];
    expect(calculateTotalCost(providers)).toBeCloseTo(0.75, 4);
  });

  it('should return 0 for empty array', () => {
    expect(calculateTotalCost([])).toBe(0);
  });
});

describe('calculateTotalCalls', () => {
  it('should sum totalCalls across all providers', () => {
    const providers = [makeProvider({ totalCalls: 100 }), makeProvider({ totalCalls: 200 })];
    expect(calculateTotalCalls(providers)).toBe(300);
  });

  it('should return 0 for empty array', () => {
    expect(calculateTotalCalls([])).toBe(0);
  });
});

describe('calculateSuccessRate', () => {
  it('should calculate success rate correctly', () => {
    const providers = [
      makeProvider({ totalCalls: 100, successCalls: 90 }),
      makeProvider({ totalCalls: 100, successCalls: 80 }),
    ];
    // (90 + 80) / (100 + 100) = 170 / 200 = 85%
    expect(calculateSuccessRate(providers)).toBeCloseTo(85, 1);
  });

  it('should return 0 when no calls', () => {
    expect(calculateSuccessRate([])).toBe(0);
  });

  it('should return 100 when all calls succeed', () => {
    const providers = [makeProvider({ totalCalls: 50, successCalls: 50 })];
    expect(calculateSuccessRate(providers)).toBe(100);
  });
});
