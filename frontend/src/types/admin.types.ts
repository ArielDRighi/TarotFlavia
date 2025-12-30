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
 * Refleja exactamente el ProviderStatisticsDto del backend
 */
export interface AIProviderStats {
  provider: 'GROQ' | 'OPENAI' | 'DEEPSEEK';
  totalCalls: number;
  successCalls: number;
  errorCalls: number;
  cachedCalls: number;
  totalTokens: number;
  totalCost: number;
  avgDuration: number;
  errorRate: number;
  cacheHitRate: number;
  fallbackRate: number;
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

// --- /admin/planes (Plan Configuration) ---

/**
 * Tipo de plan de suscripción
 * Refleja exactamente el UserPlan enum del backend
 * UPDATED: 'guest' -> 'anonymous', removed 'professional'
 */
export type PlanType = 'anonymous' | 'free' | 'premium';

/**
 * Configuración de un plan de suscripción
 * Refleja exactamente la entidad Plan del backend
 * backend/tarot-app/src/modules/plan-config/entities/plan.entity.ts
 */
export interface PlanConfig {
  id: number;
  planType: PlanType;
  name: string;
  description: string | null;
  price: number; // Precio mensual en USD (decimal)
  readingsLimit: number; // Límite de lecturas mensuales (-1 para ilimitado)
  aiQuotaMonthly: number; // Cuota mensual de solicitudes IA (-1 para ilimitado)
  allowCustomQuestions: boolean; // Permite preguntas personalizadas
  allowSharing: boolean; // Permite compartir lecturas
  allowAdvancedSpreads: boolean; // Permite tiradas avanzadas
  isActive: boolean;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

/**
 * DTO para actualizar configuración de un plan
 * Refleja exactamente UpdatePlanDto del backend (PartialType<CreatePlanDto>)
 */
export interface UpdatePlanConfigDto {
  name?: string;
  description?: string;
  price?: number;
  readingsLimit?: number;
  aiQuotaMonthly?: number;
  allowCustomQuestions?: boolean;
  allowSharing?: boolean;
  allowAdvancedSpreads?: boolean;
}
