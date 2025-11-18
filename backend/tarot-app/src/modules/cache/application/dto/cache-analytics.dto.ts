import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para hit rate metrics
 */
export class HitRateMetricsDto {
  @ApiProperty({
    description: 'Cache hit rate percentage (0-100)',
    example: 65.5,
  })
  percentage: number;

  @ApiProperty({
    description: 'Total requests',
    example: 1000,
  })
  totalRequests: number;

  @ApiProperty({
    description: 'Requests served from cache',
    example: 655,
  })
  cacheHits: number;

  @ApiProperty({
    description: 'Requests that required AI generation',
    example: 345,
  })
  cacheMisses: number;

  @ApiProperty({
    description: 'Time window for metrics (hours)',
    example: 24,
  })
  windowHours: number;
}

/**
 * DTO para savings metrics
 */
export class SavingsMetricsDto {
  @ApiProperty({
    description: 'Estimated savings in USD (if using OpenAI)',
    example: 1.5525,
  })
  openaiSavings: number;

  @ApiProperty({
    description: 'Estimated savings in USD (if using DeepSeek)',
    example: 0.276,
  })
  deepseekSavings: number;

  @ApiProperty({
    description: 'Groq rate limit requests saved',
    example: 655,
  })
  groqRateLimitSaved: number;

  @ApiProperty({
    description: 'Percentage of daily Groq rate limit saved',
    example: 4.5,
  })
  groqRateLimitPercentage: number;
}

/**
 * DTO para response time metrics
 */
export class ResponseTimeMetricsDto {
  @ApiProperty({
    description: 'Average response time from cache (ms)',
    example: 50,
  })
  cacheAvg: number;

  @ApiProperty({
    description: 'Average response time from AI (ms)',
    example: 1500,
  })
  aiAvg: number;

  @ApiProperty({
    description: 'Performance improvement factor',
    example: 30,
    description: 'How many times faster cache is vs AI',
  })
  improvementFactor: number;
}

/**
 * DTO para top cached combinations
 */
export class TopCachedCombinationDto {
  @ApiProperty({
    description: 'Cache key hash',
    example: 'abc123...',
  })
  cacheKey: string;

  @ApiProperty({
    description: 'Number of times this combination was served from cache',
    example: 45,
  })
  hitCount: number;

  @ApiProperty({
    description: 'Card IDs in the combination',
    example: ['1', '5', '10'],
    type: [String],
  })
  cardIds: string[];

  @ApiProperty({
    description: 'Spread ID (if applicable)',
    example: 2,
    nullable: true,
  })
  spreadId: number | null;

  @ApiProperty({
    description: 'Last time this cache was used',
    example: '2025-11-17T10:30:00Z',
  })
  lastUsedAt: Date;
}

/**
 * DTO completo de analytics de caché
 */
export class CacheAnalyticsDto {
  @ApiProperty({
    type: HitRateMetricsDto,
    description: 'Cache hit rate metrics',
  })
  hitRate: HitRateMetricsDto;

  @ApiProperty({
    type: SavingsMetricsDto,
    description: 'Estimated cost/rate limit savings',
  })
  savings: SavingsMetricsDto;

  @ApiProperty({
    type: ResponseTimeMetricsDto,
    description: 'Response time comparison (cache vs AI)',
  })
  responseTime: ResponseTimeMetricsDto;

  @ApiProperty({
    type: [TopCachedCombinationDto],
    description: 'Top 10 most cached card combinations',
  })
  topCombinations: TopCachedCombinationDto[];

  @ApiProperty({
    description: 'Timestamp of analytics generation',
    example: '2025-11-17T12:00:00Z',
  })
  generatedAt: Date;
}

/**
 * DTO para warming status
 */
export class CacheWarmingStatusDto {
  @ApiProperty({
    description: 'Is warming process currently running',
    example: true,
  })
  isRunning: boolean;

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 45.5,
  })
  progress: number;

  @ApiProperty({
    description: 'Total combinations to warm',
    example: 100,
  })
  totalCombinations: number;

  @ApiProperty({
    description: 'Combinations already processed',
    example: 45,
  })
  processedCombinations: number;

  @ApiProperty({
    description: 'Successfully warmed combinations',
    example: 43,
  })
  successCount: number;

  @ApiProperty({
    description: 'Combinations that failed to warm',
    example: 2,
  })
  errorCount: number;

  @ApiProperty({
    description: 'Estimated time remaining in minutes',
    example: 5,
  })
  estimatedTimeRemainingMinutes: number;
}
