import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsHexColor,
  IsInt,
  Min,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Amor y Relaciones',
    description: 'Nombre de la categoría',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'amor-relaciones',
    description: 'Slug único para URLs (solo minúsculas, números y guiones)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug debe contener solo minúsculas, números y guiones',
  })
  @MaxLength(100)
  slug: string;

  @ApiProperty({
    example: 'Consultas sobre amor, relaciones de pareja y vínculos afectivos',
    description: 'Descripción de la categoría',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({
    example: '❤️',
    description: 'Icono o emoji representativo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  icon: string;

  @ApiProperty({
    example: '#FF6B9D',
    description: 'Color hexadecimal (formato #RRGGBB)',
  })
  @IsHexColor()
  color: string;

  @ApiProperty({
    example: 1,
    description: 'Orden de visualización (menor número = mayor prioridad)',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
