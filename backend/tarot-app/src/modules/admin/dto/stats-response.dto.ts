import { ApiProperty } from '@nestjs/swagger';

// ============= User Stats DTOs =============
export class NewRegistrationDto {
  @ApiProperty({ example: '2024-01-01', description: 'Fecha de registro' })
  date: string;

  @ApiProperty({ example: 10, description: 'Número de nuevos usuarios' })
  count: number;
}

export class UserStatsDto {
  @ApiProperty({ example: 1000, description: 'Total de usuarios registrados' })
  totalUsers: number;

  @ApiProperty({
    example: 200,
    description: 'Usuarios activos en los últimos 7 días',
  })
  activeUsersLast7Days: number;

  @ApiProperty({
    example: 350,
    description: 'Usuarios activos en los últimos 30 días',
  })
  activeUsersLast30Days: number;

  @ApiProperty({
    type: [NewRegistrationDto],
    description: 'Nuevos registros por día (últimos 30 días)',
  })
  newRegistrationsPerDay: NewRegistrationDto[];

  @ApiProperty({
    description: 'Distribución por plan',
    example: {
      freeUsers: 750,
      premiumUsers: 250,
      freePercentage: 75.0,
      premiumPercentage: 25.0,
      conversionRate: 25.0,
    },
  })
  planDistribution: {
    freeUsers: number;
    premiumUsers: number;
    freePercentage: number;
    premiumPercentage: number;
    conversionRate: number;
  };
}

// ============= Reading Stats DTOs =============
export class CategoryDistributionDto {
  @ApiProperty({ example: 1, description: 'ID de la categoría' })
  categoryId: number;

  @ApiProperty({ example: 'Amor', description: 'Nombre de la categoría' })
  categoryName: string;

  @ApiProperty({ example: 2000, description: 'Número de lecturas' })
  count: number;
}

export class SpreadDistributionDto {
  @ApiProperty({ example: 'Tres Cartas', description: 'Nombre del spread' })
  spreadName: string;

  @ApiProperty({ example: 3000, description: 'Número de lecturas' })
  count: number;
}

export class ReadingsPerDayDto {
  @ApiProperty({ example: '2024-01-01', description: 'Fecha' })
  date: string;

  @ApiProperty({ example: 50, description: 'Número de lecturas' })
  count: number;
}

export class ReadingStatsDto {
  @ApiProperty({ example: 5000, description: 'Total de lecturas realizadas' })
  totalReadings: number;

  @ApiProperty({
    example: 400,
    description: 'Lecturas en los últimos 7 días',
  })
  readingsLast7Days: number;

  @ApiProperty({
    example: 1200,
    description: 'Lecturas en los últimos 30 días',
  })
  readingsLast30Days: number;

  @ApiProperty({
    example: 5.5,
    description: 'Promedio de lecturas por usuario',
  })
  averageReadingsPerUser: number;

  @ApiProperty({
    type: [CategoryDistributionDto],
    description: 'Distribución por categoría',
  })
  categoryDistribution: CategoryDistributionDto[];

  @ApiProperty({
    type: [SpreadDistributionDto],
    description: 'Distribución por tipo de spread',
  })
  spreadDistribution: SpreadDistributionDto[];

  @ApiProperty({
    type: [ReadingsPerDayDto],
    description: 'Lecturas por día (últimos 30 días)',
  })
  readingsPerDay: ReadingsPerDayDto[];
}

// ============= Card Stats DTOs =============
export class TopCardDto {
  @ApiProperty({ example: 1, description: 'ID de la carta' })
  cardId: number;

  @ApiProperty({ example: 'El Loco', description: 'Nombre de la carta' })
  name: string;

  @ApiProperty({ example: 500, description: 'Número de veces consultada' })
  count: number;
}

export class CardCategoryDistributionDto {
  @ApiProperty({
    example: 'arcanos_mayores',
    description: 'Categoría de carta',
  })
  category: string;

  @ApiProperty({ example: 3000, description: 'Número de veces consultada' })
  count: number;
}

export class CardStatsDto {
  @ApiProperty({
    type: [TopCardDto],
    description: 'Top 10 cartas más consultadas',
  })
  topCards: TopCardDto[];

  @ApiProperty({
    type: [CardCategoryDistributionDto],
    description: 'Distribución arcanos mayores vs menores',
  })
  categoryDistribution: CardCategoryDistributionDto[];

