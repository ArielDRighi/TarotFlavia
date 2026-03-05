import { Controller, Get, Param, ParseEnumPipe, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EncyclopediaService } from '../../application/services/encyclopedia.service';
import { CardFiltersDto } from '../../application/dto/card-filters.dto';
import {
  CardDetailDto,
  CardNavigationResponseDto,
  CardSummaryDto,
  GlobalSearchResultDto,
} from '../../application/dto/card-response.dto';
import { Suit } from '../../enums/tarot.enums';

/**
 * Controlador REST de la Enciclopedia de Tarot
 *
 * Expone endpoints públicos (sin autenticación) para explorar las 78 cartas
 * y realizar búsquedas globales unificadas.
 * Todos los endpoints son de solo lectura — no modifican datos.
 *
 * Endpoints:
 *  GET /encyclopedia/search                  - Búsqueda global unificada (cartas + artículos)
 *  GET /encyclopedia/cards                   - Listar cartas con filtros
 *  GET /encyclopedia/cards/major             - Arcanos Mayores
 *  GET /encyclopedia/cards/suit/:suit        - Cartas por palo
 *  GET /encyclopedia/cards/search            - Búsqueda por nombre
 *  GET /encyclopedia/cards/:slug             - Detalle de carta
 *  GET /encyclopedia/cards/:slug/related     - Cartas relacionadas
 *  GET /encyclopedia/cards/:slug/navigation  - Navegación anterior/siguiente
 */
@ApiTags('Enciclopedia')
@Controller('encyclopedia')
export class EncyclopediaController {
  constructor(private readonly encyclopediaService: EncyclopediaService) {}

  // ── GET /encyclopedia/search ─────────────────────────────────────────────

  /**
   * Búsqueda global unificada: busca en cartas del Tarot y artículos simultáneamente.
   * Requiere mínimo 2 caracteres; retorna arrays vacíos si no se cumple.
   * Ruta estática — debe declararse ANTES de cualquier ruta con parámetro.
   */
  @Get('search')
  @ApiOperation({
    summary: 'Búsqueda global unificada en cartas y artículos',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Término de búsqueda (mínimo 2 caracteres)',
    example: 'mercurio',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados combinados de cartas del Tarot y artículos',
    type: GlobalSearchResultDto,
  })
  async globalSearch(
    @Query('q') query: string | string[] | undefined,
  ): Promise<GlobalSearchResultDto> {
    const rawQuery = Array.isArray(query) ? query[0] : query;
    const normalizedQuery = rawQuery?.trim();
    if (!normalizedQuery || normalizedQuery.length < 2) {
      return { tarotCards: [], articles: [], total: 0 };
    }
    return this.encyclopediaService.globalSearch(normalizedQuery);
  }

  // ── GET /encyclopedia/cards ──────────────────────────────────────────────

  /**
   * Lista todas las cartas con filtros opcionales.
   * Soporta filtros por arcanaType, suit, element, search y courtOnly.
   */
  @Get('cards')
  @ApiOperation({ summary: 'Listar cartas del Tarot con filtros opcionales' })
  @ApiResponse({
    status: 200,
    description: 'Listado de cartas según los filtros',
    type: [CardSummaryDto],
  })
  async getCards(@Query() filters: CardFiltersDto): Promise<CardSummaryDto[]> {
    return this.encyclopediaService.findAll(filters);
  }

  // ── GET /encyclopedia/cards/major ────────────────────────────────────────

  /**
   * Retorna los 22 Arcanos Mayores en orden numérico (0-XXI).
   * Ruta estática — debe declararse ANTES de `:slug` para evitar ambigüedad.
   */
  @Get('cards/major')
  @ApiOperation({ summary: 'Obtener los 22 Arcanos Mayores' })
  @ApiResponse({
    status: 200,
    description: 'Los 22 Arcanos Mayores en orden numérico',
    type: [CardSummaryDto],
  })
  async getMajorArcana(): Promise<CardSummaryDto[]> {
    return this.encyclopediaService.getMajorArcana();
  }

