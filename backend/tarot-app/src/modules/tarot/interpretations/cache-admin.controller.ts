import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InterpretationCacheService } from './interpretation-cache.service';

@ApiTags('Admin - Cache')
@Controller('admin/cache')
export class CacheAdminController {
  constructor(private readonly cacheService: InterpretationCacheService) {}

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
}
