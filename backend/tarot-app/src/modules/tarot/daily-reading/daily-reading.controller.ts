import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  Request,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { AIQuotaGuard } from '../../ai-usage/infrastructure/guards/ai-quota.guard';
import { DailyReadingService } from './daily-reading.service';
import { DailyReadingResponseDto } from './dto/daily-reading-response.dto';
import { DailyReadingHistoryDto } from './dto/daily-reading-history.dto';
import { CreateAnonymousDailyReadingDto } from './dto/create-anonymous-daily-reading.dto';
import { AllowAnonymous } from '../../usage-limits/decorators/allow-anonymous.decorator';
import {
  CheckUsageLimitGuard,
  IncrementUsageInterceptor,
  CheckUsageLimit,
  UsageFeature,
} from '../../usage-limits';

/**
 * Default tarotista ID (Flavia)
 */
const DEFAULT_TAROTISTA_ID = 1;

@ApiTags('Daily Card')
@Controller('daily-reading')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DailyReadingController {
  constructor(private readonly dailyReadingService: DailyReadingService) {}

  @Post()
  @UseGuards(CheckUsageLimitGuard)
  @UseInterceptors(IncrementUsageInterceptor)
  @CheckUsageLimit(UsageFeature.DAILY_CARD)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generar carta del día',
    description:
      'Genera una carta del día para el usuario autenticado. Solo se puede generar 1 carta por día.',
  })
  @ApiResponse({
    status: 201,
    description: 'Carta del día generada exitosamente',
    type: DailyReadingResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una carta del día para hoy',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token inválido o faltante',
  })
  async generateDailyCard(
    @Request() req: { user: { userId: number } },
  ): Promise<DailyReadingResponseDto> {
    const userId = req.user.userId;
    const tarotistaId = DEFAULT_TAROTISTA_ID;

    const dailyReading = await this.dailyReadingService.generateDailyCard(
      userId,
      tarotistaId,
    );

    // Determinar cardMeaning según orientación (para usuarios FREE)
    const cardMeaning =
      !dailyReading.interpretation && dailyReading.card
        ? dailyReading.isReversed
          ? dailyReading.card.meaningReversed
          : dailyReading.card.meaningUpright
        : null;

    return {
      id: dailyReading.id,
      userId: dailyReading.userId,
      tarotistaId: dailyReading.tarotistaId,
      card: dailyReading.card,
      isReversed: dailyReading.isReversed,
      interpretation: dailyReading.interpretation,
      cardMeaning,
      readingDate: dailyReading.readingDate.toString(),
      wasRegenerated: dailyReading.wasRegenerated,
      createdAt: dailyReading.createdAt,
    };
  }

  @Get('today')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener carta del día de hoy',
    description:
      'Retorna la carta del día de hoy si existe, o null si aún no se ha generado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Carta del día de hoy (puede ser null)',
    type: DailyReadingResponseDto,
    isArray: false,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getTodayCard(
    @Request() req: { user: { userId: number } },
  ): Promise<DailyReadingResponseDto | null> {
    const userId = req.user.userId;
    const dailyReading = await this.dailyReadingService.getTodayCard(userId);

    if (!dailyReading) {
      return null;
    }

    // Determinar cardMeaning según orientación (para usuarios FREE)
    const cardMeaning =
      !dailyReading.interpretation && dailyReading.card
        ? dailyReading.isReversed
          ? dailyReading.card.meaningReversed
          : dailyReading.card.meaningUpright
        : null;

    return {
      id: dailyReading.id,
      userId: dailyReading.userId,
      tarotistaId: dailyReading.tarotistaId,
      card: dailyReading.card,
      isReversed: dailyReading.isReversed,
      interpretation: dailyReading.interpretation,
      cardMeaning,
      readingDate: dailyReading.readingDate.toString(),
      wasRegenerated: dailyReading.wasRegenerated,
      createdAt: dailyReading.createdAt,
    };
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener historial de cartas del día',
    description:
      'Retorna el historial paginado de todas las cartas del día generadas por el usuario.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items por página (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de cartas del día',
    type: DailyReadingHistoryDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getDailyHistory(
    @Request() req: { user: { userId: number } },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<DailyReadingHistoryDto> {
    const userId = req.user.userId;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    return this.dailyReadingService.getDailyHistory(userId, pageNum, limitNum);
  }

  @UseGuards(JwtAuthGuard, AIQuotaGuard)
  @Post('regenerate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Regenerar carta del día (solo premium)',
    description:
      'Regenera la carta del día con una nueva carta y interpretación. Solo disponible para usuarios premium, 1 vez por día. Consume de la cuota mensual de IA.',
  })
  @ApiResponse({
    status: 200,
    description: 'Carta del día regenerada exitosamente',
    type: DailyReadingResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado - solo usuarios premium',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe carta del día para regenerar',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async regenerateDailyCard(
    @Request() req: { user: { userId: number } },
  ): Promise<DailyReadingResponseDto> {
    const userId = req.user.userId;
    const tarotistaId = DEFAULT_TAROTISTA_ID;

    const dailyReading = await this.dailyReadingService.regenerateDailyCard(
      userId,
      tarotistaId,
    );

    // Regenerar siempre incluye interpretation (solo PREMIUM puede regenerar)
    return {
      id: dailyReading.id,
      userId: dailyReading.userId,
      tarotistaId: dailyReading.tarotistaId,
      card: dailyReading.card,
      isReversed: dailyReading.isReversed,
      interpretation: dailyReading.interpretation,
      cardMeaning: null, // PREMIUM siempre tiene interpretation
      readingDate: dailyReading.readingDate.toString(),
      wasRegenerated: dailyReading.wasRegenerated,
      createdAt: dailyReading.createdAt,
    };
  }
}

/**
 * Public controller for anonymous users
 * Rate limiting should be applied to prevent abuse
 */
@ApiTags('Daily Card - Public')
@Controller('public/daily-reading')
export class DailyReadingPublicController {
  constructor(private readonly dailyReadingService: DailyReadingService) {}

  @Post()
  @UseGuards(CheckUsageLimitGuard)
  @AllowAnonymous()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generar carta del día para usuario anónimo',
    description:
      'Genera una carta del día aleatoria y única para cada fingerprint. Solo se permite 1 carta por día por fingerprint. No requiere autenticación. No incluye interpretación IA, solo información de la base de datos.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Carta del día generada exitosamente. Incluye cardMeaning según orientación (upright/reversed).',
    type: DailyReadingResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya viste tu carta del día. Regístrate para más lecturas.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Límite alcanzado. Ya viste tu carta del día. Regístrate para más lecturas.',
  })
  @ApiResponse({
    status: 400,
    description: 'Fingerprint inválido',
  })
  async generateAnonymousDailyCard(
    @Body() dto: CreateAnonymousDailyReadingDto,
  ): Promise<DailyReadingResponseDto> {
    const tarotistaId = DEFAULT_TAROTISTA_ID;

    const dailyReading =
      await this.dailyReadingService.generateAnonymousDailyCard(
        dto.fingerprint,
        tarotistaId,
      );

    // Determinar cardMeaning según orientación
    const cardMeaning = dailyReading.isReversed
      ? dailyReading.card.meaningReversed
      : dailyReading.card.meaningUpright;

    return {
      id: dailyReading.id,
      userId: null, // Usuario anónimo
      tarotistaId: dailyReading.tarotistaId,
      card: dailyReading.card,
      isReversed: dailyReading.isReversed,
      interpretation: null, // Sin IA para anónimos
      cardMeaning, // Significado desde DB
      readingDate: dailyReading.readingDate.toString(),
      wasRegenerated: false, // Anónimos no pueden regenerar
      createdAt: dailyReading.createdAt,
    };
  }
}
