import { ApiProperty } from '@nestjs/swagger';
import { AIProvider } from '../../entities/ai-usage-log.entity';

export class ProviderStatisticsDto {
  @ApiProperty({
    enum: AIProvider,
    example: AIProvider.GROQ,
    description: 'AI provider type',
  })
  provider: AIProvider;

  @ApiProperty({ example: 150, description: 'Total number of calls' })
  totalCalls: number;

  @ApiProperty({ example: 145, description: 'Number of successful calls' })
  successCalls: number;

  @ApiProperty({ example: 3, description: 'Number of failed calls' })
  errorCalls: number;

  @ApiProperty({ example: 2, description: 'Number of cached responses' })
  cachedCalls: number;

  @ApiProperty({ example: 450000, description: 'Total tokens consumed' })
  totalTokens: number;

  @ApiProperty({
    example: 0,
    description: 'Total cost in USD',
    type: Number,
  })
  totalCost: number;

  @ApiProperty({
    example: 5000,
    description: 'Average response time in milliseconds',
  })
  avgDuration: number;

  @ApiProperty({
    example: 2.0,
    description: 'Error rate percentage',
    type: Number,
  })
  errorRate: number;

  @ApiProperty({
    example: 1.33,
    description: 'Cache hit rate percentage',
    type: Number,
  })
  cacheHitRate: number;

  @ApiProperty({
    example: 0.67,
    description: 'Fallback usage rate percentage',
    type: Number,
  })
  fallbackRate: number;
}

export class AIUsageStatsDto {
  @ApiProperty({
    type: [ProviderStatisticsDto],
    description: 'Statistics per provider',
  })
  statistics: ProviderStatisticsDto[];

  @ApiProperty({
    example: 12500,
    description: 'Groq calls today (14,400 daily limit)',
  })
  groqCallsToday: number;

  @ApiProperty({
    example: false,
    description: 'Whether Groq rate limit alert should trigger',
  })
  groqRateLimitAlert: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether high error rate alert should trigger',
  })
  highErrorRateAlert: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether high fallback rate alert should trigger',
  })
  highFallbackRateAlert: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether high daily cost alert should trigger',
  })
  highDailyCostAlert: boolean;
}
