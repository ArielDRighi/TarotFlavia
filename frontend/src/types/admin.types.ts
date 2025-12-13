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

export interface StatsResponseDto {
  users: UserStatsDto;
  readings: ReadingStatsDto;
  cards: CardStatsDto;
  openai: OpenAIStatsDto;
  questions: QuestionStatsDto;
}

// --- /admin/dashboard/charts ---

export interface ChartsResponseDto {
  userRegistrations: NewRegistrationDto[];
  readingsPerDay: ReadingsPerDayDto[];
  aiCostsPerDay: AICostPerDayDto[];
}

// --- Tipos derivados para UI ---

/**
 * Métrica individual procesada para las cards del dashboard
 */
export interface DashboardMetric {
  value: number;
  change?: number; // Cambio porcentual vs periodo anterior
  trend?: 'up' | 'down' | 'stable';
}

/**
 * Lectura reciente para tabla (mock temporal - backend pendiente)
 */
export interface RecentReading {
  id: number;
  userName: string;
  date: string;
  spreadType: string;
  status: 'completed' | 'pending' | 'failed';
}
