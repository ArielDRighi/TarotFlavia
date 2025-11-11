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

  @ApiProperty({ description: 'Hit rate percentage', example: 90.91 })
  hitRate: number;
}
