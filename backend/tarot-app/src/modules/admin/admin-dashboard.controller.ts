import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AdminDashboardService } from './admin-dashboard.service';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';
import { StatsResponseDto, ChartsResponseDto } from './dto/stats-response.dto';
import { ADMIN_DASHBOARD_CACHE_TTL } from './constants/cache.constants';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('metrics')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('admin_dashboard_metrics')
  @CacheTTL(ADMIN_DASHBOARD_CACHE_TTL)
  @ApiOperation({
    summary: 'Get dashboard metrics (deprecated)',
    description:
      'Returns basic metrics. Use /stats for comprehensive statistics. This endpoint will be removed in version 2.0. Cached for 15 minutes.',
    deprecated: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard metrics retrieved successfully',
    type: DashboardMetricsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  async getMetrics(): Promise<DashboardMetricsDto> {
    return this.adminDashboardService.getMetrics();
  }

  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('admin_dashboard_stats')
  @CacheTTL(ADMIN_DASHBOARD_CACHE_TTL)
  @ApiOperation({
    summary: 'Get comprehensive dashboard statistics',
    description:
      'Returns detailed metrics for users, readings, cards, AI usage, and questions. Cached for 15 minutes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: StatsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  async getStats(): Promise<StatsResponseDto> {
    return this.adminDashboardService.getStats();
  }

  @Get('charts')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('admin_dashboard_charts')
  @CacheTTL(ADMIN_DASHBOARD_CACHE_TTL)
  @ApiOperation({
    summary: 'Get chart data for last 30 days',
    description:
      'Returns data for user registrations, readings, and AI costs over the last 30 days. Cached for 15 minutes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Chart data retrieved successfully',
    type: ChartsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  async getCharts(): Promise<ChartsResponseDto> {
    return this.adminDashboardService.getCharts();
  }
}
