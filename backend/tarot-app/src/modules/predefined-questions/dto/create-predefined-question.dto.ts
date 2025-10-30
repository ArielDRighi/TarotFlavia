import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePredefinedQuestionDto {
  @ApiProperty({
    description: 'ID de la categoría a la que pertenece',
    example: 1,
  })
  @IsInt()
  categoryId: number;

  @ApiProperty({
    description: 'Texto de la pregunta predefinida',
    example: '¿Cómo puedo mejorar mi relación de pareja?',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200, {
    message: 'El texto de la pregunta no puede exceder 200 caracteres',
  })
  questionText: string;

  @ApiProperty({
    description: 'Orden de visualización de la pregunta',
    example: 1,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiProperty({
    description: 'Indica si la pregunta está activa',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
