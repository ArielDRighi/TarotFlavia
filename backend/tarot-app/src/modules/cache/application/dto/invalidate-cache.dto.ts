import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class InvalidateCacheDto {
  @ApiProperty({
    required: false,
    description: 'Pattern to match cache keys for invalidation',
    example: 'spread:*',
  })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiProperty({
    required: false,
    description: 'Tarotista ID to invalidate all cache entries',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  tarotistaId?: number;
}
