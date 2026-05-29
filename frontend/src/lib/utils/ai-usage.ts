/**
 * AI Usage utility functions
 */

import type { AIProviderStats } from '@/types/admin.types';

/** Mapa de provider (lowercase) → etiqueta legible para el usuario */
const PROVIDER_LABELS: Record<string, string> = {
  groq: 'Groq',
  openai: 'OpenAI',
  deepseek: 'DeepSeek',
  gemini: 'Gemini',
};

/**
 * Convierte un provider lowercase (tal como lo devuelve el backend) en una
 * etiqueta legible para el usuario.
 *
 * @example
 * getProviderLabel('groq')     // → 'Groq'
 * getProviderLabel('openai')   // → 'OpenAI'
 * getProviderLabel('deepseek') // → 'DeepSeek'
 * getProviderLabel('gemini')   // → 'Gemini'
 * getProviderLabel('unknown')  // → 'Unknown' (fallback capitalizado)
 */
export function getProviderLabel(provider: string): string {
  return (
    PROVIDER_LABELS[provider.toLowerCase()] ?? provider.charAt(0).toUpperCase() + provider.slice(1)
  );
}

/**
 * Calcula el costo total sumando el costo de todos los proveedores.
 */
export function calculateTotalCost(providers: AIProviderStats[]): number {
  return providers.reduce((sum, p) => sum + p.totalCost, 0);
}

/**
 * Calcula el total de llamadas de todos los proveedores.
 */
export function calculateTotalCalls(providers: AIProviderStats[]): number {
  return providers.reduce((sum, p) => sum + p.totalCalls, 0);
}

/**
 * Calcula la tasa de éxito global (sobre todos los proveedores).
 */
export function calculateSuccessRate(providers: AIProviderStats[]): number {
  const totalCalls = calculateTotalCalls(providers);
  if (totalCalls === 0) return 0;
  const totalSuccessful = providers.reduce((sum, p) => sum + p.successCalls, 0);
  return (totalSuccessful / totalCalls) * 100;
}
