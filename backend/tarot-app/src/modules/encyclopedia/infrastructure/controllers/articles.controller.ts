import { Controller, Get, Param, ParseEnumPipe, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ArticlesService } from '../../application/services/articles.service';
import { ArticleFiltersDto } from '../../application/dto/article-filters.dto';
import {
  ArticleDetailDto,
  ArticleSnippetDto,
  ArticleSummaryDto,
} from '../../application/dto/article-response.dto';
import { ArticleCategory } from '../../enums/article.enums';

/** Label en español para cada categoría del enum ArticleCategory */
const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  [ArticleCategory.ZODIAC_SIGN]: 'Signos del Zodíaco',
  [ArticleCategory.PLANET]: 'Planetas',
  [ArticleCategory.ASTROLOGICAL_HOUSE]: 'Casas Astrológicas',
  [ArticleCategory.ELEMENT]: 'Elementos',
  [ArticleCategory.MODALITY]: 'Modalidades',
  [ArticleCategory.GUIDE_NUMEROLOGY]: 'Guía de Numerología',
  [ArticleCategory.GUIDE_PENDULUM]: 'Guía de Péndulo',
  [ArticleCategory.GUIDE_BIRTH_CHART]: 'Guía de Carta Natal',
  [ArticleCategory.GUIDE_RITUAL]: 'Guía de Rituales',
  [ArticleCategory.GUIDE_HOROSCOPE]: 'Guía de Horóscopo',
  [ArticleCategory.GUIDE_CHINESE]: 'Astrología China',
};

/** DTO que representa una categoría de artículo con su label en español */
export class CategoryItemDto {
  @ApiProperty({
    enum: ArticleCategory,
    description: 'Valor interno de la categoría',
    example: ArticleCategory.ZODIAC_SIGN,
  })
  category: ArticleCategory;

  @ApiProperty({
    description: 'Nombre legible de la categoría en español',
    example: 'Signos del Zodíaco',
  })
  label: string;
}

/**
 * Controlador REST de Artículos de la Enciclopedia Mística
 *
 * Expone endpoints públicos (sin autenticación) para explorar los artículos.
 * Todos los endpoints son de solo lectura — no modifican datos.
 *
 * Endpoints:
 *  GET /encyclopedia/articles                    - Listar artículos con filtros
 *  GET /encyclopedia/articles/categories         - Listar categorías disponibles
 *  GET /encyclopedia/articles/snippet/:slug      - Snippet del artículo (widget)
 *  GET /encyclopedia/articles/category/:category - Artículos de una categoría
 *  GET /encyclopedia/articles/:slug              - Detalle completo del artículo
 */
@ApiTags('Enciclopedia - Artículos')
@Controller('encyclopedia/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // ── GET /encyclopedia/articles ───────────────────────────────────────────

  /**
   * Lista artículos con filtros opcionales.
   * - Sin filtros: retorna array vacío
   * - Con `search`: prioriza búsqueda por texto (ignora `category`)
   * - Con solo `category`: filtra por categoría
   */
  @Get()
  @ApiOperation({
    summary: 'Listar artículos de la enciclopedia con filtros opcionales',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de artículos según los filtros',
    type: [ArticleSummaryDto],
  })
  async getArticles(
    @Query() filters: ArticleFiltersDto,
  ): Promise<ArticleSummaryDto[]> {
    if (filters.search) {
      return this.articlesService.search(filters.search);
    }
    if (filters.category) {
      return this.articlesService.findByCategory(filters.category);
    }
    return [];
  }

  // ── GET /encyclopedia/articles/categories ────────────────────────────────

  /**
   * Retorna la lista de categorías disponibles con su label en español.
   * Ruta estática — debe declararse ANTES de `:slug` para evitar ambigüedad.
   */
  @Get('categories')
  @ApiOperation({ summary: 'Listar categorías de artículos disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías con su label en español',
    type: [CategoryItemDto],
  })
  getCategories(): CategoryItemDto[] {
    return Object.values(ArticleCategory).map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
    }));
  }

  // ── GET /encyclopedia/articles/snippet/:slug ─────────────────────────────

  /**
   * Retorna el snippet (resumen mínimo) de un artículo.
   * No incluye el campo `content`. Pensado para widgets "Ver más".
   * Ruta estática con parámetro — debe declararse ANTES de `:slug`.
   * @throws NotFoundException si el slug no existe
   */
  @Get('snippet/:slug')
  @ApiOperation({ summary: 'Obtener snippet de un artículo para el widget' })
  @ApiParam({
    name: 'slug',
    description: 'Slug único del artículo',
    example: 'aries',
  })
  @ApiResponse({
    status: 200,
    description: 'Snippet del artículo (sin campo content)',
    type: ArticleSnippetDto,
  })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  async getSnippet(@Param('slug') slug: string): Promise<ArticleSnippetDto> {
    return this.articlesService.getSnippetBySlug(slug);
  }

  // ── GET /encyclopedia/articles/category/:category ────────────────────────

  /**
   * Retorna todos los artículos de una categoría específica.
   * Ruta con parámetro enum — debe declararse ANTES de `:slug`.
   */
  @Get('category/:category')
  @ApiOperation({ summary: 'Obtener artículos de una categoría específica' })
  @ApiParam({
    name: 'category',
    enum: ArticleCategory,
    description: 'Categoría del artículo',
  })
  @ApiResponse({
    status: 200,
    description: 'Artículos de la categoría indicada',
    type: [ArticleSummaryDto],
  })
  async getByCategory(
    @Param('category', new ParseEnumPipe(ArticleCategory))
    category: ArticleCategory,
  ): Promise<ArticleSummaryDto[]> {
    return this.articlesService.findByCategory(category);
  }

  // ── GET /encyclopedia/articles/:slug ─────────────────────────────────────

  /**
   * Retorna el detalle completo de un artículo por su slug.
   * Incluye el campo `content` (Markdown) y las relaciones resueltas.
   * @throws NotFoundException si el slug no existe
   */
  @Get(':slug')
  @ApiOperation({ summary: 'Obtener detalle completo de un artículo' })
  @ApiParam({
    name: 'slug',
    description: 'Slug único del artículo',
    example: 'aries',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle completo del artículo con content en Markdown',
    type: ArticleDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  async getArticle(@Param('slug') slug: string): Promise<ArticleDetailDto> {
    return this.articlesService.findBySlug(slug);
  }
}
