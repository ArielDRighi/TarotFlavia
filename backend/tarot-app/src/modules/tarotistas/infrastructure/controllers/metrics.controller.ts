import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TarotistasOrchestratorService } from '../../application/services/tarotistas-orchestrator.service';
import {
  MetricsQueryDto,
  TarotistaMetricsDto,
  PlatformMetricsDto,
  PlatformMetricsQueryDto,
} from '../../application/dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { AdminGuard } from '../../../auth/infrastructure/guards/admin.guard';

@ApiTags('Tarotistas - Metrics')
@Controller('tarotistas/metrics')
export class MetricsController {
  constructor(private readonly orchestrator: TarotistasOrchestratorService) {}

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
    return this.orchestrator.getTarotistaMetrics(query);
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
    return this.orchestrator.getPlatformMetrics(query);
  }
}
