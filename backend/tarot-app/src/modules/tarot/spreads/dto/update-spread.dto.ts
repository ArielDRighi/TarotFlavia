import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SpreadPositionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateSpreadDto {
  @ApiProperty({
    example: 'Tirada de Tres Cartas Actualizada',
    description: 'Nombre actualizado de la tirada',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Descripción actualizada de la tirada',
    description: 'Descripción actualizada',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 3,
    description: 'Número actualizado de cartas',
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  cardCount?: number;

  @ApiProperty({
    type: [SpreadPositionDto],
    description: 'Posiciones actualizadas',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpreadPositionDto)
  @IsOptional()
  positions?: SpreadPositionDto[];

  @ApiProperty({
    example: 'https://ejemplo.com/tiradas/tres-cartas-nuevo.jpg',
    description: 'URL actualizada de la imagen',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
