import { ApiProperty } from '@nestjs/swagger';

export class CacheStatsDto {
  @ApiProperty({ description: 'Total cache entries', example: 150 })
  total: number;

  @ApiProperty({ description: 'Expired cache entries', example: 10 })
  expired: number;

  @ApiProperty({ description: 'Cache hit count', example: 500 })
  hits: number;

  @ApiProperty({ description: 'Cache miss count', example: 50 })
  misses: number;

  // TODO: TASK-ARCH-001 - Implement proper miss tracking before adding hitRate
  // Currently misses is hardcoded to 0 in repository, making hit rate calculation
  // inaccurate. See PR feedback: https://github.com/ArielDRighi/TarotFlavia/pull/XXX
  // Uncomment when miss tracking is implemented:
  // @ApiProperty({ description: 'Hit rate percentage', example: 90.91 })
  // hitRate: number;
}
