/**
 * Tipos de API para Carta Astral
 *
 * Define las interfaces TypeScript para requests/responses de la API de carta astral,
 * incluyendo type guards para diferenciar respuestas según el plan del usuario.
 */

import {
  PlanetPosition,
  HouseCusp,
  ChartAspect,
  ChartDistribution,
  ChartSvgData,
  SavedChart,
} from './birth-chart.types';
import {
  BigThreeInterpretation,
  FullInterpretation,
  AISynthesis,
} from './birth-chart-interpretation.types';

/**
 * Request para generar una carta astral
 */
export interface GenerateChartRequest {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Respuesta básica para usuarios anónimos
 */
export interface BasicChartResponse {
  success: boolean;
  chartSvgData: ChartSvgData;
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: ChartAspect[];
  bigThree: BigThreeInterpretation;
  calculationTimeMs: number;
}

/**
 * Respuesta completa para usuarios Free
 */
export interface FullChartResponse extends BasicChartResponse {
  distribution: ChartDistribution;
  interpretations: FullInterpretation;
  canDownloadPdf: boolean;
}

/**
 * Respuesta Premium con todas las funcionalidades
 */
export interface PremiumChartResponse extends FullChartResponse {
  savedChartId?: number;
  aiSynthesis: AISynthesis;
  canAccessHistory: boolean;
}

/**
 * Unión de tipos de respuesta
 */
export type ChartResponse = BasicChartResponse | FullChartResponse | PremiumChartResponse;

/**
 * Type guard para verificar si es una respuesta completa (Free)
 */
export function isFullChartResponse(response: ChartResponse): response is FullChartResponse {
  return 'distribution' in response && 'interpretations' in response;
}

/**
 * Type guard para verificar si es una respuesta Premium
 */
export function isPremiumChartResponse(response: ChartResponse): response is PremiumChartResponse {
  return 'aiSynthesis' in response;
}

/**
 * Estado de uso del módulo de carta astral
 */
export interface UsageStatus {
  plan: 'anonymous' | 'free' | 'premium';
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string | null;
  canGenerate: boolean;
}

/**
 * Respuesta de historial de cartas (solo Premium)
 */
export interface ChartHistoryResponse {
  charts: SavedChart[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Error de API
 */
export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: {
    usageType?: string;
    period?: string;
    used?: number;
    limit?: number;
    remaining?: number;
  };
}
