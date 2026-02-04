import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../auth/infrastructure/guards/optional-jwt-auth.guard';
import { CheckUsageLimitGuard } from '../../../usage-limits/guards/check-usage-limit.guard';
import { IncrementUsageInterceptor } from '../../../usage-limits/interceptors/increment-usage.interceptor';
import { CheckUsageLimit } from '../../../usage-limits/decorators/check-usage-limit.decorator';
import { AllowAnonymous } from '../../../usage-limits/decorators/allow-anonymous.decorator';
import { UsageFeature } from '../../../usage-limits/entities/usage-limit.entity';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { User, UserPlan } from '../../../users/entities/user.entity';
import { PendulumService } from '../../application/services/pendulum.service';
import { PendulumHistoryService } from '../../application/services/pendulum-history.service';
import { PendulumQueryDto } from '../../application/dto/pendulum-query.dto';
import { PendulumQueryResponseDto } from '../../application/dto/pendulum-query-response.dto';
import { PendulumHistoryItemDto } from '../../application/dto/pendulum-history-item.dto';
import { PendulumStatsDto } from '../../application/dto/pendulum-stats.dto';
import { PendulumResponse } from '../../domain/enums/pendulum.enums';

/**
 * Controlador REST para el Péndulo Digital
 *
 * Endpoints:
 * - POST /pendulum/query - Consultar el péndulo (todos los usuarios)
 * - GET /pendulum/history - Mi historial (Premium)
 * - GET /pendulum/history/stats - Mis estadísticas (Premium)
 * - DELETE /pendulum/history/:id - Eliminar consulta (Premium)
 */
@ApiTags('Pendulum')
@Controller('pendulum')
export class PendulumController {
  constructor(
    private readonly pendulumService: PendulumService,
    private readonly historyService: PendulumHistoryService,
  ) {}

  /**
   * Consultar el péndulo
   *
   * Funcionalidades por plan:
   * - Anónimo: 1 consulta de por vida, sin pregunta escrita, sin historial
   * - Free: 3 consultas/mes, sin pregunta escrita, sin historial
   * - Premium: 1 consulta/día, con pregunta escrita opcional, con historial
   */
  @Post('query')
  @UseGuards(OptionalJwtAuthGuard, CheckUsageLimitGuard)
  @UseInterceptors(IncrementUsageInterceptor)
  @CheckUsageLimit(UsageFeature.PENDULUM_QUERY)
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consultar el péndulo' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Respuesta del péndulo',
    type: PendulumQueryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Contenido bloqueado o pregunta inválida',
  })
  @ApiResponse({
    status: 429,
    description: 'Límite de consultas alcanzado',
  })
  async query(
    @Body() dto: PendulumQueryDto,
    @CurrentUser() user?: User,
  ): Promise<PendulumQueryResponseDto> {
    // Solo Premium puede escribir preguntas
    if (dto.question && (!user || user.plan !== UserPlan.PREMIUM)) {
      dto.question = undefined;
    }

    // Solo guardar historial para Premium
    const userId = user?.plan === UserPlan.PREMIUM ? user.id : undefined;

    return this.pendulumService.query(dto, userId);
  }

  /**
   * Obtener mi historial de consultas (Premium only)
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mi historial de consultas (Premium)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de consultas',
    type: [PendulumHistoryItemDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Historial solo disponible para usuarios Premium',
  })
  async getHistory(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
    @Query('response') response?: PendulumResponse,
  ): Promise<PendulumHistoryItemDto[]> {
    if (user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException(
        'El historial solo está disponible para usuarios Premium',
      );
    }
    const history = await this.historyService.getUserHistory(
      user.id,
      limit,
      response,
    );
    return history.map((query) => ({
      id: query.id,
      question: query.question,
      response: query.response,
      interpretation: query.interpretation,
      lunarPhase: query.lunarPhase,
      createdAt: query.createdAt.toISOString(),
    }));
  }

  /**
   * Obtener mis estadísticas (Premium only)
   */
  @Get('history/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mis estadísticas (Premium)' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de consultas',
    type: PendulumStatsDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Estadísticas solo disponibles para usuarios Premium',
  })
  async getStats(@CurrentUser() user: User): Promise<PendulumStatsDto> {
    if (user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException(
        'Las estadísticas solo están disponibles para usuarios Premium',
      );
    }
    return this.historyService.getUserStats(user.id);
  }

  /**
   * Eliminar consulta del historial (Premium only)
   */
  @Delete('history/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar consulta del historial (Premium)' })
  @ApiResponse({
    status: 204,
    description: 'Consulta eliminada exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Historial solo disponible para usuarios Premium',
  })
  async deleteQuery(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) queryId: number,
  ): Promise<void> {
    if (user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException(
        'El historial solo está disponible para usuarios Premium',
      );
    }
    await this.historyService.deleteQuery(user.id, queryId);
  }
}
