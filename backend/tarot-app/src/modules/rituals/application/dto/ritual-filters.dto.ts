import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  RitualCategory,
  RitualDifficulty,
  LunarPhase,
} from '../../domain/enums';

/**
 * DTO para filtrar rituales
 */
export class RitualFiltersDto {
  @ApiPropertyOptional({ enum: RitualCategory })
  @IsOptional()
  @IsEnum(RitualCategory)
  category?: RitualCategory;

  @ApiPropertyOptional({ enum: RitualDifficulty })
  @IsOptional()
  @IsEnum(RitualDifficulty)
  difficulty?: RitualDifficulty;

  @ApiPropertyOptional({ enum: LunarPhase })
  @IsOptional()
  @IsEnum(LunarPhase)
  lunarPhase?: LunarPhase;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
