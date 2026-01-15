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
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/infrastructure/guards/optional-jwt-auth.guard';
import { AIQuotaGuard } from '../../ai-usage/infrastructure/guards/ai-quota.guard';
import { DailyReadingService } from './daily-reading.service';
import { ShareTextGeneratorService } from '../readings/application/services/share-text-generator.service';
import { DailyReadingResponseDto } from './dto/daily-reading-response.dto';
import { DailyReadingHistoryDto } from './dto/daily-reading-history.dto';
import { CreateAnonymousDailyReadingDto } from './dto/create-anonymous-daily-reading.dto';
import { GenerateShareTextResponseDto } from '../readings/dto/generate-share-text-response.dto';
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
export class DailyReadingController {
  constructor(
    private readonly dailyReadingService: DailyReadingService,
    private readonly shareTextGenerator: ShareTextGeneratorService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
  @ApiBearerAuth('JWT-auth')
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

  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Get('share-text')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener texto formateado para compartir la carta del día',
    description:
      'Genera texto formateado con emojis para compartir la carta del día en redes sociales. Funciona para usuarios autenticados (FREE/PREMIUM) y anónimos (con fingerprint). El contenido varía según el plan del usuario.',
  })
  @ApiQuery({
    name: 'fingerprint',
    required: false,
    type: String,
    description: 'Fingerprint del usuario anónimo (opcional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Texto de compartir generado exitosamente',
    type: GenerateShareTextResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No existe carta del día para hoy',
  })
  @ApiResponse({
    status: 429,
    description: 'Límite de rate limiting alcanzado (10 requests/minuto)',
  })
  async getDailyShareText(
    @Request() req: { user?: { userId: number; plan?: string } },
    @Query('fingerprint') fingerprint?: string,
  ): Promise<GenerateShareTextResponseDto> {
    let dailyReading;
    let userPlan: 'anonymous' | 'free' | 'premium' = 'anonymous';

    // Determinar si es usuario autenticado o anónimo
    if (req.user) {
      // Usuario autenticado
      const userId = req.user.userId;
      userPlan = (req.user.plan || 'free') as 'anonymous' | 'free' | 'premium';
      dailyReading = await this.dailyReadingService.getTodayCard(userId);
    } else if (fingerprint) {
      // Usuario anónimo - buscar por fingerprint
      userPlan = 'anonymous';
      const todayStr = new Date().toISOString().split('T')[0];
      dailyReading = await this.dailyReadingService.findOneByFingerprint(
        fingerprint,
        todayStr,
      );
    } else {
      throw new NotFoundException(
        'Se requiere autenticación o fingerprint para obtener la carta del día',
      );
    }

    if (!dailyReading) {
      throw new NotFoundException('No existe carta del día para hoy');
    }

    // Generar texto de compartir
    const text = this.shareTextGenerator.generateShareText(
      dailyReading,
      userPlan,
      'daily',
    );

    return { text };
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
