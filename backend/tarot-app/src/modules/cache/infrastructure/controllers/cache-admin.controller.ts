import {
  Controller,
  Delete,
  Get,
  Post,
  Param,
  Query,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { InterpretationCacheService } from '../../application/services/interpretation-cache.service';
import { CacheAnalyticsService } from '../../application/services/cache-analytics.service';
import { CacheWarmingService } from '../../application/services/cache-warming.service';
import {
  CacheAnalyticsDto,
  CacheWarmingStatusDto,
  TopCachedCombinationDto,
  HistoricalCacheMetricDto,
} from '../../application/dto/cache-analytics.dto';

@ApiTags('Admin - Cache')
@Controller('admin/cache')
export class CacheAdminController {
  constructor(
    private readonly cacheService: InterpretationCacheService,
    private readonly analyticsService: CacheAnalyticsService,
    private readonly warmingService: CacheWarmingService,
  ) {}

  @Delete('tarotistas/:id')
  @ApiOperation({ summary: 'Invalidate cache for a specific tarotista' })
  @ApiParam({ name: 'id', type: 'number', description: 'Tarotista ID' })
  @ApiResponse({
    status: 200,
    description: 'Cache invalidated successfully',
  })
  async invalidateTarotistaCache(
    @Param('id', ParseIntPipe) tarotistaId: number,
  ): Promise<{
    deletedCount: number;
    message: string;
    timestamp: Date;
    reason: string;
  }> {
    const deletedCount =
      await this.cacheService.invalidateTarotistaCache(tarotistaId);

    return {
      deletedCount,
      message: `Cache invalidated for tarotista ${tarotistaId}`,
      timestamp: new Date(),
      reason: 'manual-invalidation',
    };
  }

  @Delete('tarotistas/:id/meanings')
  @ApiOperation({
    summary: 'Invalidate cache for specific card meanings',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'Tarotista ID' })
  @ApiResponse({
    status: 200,
    description: 'Cache invalidated successfully',
  })
  async invalidateMeaningsCache(
    @Param('id', ParseIntPipe) tarotistaId: number,
    @Query('cardIds') cardIdsString: string,
  ): Promise<{
    deletedCount: number;
    message: string;
    timestamp: Date;
  }> {
    if (!cardIdsString) {
      throw new BadRequestException('cardIds query parameter is required');
    }

    const cardIds = cardIdsString.split(',').map((id) => {
      const parsed = parseInt(id.trim(), 10);
      if (isNaN(parsed)) {
        throw new BadRequestException(`Invalid card ID format: ${id}`);
      }
      return parsed;
    });

    const deletedCount =
      await this.cacheService.invalidateTarotistaMeaningsCache(
        tarotistaId,
        cardIds,
      );

    return {
      deletedCount,
      message: `Cache invalidated for tarotista ${tarotistaId}, cards: ${cardIdsString}`,
      timestamp: new Date(),
    };
  }

  @Delete('global')
  @ApiOperation({ summary: 'Clear all cache entries (emergency)' })
  @ApiResponse({
    status: 200,
    description: 'All cache cleared successfully',
  })
  async clearGlobalCache(): Promise<{
    message: string;
    timestamp: Date;
  }> {
    await this.cacheService.clearAllCaches();

    return {
      message: 'All cache cleared successfully',
      timestamp: new Date(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get cache statistics and metrics' })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics retrieved successfully',
  })
  async getCacheStats(): Promise<{
    total: number;
    expired: number;
    avgHits: number;
    invalidations: {
      total: number;
      byTarotista: number;
      byMeanings: number;
    };
  }> {
    const stats = await this.cacheService.getCacheStats();
    const invalidations = await this.cacheService.getInvalidationMetrics();

    return {
      ...stats,
      invalidations,
    };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get comprehensive cache analytics' })
  @ApiQuery({
    name: 'windowHours',
    required: false,
    description: 'Time window in hours for analytics (default: 24)',
    example: 24,
  })
  @ApiResponse({
    status: 200,
    description: 'Cache analytics retrieved successfully',
    type: CacheAnalyticsDto,
  })
  async getCacheAnalytics(
    @Query('windowHours', new DefaultValuePipe(24), ParseIntPipe)
    windowHours: number,
  ): Promise<CacheAnalyticsDto> {
    return this.analyticsService.getAnalytics(windowHours);
  }

  @Get('analytics/top-combinations')
  @ApiOperation({ summary: 'Get top cached card combinations' })
  @ApiResponse({
    status: 200,
    description: 'Top combinations retrieved successfully',
    type: [TopCachedCombinationDto],
  })
  async getTopCombinations(): Promise<TopCachedCombinationDto[]> {
    return this.analyticsService.getTopCachedCombinations();
  }

  @Get('analytics/historical')
  @ApiOperation({ summary: 'Get historical cache metrics' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to retrieve (default: 7)',
    example: 7,
  })
  @ApiResponse({
    status: 200,
    description: 'Historical metrics retrieved successfully',
    type: [HistoricalCacheMetricDto],
  })
  async getHistoricalMetrics(
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ): Promise<HistoricalCacheMetricDto[]> {
    return this.analyticsService.getHistoricalMetrics(days);
  }

  @Post('warm')
  @ApiOperation({ summary: 'Start cache warming process' })
  @ApiQuery({
    name: 'topN',
    required: false,
    description: 'Number of top combinations to warm (default: 100)',
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Cache warming started successfully',
  })
  async warmCache(
    @Query('topN', new DefaultValuePipe(100), ParseIntPipe) topN: number,
  ): Promise<{
    started: boolean;
    totalCombinations?: number;
    estimatedTimeMinutes?: number;
    message?: string;
  }> {
    return this.warmingService.warmCache(topN);
  }

  @Get('warm/status')
  @ApiOperation({ summary: 'Get cache warming status' })
  @ApiResponse({
    status: 200,
    description: 'Warming status retrieved successfully',
    type: CacheWarmingStatusDto,
  })
  getWarmingStatus(): CacheWarmingStatusDto {
    return this.warmingService.getStatus();
  }

  @Post('warm/stop')
  @ApiOperation({ summary: 'Stop cache warming process' })
  @ApiResponse({
    status: 200,
    description: 'Cache warming stopped successfully',
  })
  stopWarming(): { message: string; timestamp: Date } {
    this.warmingService.stopWarming();
    return {
      message: 'Cache warming stopped',
      timestamp: new Date(),
    };
  }
}
