import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsIn,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserPlan, UserRole } from '../entities/user.entity';

export class UserQueryDto {
  @ApiPropertyOptional({
    description: 'Texto de búsqueda (busca en email y nombre)',
    example: 'juan',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por rol',
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Filtrar por plan',
    enum: UserPlan,
  })
  @IsOptional()
  @IsEnum(UserPlan)
  plan?: UserPlan;

  @ApiPropertyOptional({
    description: 'Filtrar usuarios baneados (true) o no baneados (false)',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  banned?: boolean;

  @ApiPropertyOptional({
    description: 'Ordenar por campo',
    enum: ['createdAt', 'lastLogin', 'email', 'name'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'lastLogin', 'email', 'name'])
  sortBy?: 'createdAt' | 'lastLogin' | 'email' | 'name';

  @ApiPropertyOptional({
    description: 'Dirección de ordenamiento',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
