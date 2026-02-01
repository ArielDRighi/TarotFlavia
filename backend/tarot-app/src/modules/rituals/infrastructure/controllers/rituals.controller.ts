import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RitualsService } from '../../application/services/rituals.service';
import { RitualHistoryService } from '../../application/services/ritual-history.service';
import {
  LunarPhaseService,
  LunarInfo,
} from '../../application/services/lunar-phase.service';
import { RitualFiltersDto } from '../../application/dto/ritual-filters.dto';
import {
  RitualSummaryDto,
  RitualDetailDto,
} from '../../application/dto/ritual-response.dto';
import { CompleteRitualDto } from '../../application/dto/complete-ritual.dto';

/**
 * Controlador de endpoints REST para rituales
 *
 * Endpoints públicos:
 * - GET /rituals - Listar rituales con filtros
 * - GET /rituals/featured - Rituales destacados según fase lunar
 * - GET /rituals/categories - Categorías con conteo
 * - GET /rituals/lunar-info - Información de fase lunar actual
 * - GET /rituals/:slug - Detalle de ritual
 *
 * Endpoints autenticados:
 * - POST /rituals/:id/complete - Marcar ritual como completado
 * - GET /rituals/history - Historial del usuario
 * - GET /rituals/history/stats - Estadísticas del usuario
 */
@ApiTags('Rituals')
@Controller('rituals')
export class RitualsController {
  constructor(
    private readonly ritualsService: RitualsService,
    private readonly historyService: RitualHistoryService,
    private readonly lunarPhaseService: LunarPhaseService,
  ) {}

  /**
   * GET /rituals
   * Listar todos los rituales con filtros opcionales
   */
  @Get()
  @ApiOperation({ summary: 'Listar rituales con filtros' })
  @ApiResponse({ status: 200, type: [RitualSummaryDto] })
  async getRituals(
    @Query() filters: RitualFiltersDto,
  ): Promise<RitualSummaryDto[]> {
    return this.ritualsService.findAll(filters);
  }

  /**
   * GET /rituals/featured
   * Obtener rituales destacados según fase lunar
   */
  @Get('featured')
  @ApiOperation({ summary: 'Obtener rituales destacados (según fase lunar)' })
  @ApiResponse({ status: 200, type: [RitualSummaryDto] })
  async getFeatured(): Promise<RitualSummaryDto[]> {
    return this.ritualsService.getFeatured();
  }

  /**
   * GET /rituals/categories
   * Obtener categorías con conteo
   */
  @Get('categories')
  @ApiOperation({ summary: 'Obtener categorías de rituales' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          count: { type: 'number' },
        },
      },
    },
  })
  async getCategories(): Promise<{ category: string; count: number }[]> {
    return this.ritualsService.getCategories();
  }

  /**
   * GET /rituals/lunar-info
   * Obtener información de la fase lunar actual
   */
  @Get('lunar-info')
  @ApiOperation({ summary: 'Obtener información de fase lunar actual' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        phase: { type: 'string' },
        phaseName: { type: 'string' },
        illumination: { type: 'number' },
        zodiacSign: { type: 'string' },
        isGoodFor: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  getLunarInfo(): LunarInfo {
    return this.lunarPhaseService.getCurrentPhase();
  }

  /**
   * GET /rituals/history
   * Obtener historial del usuario
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mi historial de rituales' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @CurrentUser() user: { id: number },
    @Query('limit') limit?: number,
  ) {
    const history = await this.historyService.getUserHistory(
      user.id,
      limit || 20,
    );

    return history.map((h) => ({
      id: h.id,
      ritual: {
        id: h.ritual.id,
        slug: h.ritual.slug,
        title: h.ritual.title,
        category: h.ritual.category,
      },
      completedAt: h.completedAt,
      lunarPhase: h.lunarPhase,
      lunarSign: h.lunarSign,
      notes: h.notes,
      rating: h.rating,
      durationMinutes: h.durationMinutes,
    }));
  }

  /**
   * GET /rituals/history/stats
   * Obtener estadísticas del usuario
   */
  @Get('history/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mis estadísticas de rituales' })
  async getStats(@CurrentUser() user: { id: number }) {
    return this.historyService.getUserStats(user.id);
  }

  /**
   * GET /rituals/:slug
   * Obtener detalle de un ritual
   */
  @Get(':slug')
  @ApiOperation({ summary: 'Obtener detalle de un ritual' })
  @ApiParam({ name: 'slug', example: 'ritual-luna-nueva' })
  @ApiResponse({ status: 200, type: RitualDetailDto })
  @ApiResponse({ status: 404, description: 'Ritual no encontrado' })
  async getRitualBySlug(@Param('slug') slug: string): Promise<RitualDetailDto> {
    return this.ritualsService.findBySlug(slug);
  }

  /**
   * POST /rituals/:id/complete
   * Marcar ritual como completado
   */
  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Marcar ritual como completado' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({
    status: 201,
    description: 'Ritual registrado como completado',
  })
  async completeRitual(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) ritualId: number,
    @Body() dto: CompleteRitualDto,
  ) {
    const history = await this.historyService.completeRitual(
      user.id,
      ritualId,
      dto,
    );

    return {
      message: 'Ritual completado exitosamente',
      historyId: history.id,
      lunarPhase: history.lunarPhase,
      lunarSign: history.lunarSign,
    };
  }
}
