/**
 * Admin Dashboard Types
 *
 * Estos tipos reflejan exactamente los DTOs del backend en
 * backend/tarot-app/src/modules/admin/dto/stats-response.dto.ts
 */

// --- /admin/dashboard/stats ---

export interface PlanDistributionDto {
  plan: string;
  count: number;
  percentage: number;
  [key: string]: string | number; // Index signature para compatibilidad con recharts
}

export interface NewRegistrationDto {
  date: string; // ISO date
  count: number;
}

export interface UserStatsDto {
  totalUsers: number;
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  newRegistrationsPerDay: NewRegistrationDto[];
  planDistribution: PlanDistributionDto[];
}

export interface ReadingsPerDayDto {
  date: string; // ISO date
  count: number;
}

export interface ReadingStatsDto {
  totalReadings: number;
  readingsLast7Days: number;
  readingsLast30Days: number;
  readingsPerDay: ReadingsPerDayDto[];
}

export interface CardStatsDto {
  totalCards: number;
  mostDrawnCard: string;
  leastDrawnCard: string;
}

export interface AICostPerDayDto {
  date: string; // ISO date
  cost: number;
}

export interface OpenAIStatsDto {
  totalPrompts: number;
  totalCost: number;
  aiCostsPerDay: AICostPerDayDto[];
}

export interface QuestionStatsDto {
  totalQuestions: number;
  mostCommonQuestion: string;
}

/**
 * DTO de lectura reciente desde el backend
 */
export interface RecentReadingDto {
  id: number;
  userEmail: string;
  userName: string;
  spreadType: string | null;
  category: string | null;
  question: string | null;
  status: string;
  createdAt: string;
}

export interface StatsResponseDto {
  users: UserStatsDto;
  readings: ReadingStatsDto;
  cards: CardStatsDto;
  openai: OpenAIStatsDto;
  questions: QuestionStatsDto;
  recentReadings: RecentReadingDto[]; // Agregar lecturas recientes del backend
}

// --- /admin/dashboard/charts ---

export interface ChartsResponseDto {
  userRegistrations: NewRegistrationDto[];
  readingsPerDay: ReadingsPerDayDto[];
  aiCostsPerDay: AICostPerDayDto[];
}

// --- Tipos derivados para UI ---

// --- /admin/ai-usage ---

/**
 * Estadísticas de un proveedor de IA
 */
export interface AIProviderStats {
  provider: 'GROQ' | 'OPENAI' | 'DEEPSEEK';
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  errorRate: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  averageLatency: number;
  totalCost: number;
}

/**
 * Estadísticas de uso de IA con alertas
 */
export interface AIUsageStats {
  statistics: AIProviderStats[];
  groqCallsToday: number;
  groqRateLimitAlert: boolean;
  highErrorRateAlert: boolean;
  highFallbackRateAlert: boolean;
  highDailyCostAlert: boolean;
}

/**
 * Métrica individual procesada para las cards del dashboard
 */
export interface DashboardMetric {
  value: number;
  change?: number; // Cambio porcentual vs periodo anterior
  trend?: 'up' | 'down' | 'stable';
}
