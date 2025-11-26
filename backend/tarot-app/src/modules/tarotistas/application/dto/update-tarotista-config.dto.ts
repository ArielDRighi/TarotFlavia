import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsObject,
  MinLength,
} from 'class-validator';

export class UpdateTarotistaConfigDto {
  @ApiProperty({
    description: 'System prompt personalizado para la IA',
    example: 'Eres Luna, una tarotista especializada en lecturas de amor...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(20)
  systemPrompt?: string;

  @ApiProperty({
    description: 'Temperatura para la generación de respuestas (0-1)',
    example: 0.7,
    minimum: 0,
    maximum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;

  @ApiProperty({
    description: 'Máximo de tokens en las respuestas',
    example: 500,
    minimum: 100,
    maximum: 2000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(2000)
  maxTokens?: number;

  @ApiProperty({
    description: 'Top P para nucleus sampling (0-1)',
    example: 0.9,
    minimum: 0,
    maximum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  topP?: number;

  @ApiProperty({
    description: 'Configuración de estilo personalizada',
    example: { tono: 'empático', longitud: 'detallada' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  styleConfig?: Record<string, any>;
}
