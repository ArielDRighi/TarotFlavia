import { ApiProperty } from '@nestjs/swagger';
import {
  RitualCategory,
  RitualDifficulty,
  LunarPhase,
  MaterialType,
} from '../../domain/enums';

/**
 * DTO con resumen de un ritual
 */
export class RitualSummaryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: RitualCategory })
  category: RitualCategory;

  @ApiProperty({ enum: RitualDifficulty })
  difficulty: RitualDifficulty;

  @ApiProperty()
  durationMinutes: number;

  @ApiProperty({ enum: LunarPhase, nullable: true })
  bestLunarPhase: LunarPhase | null;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  materialsCount: number;

  @ApiProperty()
  stepsCount: number;
}

/**
 * DTO para material de ritual
 */
export class RitualMaterialDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ enum: MaterialType })
  type: MaterialType;

  @ApiProperty({ nullable: true })
  alternative: string | null;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ nullable: true })
  unit: string | null;
}

/**
 * DTO para paso de ritual
 */
export class RitualStepDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  stepNumber: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ nullable: true })
  durationSeconds: number | null;

  @ApiProperty({ nullable: true })
  imageUrl: string | null;

  @ApiProperty({ nullable: true })
  mantra: string | null;

  @ApiProperty({ nullable: true })
  visualization: string | null;
}

/**
 * DTO con detalle completo de un ritual
 */
export class RitualDetailDto extends RitualSummaryDto {
  @ApiProperty({ nullable: true })
  bestTimeOfDay: string | null;

  @ApiProperty({ nullable: true })
  purpose: string | null;

  @ApiProperty({ nullable: true })
  preparation: string | null;

  @ApiProperty({ nullable: true })
  closing: string | null;

  @ApiProperty({ type: [String], nullable: true })
  tips: string[] | null;

  @ApiProperty({ nullable: true })
  audioUrl: string | null;

  @ApiProperty({ type: [RitualMaterialDto] })
  materials: RitualMaterialDto[];

  @ApiProperty({ type: [RitualStepDto] })
  steps: RitualStepDto[];

  @ApiProperty()
  completionCount: number;
}