  @ApiProperty({
    description: 'Ratio de cartas derechas vs invertidas',
    example: {
      upright: 2500,
      reversed: 2500,
      uprightPercentage: 50.0,
      reversedPercentage: 50.0,
    },
  })
  orientationRatio: {
    upright: number;
    reversed: number;
    uprightPercentage: number;
    reversedPercentage: number;
  };
}

// ============= OpenAI Stats DTOs =============
export class ProviderUsageDto {
  @ApiProperty({ example: 'groq', description: 'Nombre del proveedor' })
  provider: string;

  @ApiProperty({ example: 3000, description: 'Número de interpretaciones' })
  count: number;
}

export class AICostPerDayDto {
  @ApiProperty({ example: '2024-01-01', description: 'Fecha' })
  date: string;

  @ApiProperty({ example: 1.5, description: 'Costo en USD' })
  cost: number;
}

export class OpenAIStatsDto {
  @ApiProperty({
    example: 5000,
    description: 'Total de interpretaciones generadas',
  })
  totalInterpretations: number;

  @ApiProperty({
    example: 10000000,
    description: 'Tokens consumidos (total)',
  })
  totalTokens: number;

  @ApiProperty({
    example: 2000,
    description: 'Tokens consumidos (promedio por interpretación)',
  })
  averageTokens: number;

  @ApiProperty({
    example: 50.0,
    description: 'Costo acumulado estimado (USD)',
  })
  totalCostUsd: number;

  @ApiProperty({
    example: 1500,
    description: 'Tiempo promedio de generación (ms)',
  })
  averageDurationMs: number;

  @ApiProperty({
    example: 2.0,
    description: 'Tasa de errores (%)',
  })
  errorRate: number;

  @ApiProperty({
    example: 10.0,
    description: 'Cache hit rate (%)',
  })
  cacheHitRate: number;

  @ApiProperty({
    type: [ProviderUsageDto],
    description: 'Uso de IA por proveedor',
  })
  usageByProvider: ProviderUsageDto[];

  @ApiProperty({
    type: [AICostPerDayDto],
    description: 'Costos de OpenAI por día (últimos 30 días)',
  })
  costsPerDay: AICostPerDayDto[];
}

// ============= Question Stats DTOs =============
export class TopQuestionDto {
  @ApiProperty({ example: 1, description: 'ID de la pregunta' })
  questionId: number;

  @ApiProperty({
    example: '¿Cómo mejorar mi relación?',
    description: 'Texto de la pregunta',
  })
  question: string;

  @ApiProperty({ example: 500, description: 'Número de veces usada' })
  count: number;
}

export class QuestionStatsDto {
  @ApiProperty({
    type: [TopQuestionDto],
    description: 'Preguntas predefinidas más usadas (top 10)',
  })
  topPredefinedQuestions: TopQuestionDto[];

  @ApiProperty({
    description: 'Distribución de preguntas custom vs predefinidas',
    example: {
      predefinedCount: 1000,
      customCount: 500,
      predefinedPercentage: 66.67,
      customPercentage: 33.33,
    },
  })
  predefinedVsCustom: {
    predefinedCount: number;
    customCount: number;
    predefinedPercentage: number;
    customPercentage: number;
  };
}

// ============= Complete Stats Response =============
export class StatsResponseDto {
  @ApiProperty({ type: UserStatsDto, description: 'Estadísticas de usuarios' })
  users: UserStatsDto;

  @ApiProperty({
    type: ReadingStatsDto,
    description: 'Estadísticas de lecturas',
  })
  readings: ReadingStatsDto;

  @ApiProperty({ type: CardStatsDto, description: 'Estadísticas de cartas' })
  cards: CardStatsDto;

  @ApiProperty({ type: OpenAIStatsDto, description: 'Estadísticas de OpenAI' })
  openai: OpenAIStatsDto;

  @ApiProperty({
    type: QuestionStatsDto,
    description: 'Estadísticas de preguntas',
  })
  questions: QuestionStatsDto;
}

// ============= Charts Response =============
export class ChartsResponseDto {
  @ApiProperty({
    type: [NewRegistrationDto],
    description: 'Registros de usuarios por día (últimos 30 días)',
  })
  userRegistrations: NewRegistrationDto[];

  @ApiProperty({
    type: [ReadingsPerDayDto],
    description: 'Lecturas por día (últimos 30 días)',
  })
  readingsPerDay: ReadingsPerDayDto[];

  @ApiProperty({
    type: [AICostPerDayDto],
    description: 'Costos de OpenAI por día (últimos 30 días)',
  })
  aiCostsPerDay: AICostPerDayDto[];
}
