import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  NotFoundException,
  BadRequestException,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HoroscopeGenerationService } from '../../application/services/horoscope-generation.service';
import { HoroscopeCronService } from '../../application/services/horoscope-cron.service';
import { HoroscopeResponseDto } from '../../application/dto/horoscope-response.dto';
import { DailyHoroscope } from '../../entities/daily-horoscope.entity';
import {
  ZodiacSign,
  getZodiacSign,
} from '../../../../common/utils/zodiac.utils';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { AdminGuard } from '../../../auth/infrastructure/guards/admin.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { UsersService } from '../../../users/users.service';

/**
 * Controlador de endpoints REST para consultar horóscopos diarios
 *
 * Endpoints públicos:
 * - GET /horoscope/today - Todos los horóscopos de hoy
 * - GET /horoscope/today/:sign - Horóscopo de un signo hoy
 * - GET /horoscope/:date - Horóscopos de una fecha
 * - GET /horoscope/:date/:sign - Horóscopo específico
 *
 * Endpoints autenticados:
 * - GET /horoscope/my-sign - Horóscopo del usuario (requiere birthDate)
 */
@ApiTags('Horoscope')
@Controller('horoscope')
export class HoroscopeController {
  constructor(
    private readonly horoscopeService: HoroscopeGenerationService,
    private readonly horoscopeCronService: HoroscopeCronService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Generar horóscopos manualmente (Admin only)
   */
  @Post('generate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generar horóscopos manualmente (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Generación de horóscopos iniciada',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (requiere rol admin)',
  })
  generateManually(): { message: string } {
    // Fire-and-forget: inicia la generación en background
    this.horoscopeCronService.generateNow().catch((error) => {
      console.error('Error en generación manual:', error);
    });
    return {
      message:
        'Generación de horóscopos iniciada. Proceso en background (~72 segundos).',
    };
  }

  /**
   * Obtener todos los horóscopos de hoy
   */
  @Get('today')
  @ApiOperation({ summary: 'Obtener todos los horóscopos de hoy' })
  @ApiResponse({
    status: 200,
    description: 'Lista de horóscopos del día',
    type: [HoroscopeResponseDto],
  })
  async getTodayAll(): Promise<HoroscopeResponseDto[]> {
    const today = this.horoscopeService.getTodayUTC();
    const horoscopes = await this.horoscopeService.findAllByDate(today);
    return horoscopes.map((h) => this.toResponseDto(h));
  }

  /**
   * Obtener horóscopo de un signo para hoy
   */
  @Get('today/:sign')
  @ApiOperation({ summary: 'Obtener horóscopo de un signo para hoy' })
  @ApiParam({
    name: 'sign',
    enum: ZodiacSign,
    description: 'Signo zodiacal',
    example: 'aries',
  })
  @ApiResponse({
    status: 200,
    description: 'Horóscopo del signo',
    type: HoroscopeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Horóscopo no disponible',
  })
  @ApiResponse({
    status: 400,
    description: 'Signo inválido',
  })
  async getTodayBySign(
    @Param('sign', new ParseEnumPipe(ZodiacSign)) sign: ZodiacSign,
  ): Promise<HoroscopeResponseDto> {
    const today = this.horoscopeService.getTodayUTC();
    const horoscope = await this.horoscopeService.findBySignAndDate(
      sign,
      today,
    );

    if (!horoscope) {
      throw new NotFoundException(`Horóscopo de ${sign} no disponible`);
    }

    // Incrementar viewCount de forma asíncrona (fire-and-forget)
    this.horoscopeService.incrementViewCount(horoscope.id).catch(() => {
      // Ignorar errores silenciosamente
    });

    return this.toResponseDto(horoscope);
  }

