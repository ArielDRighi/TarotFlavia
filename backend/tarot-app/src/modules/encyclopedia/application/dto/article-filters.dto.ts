import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ArticleCategory } from '../../enums/article.enums';

/**
 * DTO de filtros para el listado de artículos de la enciclopedia
 */
export class ArticleFiltersDto {
  @ApiPropertyOptional({
    enum: ArticleCategory,
    description: 'Filtrar por categoría',
  })
  @IsOptional()
  @IsEnum(ArticleCategory)
  category?: ArticleCategory;

  @ApiPropertyOptional({
    description: 'Término de búsqueda (mínimo 2 caracteres)',
    example: 'mercurio',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  search?: string;
}