  // ── GET /encyclopedia/cards/suit/:suit ───────────────────────────────────

  /**
   * Retorna las 14 cartas de un palo (Bastos, Copas, Espadas, Oros).
   */
  @Get('cards/suit/:suit')
  @ApiOperation({ summary: 'Obtener cartas de un palo específico' })
  @ApiParam({
    name: 'suit',
    enum: Suit,
    description: 'Palo del arcano menor',
  })
  @ApiResponse({
    status: 200,
    description: 'Cartas del palo indicado (14 cartas)',
    type: [CardSummaryDto],
  })
  async getBySuit(
    @Param('suit', new ParseEnumPipe(Suit)) suit: Suit,
  ): Promise<CardSummaryDto[]> {
    return this.encyclopediaService.getBySuit(suit);
  }

  // ── GET /encyclopedia/cards/search ──────────────────────────────────────

  /**
   * Busca cartas por nombre en español o inglés.
   * Requiere mínimo 2 caracteres; retorna array vacío si no se cumple.
   * Ruta estática — debe declararse ANTES de `:slug`.
   */
  @Get('cards/search')
  @ApiOperation({ summary: 'Buscar cartas por nombre' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Término de búsqueda (mínimo 2 caracteres)',
    example: 'loco',
  })
  @ApiResponse({
    status: 200,
    description: 'Cartas que coinciden con el término de búsqueda',
    type: [CardSummaryDto],
  })
  async searchCards(@Query('q') query: string): Promise<CardSummaryDto[]> {
    const normalizedQuery = query?.trim();
    if (!normalizedQuery || normalizedQuery.length < 2) {
      return [];
    }
    return this.encyclopediaService.search(normalizedQuery);
  }

  // ── GET /encyclopedia/cards/:slug ────────────────────────────────────────

  /**
   * Retorna el detalle completo de una carta por su slug.
   * Incrementa el contador de vistas de la carta.
   * @throws NotFoundException si el slug no existe
   */
  @Get('cards/:slug')
  @ApiOperation({ summary: 'Obtener detalle completo de una carta' })
  @ApiParam({
    name: 'slug',
    description: 'Slug único de la carta',
    example: 'the-fool',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle completo de la carta',
    type: CardDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Carta no encontrada',
  })
  async getCardBySlug(@Param('slug') slug: string): Promise<CardDetailDto> {
    return this.encyclopediaService.findBySlug(slug);
  }

  // ── GET /encyclopedia/cards/:slug/related ────────────────────────────────

  /**
   * Retorna las cartas relacionadas temáticamente con la carta indicada.
   * @throws NotFoundException si el slug no existe
   */
  @Get('cards/:slug/related')
  @ApiOperation({
    summary: 'Obtener cartas relacionadas temáticamente',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único de la carta',
    example: 'the-fool',
  })
  @ApiResponse({
    status: 200,
    description: 'Cartas relacionadas (puede ser array vacío)',
    type: [CardSummaryDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Carta no encontrada',
  })
  async getRelatedCards(
    @Param('slug') slug: string,
  ): Promise<CardSummaryDto[]> {
    const id = await this.encyclopediaService.findIdBySlug(slug);
    return this.encyclopediaService.getRelatedCards(id);
  }

  // ── GET /encyclopedia/cards/:slug/navigation ─────────────────────────────

  /**
   * Retorna la carta anterior y siguiente según el orden canónico del mazo.
   * @throws NotFoundException si el slug no existe
   */
  @Get('cards/:slug/navigation')
  @ApiOperation({
    summary: 'Obtener navegación anterior/siguiente en el mazo',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único de la carta',
    example: 'the-fool',
  })
  @ApiResponse({
    status: 200,
    description:
      'Navegación previa/siguiente. previous o next pueden ser null si es el primero/último.',
    type: CardNavigationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Carta no encontrada',
  })
  async getNavigation(
    @Param('slug') slug: string,
  ): Promise<CardNavigationResponseDto> {
    const id = await this.encyclopediaService.findIdBySlug(slug);
    return this.encyclopediaService.getNavigation(id);
  }
}
