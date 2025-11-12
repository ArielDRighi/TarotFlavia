import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminDashboardService } from './admin-dashboard.service';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('metrics')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('admin_dashboard_metrics')
  @CacheTTL(300000) // 5 minutos en milisegundos
  @ApiOperation({
    summary: 'Get dashboard metrics',
    description:
      'Returns comprehensive metrics including users, readings, plan distribution, and AI usage. Cached for 5 minutes.',
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
}