  /**
   * Obtener horóscopo del usuario autenticado basado en su fecha de nacimiento
   */
  @Get('my-sign')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener horóscopo de mi signo' })
  @ApiResponse({
    status: 200,
    description: 'Horóscopo del signo del usuario',
    type: HoroscopeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Usuario sin fecha de nacimiento configurada',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 404,
    description: 'Horóscopo no disponible',
  })
  async getMySignHoroscope(
    @CurrentUser() currentUser: { userId: number },
  ): Promise<HoroscopeResponseDto> {
    // Cargar usuario completo para acceder a birthDate
    const user = await this.usersService.findById(currentUser.userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.birthDate) {
      throw new BadRequestException(
        'Configura tu fecha de nacimiento para ver tu horóscopo',
      );
    }

    // Calcular signo zodiacal del usuario
    const sign = getZodiacSign(user.birthDate);
    const today = this.horoscopeService.getTodayUTC();
    const horoscope = await this.horoscopeService.findBySignAndDate(
      sign,
      today,
    );

    if (!horoscope) {
      throw new NotFoundException(`Horóscopo de ${sign} no disponible`);
    }

    // Incrementar viewCount de forma asíncrona (fire-and-forget)
    this.horoscopeService.incrementViewCount(horoscope.id).catch(() => {
      // Ignorar errores silenciosamente
    });

    return this.toResponseDto(horoscope);
  }

  /**
   * Obtener todos los horóscopos de una fecha específica
   */
  @Get(':date')
  @ApiOperation({ summary: 'Obtener horóscopos de una fecha' })
  @ApiParam({
    name: 'date',
    example: '2026-01-16',
    description: 'Fecha en formato YYYY-MM-DD',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de horóscopos de la fecha',
    type: [HoroscopeResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Formato de fecha inválido',
  })
  async getByDate(
    @Param('date') dateStr: string,
  ): Promise<HoroscopeResponseDto[]> {
    const date = this.parseDate(dateStr);
    const horoscopes = await this.horoscopeService.findAllByDate(date);
    return horoscopes.map((h) => this.toResponseDto(h));
  }

  /**
   * Obtener horóscopo específico por fecha y signo
   */
  @Get(':date/:sign')
  @ApiOperation({ summary: 'Obtener horóscopo específico' })
  @ApiParam({
    name: 'date',
    example: '2026-01-16',
    description: 'Fecha en formato YYYY-MM-DD',
  })
  @ApiParam({
    name: 'sign',
    enum: ZodiacSign,
    description: 'Signo zodiacal',
    example: 'aries',
  })
  @ApiResponse({
    status: 200,
    description: 'Horóscopo específico',
    type: HoroscopeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Horóscopo no disponible',
  })
  @ApiResponse({
    status: 400,
    description: 'Fecha o signo inválido',
  })
  async getByDateAndSign(
    @Param('date') dateStr: string,
    @Param('sign', new ParseEnumPipe(ZodiacSign)) sign: ZodiacSign,
  ): Promise<HoroscopeResponseDto> {
    const date = this.parseDate(dateStr);
    const horoscope = await this.horoscopeService.findBySignAndDate(sign, date);

    if (!horoscope) {
      throw new NotFoundException(`Horóscopo no disponible`);
    }

    // Incrementar viewCount de forma asíncrona (fire-and-forget)
    this.horoscopeService.incrementViewCount(horoscope.id).catch(() => {
      // Ignorar errores silenciosamente
    });

    return this.toResponseDto(horoscope);
  }

  /**
   * Helper: Parsear string de fecha a Date
   * Valida formato YYYY-MM-DD estricto antes de parsear
   */
  private parseDate(dateStr: string): Date {
    // Validar formato YYYY-MM-DD con regex
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      throw new BadRequestException('Formato inválido. Usar YYYY-MM-DD');
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Fecha inválida');
    }
    return date;
  }

  /**
   * Helper: Convertir entidad a DTO
   */
  private toResponseDto(horoscope: DailyHoroscope): HoroscopeResponseDto {
    return {
      id: horoscope.id,
      zodiacSign: horoscope.zodiacSign,
      horoscopeDate: horoscope.horoscopeDate.toISOString().split('T')[0],
      generalContent: horoscope.generalContent,
      areas: horoscope.areas,
      luckyNumber: horoscope.luckyNumber,
      luckyColor: horoscope.luckyColor,
      luckyTime: horoscope.luckyTime,
    };
  }
}
