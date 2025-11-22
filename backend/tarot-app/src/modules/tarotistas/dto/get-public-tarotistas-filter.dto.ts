import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPublicTarotistasFilterDto {
  @ApiProperty({
    description: 'Número de página',
    example: 1,
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Cantidad de resultados por página',
    example: 20,
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Búsqueda por nombre público o biografía',
    example: 'Luna',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filtrar por especialidad',
    example: 'Amor',
    required: false,
  })
  @IsOptional()
  @IsString()
  especialidad?: string;

  @ApiProperty({
    description: 'Campo por el cual ordenar',
    example: 'rating',
    required: false,
    enum: ['rating', 'totalLecturas', 'nombrePublico', 'createdAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['rating', 'totalLecturas', 'nombrePublico', 'createdAt'])
  orderBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Orden ascendente o descendente',
    example: 'DESC',
    required: false,
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';
}
