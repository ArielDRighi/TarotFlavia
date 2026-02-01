import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  RitualCategory,
  RitualDifficulty,
  LunarPhase,
  MaterialType,
} from '../../domain/enums';

export class CreateRitualMaterialDto {
  @ApiProperty({ example: 'Vela blanca' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({ example: 'Preferiblemente de cera natural' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: MaterialType, default: MaterialType.REQUIRED })
  @IsEnum(MaterialType)
  type: MaterialType;

  @ApiPropertyOptional({ example: 'Vela plateada' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  alternative?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 'unidad' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  unit?: string;
}

export class CreateRitualStepDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  stepNumber: number;

  @ApiProperty({ example: 'Preparar el espacio' })
  @IsString()
  @Length(1, 150)
  title: string;

  @ApiProperty({ example: 'Limpia y ordena tu espacio sagrado...' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 180, description: 'Duración en segundos' })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @ApiPropertyOptional({ example: '/images/rituals/steps/step1.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'Que la luz guíe mi camino...' })
  @IsOptional()
  @IsString()
  mantra?: string;

  @ApiPropertyOptional({ example: 'Imagina una luz dorada...' })
  @IsOptional()
  @IsString()
  visualization?: string;
}

export class CreateRitualDto {
  @ApiProperty({ example: 'ritual-luna-nueva' })
  @IsString()
  @Length(3, 100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones',
  })
  slug: string;

  @ApiProperty({ example: 'Ritual de Luna Nueva' })
  @IsString()
  @Length(3, 150)
  title: string;

  @ApiProperty({ example: 'Ceremonia para establecer intenciones...' })
  @IsString()
  description: string;

  @ApiProperty({ enum: RitualCategory, example: RitualCategory.LUNAR })
  @IsEnum(RitualCategory)
  category: RitualCategory;

  @ApiProperty({ enum: RitualDifficulty, example: RitualDifficulty.BEGINNER })
  @IsEnum(RitualDifficulty)
  difficulty: RitualDifficulty;

  @ApiProperty({ example: 30, description: 'Duración total en minutos' })
  @IsInt()
  @Min(5)
  @Max(180)
  durationMinutes: number;

  @ApiPropertyOptional({ enum: LunarPhase })
  @IsOptional()
  @IsEnum(LunarPhase)
  bestLunarPhase?: LunarPhase;

  @ApiPropertyOptional({ type: [String], enum: LunarPhase, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(LunarPhase, { each: true })
  bestLunarPhases?: LunarPhase[];

  @ApiPropertyOptional({ example: 'Noche, idealmente con luna visible' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  bestTimeOfDay?: string;

  @ApiPropertyOptional({ example: 'La luna nueva representa el inicio...' })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({ example: 'Busca un espacio tranquilo...' })
  @IsOptional()
  @IsString()
  preparation?: string;

  @ApiPropertyOptional({
    example: 'Agradece a la luna y guarda tus intenciones...',
  })
  @IsOptional()
  @IsString()
  closing?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Escribe en presente', 'Sé específico'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tips?: string[];

  @ApiProperty({ example: '/images/rituals/luna-nueva.jpg' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ example: '/images/rituals/thumbnails/luna-nueva.jpg' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: '/audio/rituals/luna-nueva.mp3' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ type: [CreateRitualMaterialDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRitualMaterialDto)
  materials: CreateRitualMaterialDto[];

  @ApiProperty({ type: [CreateRitualStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRitualStepDto)
  steps: CreateRitualStepDto[];
}
