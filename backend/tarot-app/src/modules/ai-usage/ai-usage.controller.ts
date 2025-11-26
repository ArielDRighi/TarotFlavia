import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/infrastructure/guards/admin.guard';
import { AIUsageService } from './ai-usage.service';
import { AIUsageStatsDto } from './dto/ai-usage-stats.dto';
import { AIProvider } from './entities/ai-usage-log.entity';

@ApiTags('Admin - AI Usage')
@ApiBearerAuth('JWT-auth')
@Controller('admin/ai-usage')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AIUsageController {
  constructor(private readonly aiUsageService: AIUsageService) {}

  @Get()
  @ApiOperation({
    summary: 'Get AI usage statistics',
    description:
      'Returns comprehensive statistics of AI usage across all providers including costs, tokens, performance metrics, and alerts',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (ISO 8601 format)',
    example: '2025-11-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (ISO 8601 format)',
    example: '2025-11-30T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: 'AI usage statistics retrieved successfully',
    type: AIUsageStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<AIUsageStatsDto> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const statistics = await this.aiUsageService.getStatistics(start, end);

    // Get today's Groq calls for rate limit tracking
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const groqStats = statistics.find((s) => s.provider === AIProvider.GROQ);
    const groqCallsToday = groqStats?.totalCalls || 0;

    return {
      statistics,
      groqCallsToday,
      groqRateLimitAlert:
        await this.aiUsageService.shouldAlert('groqRateLimit'),
      highErrorRateAlert:
        await this.aiUsageService.shouldAlert('highErrorRate'),
      highFallbackRateAlert:
        await this.aiUsageService.shouldAlert('highFallbackRate'),
      highDailyCostAlert:
        await this.aiUsageService.shouldAlert('highDailyCost'),
    };
  }
}
