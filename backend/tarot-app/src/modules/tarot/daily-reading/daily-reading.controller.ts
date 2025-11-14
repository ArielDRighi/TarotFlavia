import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DailyReadingService } from './daily-reading.service';
import { DailyReadingResponseDto } from './dto/daily-reading-response.dto';
import { DailyReadingHistoryDto } from './dto/daily-reading-history.dto';

/**
 * Default tarotista ID (Flavia)
 */
const DEFAULT_TAROTISTA_ID = 1;

@ApiTags('Daily Card')
@Controller('daily-reading')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DailyReadingController {
  constructor(private readonly dailyReadingService: DailyReadingService) {}

  @Post()
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

    return {
      id: dailyReading.id,
      userId: dailyReading.userId,
      tarotistaId: dailyReading.tarotistaId,
      card: dailyReading.card,
      isReversed: dailyReading.isReversed,
      interpretation: dailyReading.interpretation,
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

    return {
      id: dailyReading.id,
      userId: dailyReading.userId,
      tarotistaId: dailyReading.tarotistaId,
      card: dailyReading.card,
      isReversed: dailyReading.isReversed,
      interpretation: dailyReading.interpretation,
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

  @Post('regenerate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Regenerar carta del día (solo premium)',
    description:
      'Regenera la carta del día con una nueva carta y interpretación. Solo disponible para usuarios premium, 1 vez por día.',
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

    return {
      id: dailyReading.id,
      userId: dailyReading.userId,
      tarotistaId: dailyReading.tarotistaId,
      card: dailyReading.card,
      isReversed: dailyReading.isReversed,
      interpretation: dailyReading.interpretation,
      readingDate: dailyReading.readingDate.toString(),
      wasRegenerated: dailyReading.wasRegenerated,
      createdAt: dailyReading.createdAt,
    };
  }
}
