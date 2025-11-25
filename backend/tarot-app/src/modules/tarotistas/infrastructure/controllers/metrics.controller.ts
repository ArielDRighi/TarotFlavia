import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from '../services/metrics.service';
import {
  MetricsQueryDto,
  TarotistaMetricsDto,
  PlatformMetricsDto,
  PlatformMetricsQueryDto,
} from '../dto/metrics-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';

@ApiTags('Tarotistas - Metrics')
@Controller('tarotistas/metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('tarotista')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get metrics for a specific tarotista' })
  @ApiResponse({
    status: 200,
    description: 'Returns metrics for the specified tarotista',
    type: TarotistaMetricsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarotista not found',
  })
  async getTarotistaMetrics(
    @Query() query: MetricsQueryDto,
  ): Promise<TarotistaMetricsDto> {
    return this.metricsService.getTarotistaMetrics(query);
  }

  @Get('platform')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get platform-wide metrics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns aggregated platform metrics',
    type: PlatformMetricsDto,
  })
  async getPlatformMetrics(
    @Query() query: PlatformMetricsQueryDto,
  ): Promise<PlatformMetricsDto> {
    return this.metricsService.getPlatformMetrics(query);
  }
}
