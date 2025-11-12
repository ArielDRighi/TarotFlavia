import { ApiProperty } from '@nestjs/swagger';
import { RecentReadingDto } from './recent-reading.dto';
import { RecentUserDto } from './recent-user.dto';

export class PlanDistributionDto {
  @ApiProperty({
    example: 150,
    description: 'Número de usuarios con plan FREE',
  })
  freeUsers: number;

  @ApiProperty({
    example: 50,
    description: 'Número de usuarios con plan PREMIUM',
  })
  premiumUsers: number;

  @ApiProperty({
    example: 75.0,
    description: 'Porcentaje de usuarios FREE',
  })
  freePercentage: number;

  @ApiProperty({
    example: 25.0,
    description: 'Porcentaje de usuarios PREMIUM',
  })
  premiumPercentage: number;

  @ApiProperty({
    example: 33.33,
    description: 'Tasa de conversión de FREE a PREMIUM (%)',
  })
  conversionRate: number;
}

export class AIMetricsDto {
  @ApiProperty({
    example: 500,
    description: 'Total de interpretaciones generadas',
  })
  totalInterpretations: number;

  @ApiProperty({
    example: [
      { provider: 'groq', count: 300 },
      { provider: 'deepseek', count: 150 },
      { provider: 'openai', count: 50 },
    ],
    description: 'Uso de IA por proveedor',
  })
  usageByProvider: Array<{ provider: string; count: number }>;
}

export class DashboardMetricsDto {
  @ApiProperty({
    description: 'Métricas generales de usuarios',
  })
  userMetrics: {
    totalUsers: number;
    activeUsersLast7Days: number;
    activeUsersLast30Days: number;
  };

  @ApiProperty({
    description: 'Métricas generales de lecturas',
  })
  readingMetrics: {
    totalReadings: number;
    readingsLast7Days: number;
    readingsLast30Days: number;
  };

  @ApiProperty({
    description: 'Distribución de planes',
    type: PlanDistributionDto,
  })
  planDistribution: PlanDistributionDto;

  @ApiProperty({
    description: 'Lecturas recientes (últimas 10)',
    type: [RecentReadingDto],
  })
  recentReadings: RecentReadingDto[];

  @ApiProperty({
    description: 'Usuarios recientes (últimos 10)',
    type: [RecentUserDto],
  })
  recentUsers: RecentUserDto[];

  @ApiProperty({
    description: 'Métricas de IA',
    type: AIMetricsDto,
  })
  aiMetrics: AIMetricsDto;
}
