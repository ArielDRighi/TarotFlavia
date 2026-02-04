import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
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
import { OptionalJwtAuthGuard } from '../../../auth/infrastructure/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { SacredCalendarService } from '../../application/services/sacred-calendar.service';
import { SacredEventDto } from '../../application/dto/sacred-event-response.dto';
import { Hemisphere } from '../../domain/enums';
import { UserPlan } from '../../../users/application/dto/user-profile-response.dto';
import { SacredEvent } from '../../entities/sacred-event.entity';

/**
 * Controlador de endpoints REST para el Calendario Sagrado
 *
 * Endpoints públicos (o con auth opcional):
 * - GET /rituals/calendar/upcoming - Eventos próximos (limitado para usuarios free)
 * - GET /rituals/calendar/today - Eventos de hoy
 *
 * Endpoints Premium:
 * - GET /rituals/calendar/month/:year/:month - Eventos de un mes completo
 */
@ApiTags('Sacred Calendar')
@Controller('rituals/calendar')
export class SacredCalendarController {
  constructor(private readonly calendarService: SacredCalendarService) {}

  /**
   * GET /rituals/calendar/upcoming
   * Obtener eventos próximos (30 días por defecto)
   * Premium: muestra todos | Free/Anon: muestra solo los 3 más importantes
   */
  @Get('upcoming')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener eventos sagrados próximos',
    description:
      'Usuarios premium ven todos los eventos. Usuarios free y anónimos ven solo los 3 más importantes.',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    example: 30,
    description: 'Número de días hacia adelante (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos próximos',
    type: [SacredEventDto],
  })
  async getUpcomingEvents(
    @Query('days') days?: number,
    @CurrentUser()
    user?: { userId: number; plan?: UserPlan; hemisphere?: Hemisphere },
  ): Promise<SacredEventDto[]> {
    const hemisphere = user?.hemisphere || Hemisphere.SOUTH; // Default: Southern Hemisphere
    const daysToFetch = days || 30;

    const events = await this.calendarService.getUpcomingEvents(
      hemisphere,
      daysToFetch,
    );

    // Usuarios no premium solo ven los 3 más importantes
    const limitedEvents =
      !user || user.plan !== UserPlan.PREMIUM ? events.slice(0, 3) : events;

    return limitedEvents.map((e) => this.toDto(e));
  }

  /**
   * GET /rituals/calendar/today
   * Obtener eventos del día actual
   */
  @Get('today')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Obtener eventos sagrados de hoy' })
  @ApiResponse({
    status: 200,
    description: 'Eventos del día actual',
    type: [SacredEventDto],
  })
  async getTodayEvents(
    @CurrentUser() user?: { hemisphere?: Hemisphere },
  ): Promise<SacredEventDto[]> {
    const hemisphere = user?.hemisphere || Hemisphere.SOUTH; // Default: Southern Hemisphere
    const events = await this.calendarService.getTodayEvents(hemisphere);
    return events.map((e) => this.toDto(e));
  }

  /**
   * GET /rituals/calendar/month/:year/:month
   * Obtener eventos de un mes específico (Premium only)
   */
  @Get('month/:year/:month')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener eventos de un mes (Premium)',
    description: 'Solo disponible para usuarios con plan Premium',
  })
  @ApiParam({ name: 'year', example: 2025, description: 'Año' })
  @ApiParam({ name: 'month', example: 1, description: 'Mes (1-12)' })
  @ApiResponse({
    status: 200,
    description: 'Eventos del mes',
    type: [SacredEventDto],
  })
  @ApiResponse({
    status: 403,
    description:
      'El calendario completo está disponible solo para usuarios Premium',
  })
  async getMonthEvents(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @CurrentUser()
    user: { userId: number; plan: UserPlan; hemisphere?: Hemisphere },
  ): Promise<SacredEventDto[]> {
    if (user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException(
        'El calendario completo está disponible solo para usuarios Premium',
      );
    }

    const hemisphere = user.hemisphere || Hemisphere.SOUTH; // Default: Southern Hemisphere
    const events = await this.calendarService.getMonthEvents(
      year,
      month,
      hemisphere,
    );
    return events.map((e) => this.toDto(e));
  }

  /**
   * Convierte una entidad SacredEvent a DTO
   * @private
   */
  private toDto(event: SacredEvent): SacredEventDto {
    return {
      id: event.id,
      name: event.name,
      slug: event.slug,
      description: event.description,
      eventType: event.eventType,
      sabbat: event.sabbat,
      lunarPhase: event.lunarPhase,
      eventDate: this.toDateString(event.eventDate),
      eventTime: event.eventTime,
      hemisphere: event.hemisphere,
      importance: event.importance,
      energyDescription: event.energyDescription,
      suggestedRitualCategories: event.suggestedRitualCategories,
      suggestedRitualIds: event.suggestedRitualIds,
    };
  }

  /**
   * Convierte una fecha a string en formato YYYY-MM-DD
   * Maneja tanto objetos Date como strings que ya vienen en formato de fecha
   * @private
   */
  private toDateString(date: Date | string): string {
    // Si ya es un string, verificar si está en formato YYYY-MM-DD
    if (typeof date === 'string') {
      // Si viene como "YYYY-MM-DD", retornarlo directamente
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      // Si viene en otro formato, convertirlo a Date primero
      date = new Date(date);
    }

    // Procesar como objeto Date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
