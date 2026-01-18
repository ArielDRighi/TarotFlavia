import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
  ParseEnumPipe,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChineseHoroscopeService } from '../../application/services/chinese-horoscope.service';
import {
  ChineseHoroscopeResponseDto,
  // ChineseHoroscopeAreaDto,  // Not used directly - inferred from entity
  // ChineseHoroscopeLuckyDto,  // Not used directly - inferred from entity
} from '../../application/dto/chinese-horoscope-response.dto';
import {
  CalculateAnimalDto,
  CalculateAnimalResponseDto,
} from '../../application/dto/calculate-animal.dto';
import { ChineseHoroscope } from '../../entities/chinese-horoscope.entity';
import {
  ChineseZodiacAnimal,
  getChineseZodiacAnimal,
  getChineseZodiacInfo,
} from '../../../../common/utils/chinese-zodiac.utils';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { AdminGuard } from '../../../auth/infrastructure/guards/admin.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { UsersService } from '../../../users/users.service';

/**
 * Controlador de endpoints REST para consultar horóscopos chinos
 *
 * Endpoints públicos:
 * - GET /chinese-horoscope/calculate?birthDate=YYYY-MM-DD - Calcular animal chino
 * - GET /chinese-horoscope/:year - Todos los horóscopos de un año
 * - GET /chinese-horoscope/:year/:animal - Horóscopo específico
 *
 * Endpoints autenticados:
 * - GET /chinese-horoscope/my-animal?year=2026 - Horóscopo del usuario (requiere birthDate)
 *
 * Endpoints admin:
 * - POST /chinese-horoscope/admin/generate/:year - Generar horóscopos de un año
 */
@ApiTags('Chinese Horoscope')
@Controller('chinese-horoscope')
export class ChineseHoroscopeController {
  private readonly logger = new Logger(ChineseHoroscopeController.name);

  constructor(
    private readonly chineseService: ChineseHoroscopeService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Calcular animal zodiacal chino basado en fecha de nacimiento
   */
  @Get('calculate')
  @ApiOperation({ summary: 'Calcular animal zodiacal chino' })
  @ApiQuery({
    name: 'birthDate',
    example: '1990-01-15',
    description: 'Fecha de nacimiento en formato YYYY-MM-DD',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del animal zodiacal',
    type: CalculateAnimalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Fecha inválida',
  })
  calculateAnimal(
    @Query() query: CalculateAnimalDto,
  ): CalculateAnimalResponseDto {
    const birthDate = new Date(query.birthDate);

    if (isNaN(birthDate.getTime())) {
      throw new BadRequestException('Fecha de nacimiento inválida');
    }

    const animal = getChineseZodiacAnimal(birthDate);
    const animalInfo = getChineseZodiacInfo(animal);

    return {
      animal,
      animalInfo,
      chineseYear: birthDate.getFullYear(),
    };
  }

  /**
   * Obtener horóscopo del usuario autenticado basado en su fecha de nacimiento
   */
  @Get('my-animal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener horóscopo de mi animal chino' })
  @ApiQuery({
    name: 'year',
    example: 2026,
    description: 'Año para consultar (opcional, por defecto año actual)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Horóscopo del animal del usuario',
    type: ChineseHoroscopeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Usuario sin fecha de nacimiento configurada o año fuera de rango',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 404,
    description: 'Horóscopo no disponible',
  })
  async getMyAnimalHoroscope(
    @CurrentUser() currentUser: { userId: number },
    @Query('year') year?: number,
  ): Promise<ChineseHoroscopeResponseDto> {
    // Cargar usuario completo para acceder a birthDate
    const user = await this.usersService.findById(currentUser.userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.birthDate) {
      throw new BadRequestException(
        'Configura tu fecha de nacimiento para ver tu horóscopo chino',
      );
    }

    // Usar año actual si no se proporciona
    const targetYear = year || new Date().getFullYear();

    // Validar rango de año
    if (targetYear < 2020 || targetYear > 2050) {
      throw new BadRequestException('El año debe estar entre 2020 y 2050');
    }

    // Buscar horóscopo del usuario
    const birthDate = new Date(user.birthDate);
    const horoscope = await this.chineseService.findForUser(
      birthDate,
      targetYear,
    );

    if (!horoscope) {
      const animal = getChineseZodiacAnimal(birthDate);
      throw new NotFoundException(
        `Horóscopo chino de ${animal} para ${targetYear} no disponible`,
      );
    }

    // Incrementar viewCount de forma asíncrona (fire-and-forget)
    this.chineseService.incrementViewCount(horoscope.id).catch(() => {
      // Ignorar errores silenciosamente
    });

    return this.toResponseDto(horoscope);
  }

  /**
   * Obtener todos los horóscopos chinos de un año específico
   */
  @Get(':year')
  @ApiOperation({ summary: 'Obtener todos los horóscopos chinos de un año' })
  @ApiParam({
    name: 'year',
    example: 2026,
    description: 'Año a consultar (2020-2050)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de horóscopos del año',
    type: [ChineseHoroscopeResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Año inválido o fuera de rango',
  })
  async getAllByYear(
    @Param('year', ParseIntPipe) year: number,
  ): Promise<ChineseHoroscopeResponseDto[]> {
    // Validar rango de año
    if (year < 2020 || year > 2050) {
      throw new BadRequestException('El año debe estar entre 2020 y 2050');
    }

    const horoscopes = await this.chineseService.findAllByYear(year);
    return horoscopes.map((h) => this.toResponseDto(h));
  }

  /**
   * Obtener horóscopo chino específico por año y animal
   */
  @Get(':year/:animal')
  @ApiOperation({ summary: 'Obtener horóscopo chino específico' })
  @ApiParam({
    name: 'year',
    example: 2026,
    description: 'Año a consultar (2020-2050)',
  })
  @ApiParam({
    name: 'animal',
    enum: ChineseZodiacAnimal,
    description: 'Animal zodiacal chino',
    example: 'dragon',
  })
  @ApiResponse({
    status: 200,
    description: 'Horóscopo específico',
    type: ChineseHoroscopeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Horóscopo no disponible',
  })
  @ApiResponse({
    status: 400,
    description: 'Año o animal inválido',
  })
  async getByYearAndAnimal(
    @Param('year', ParseIntPipe) year: number,
    @Param('animal', new ParseEnumPipe(ChineseZodiacAnimal))
    animal: ChineseZodiacAnimal,
  ): Promise<ChineseHoroscopeResponseDto> {
    // Validar rango de año
    if (year < 2020 || year > 2050) {
      throw new BadRequestException('El año debe estar entre 2020 y 2050');
    }

    const horoscope = await this.chineseService.findByAnimalAndYear(
      animal,
      year,
    );

    if (!horoscope) {
      throw new NotFoundException(
        `Horóscopo chino de ${animal} para ${year} no disponible`,
      );
    }

    // Incrementar viewCount de forma asíncrona (fire-and-forget)
    this.chineseService.incrementViewCount(horoscope.id).catch(() => {
      // Ignorar errores silenciosamente
    });

    return this.toResponseDto(horoscope);
  }

  /**
   * Generar horóscopos chinos para un año específico (Admin only)
   */
  @Post('admin/generate/:year')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generar horóscopos chinos de un año (Admin)' })
  @ApiParam({
    name: 'year',
    example: 2026,
    description: 'Año a generar (2020-2050)',
  })
  @ApiResponse({
    status: 201,
    description: 'Generación de horóscopos iniciada',
  })
  @ApiResponse({
    status: 400,
    description: 'Año inválido o fuera de rango',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (requiere rol admin)',
  })
  generateForYear(@Param('year', ParseIntPipe) year: number): {
    message: string;
    details: string;
  } {
    // Validar rango de año
    if (year < 2020 || year > 2050) {
      throw new BadRequestException('El año debe estar entre 2020 y 2050');
    }

    // Fire-and-forget: inicia la generación en background
    this.chineseService
      .generateAllForYear(year)
      .then((result) => {
        this.logger.log(
          `Generación completada: ${result.successful} exitosos, ${result.failed} fallidos`,
        );
      })
      .catch((error) => {
        this.logger.error('Error en generación manual:', error);
      });

    return {
      message: `Generación de horóscopos chinos para ${year} iniciada`,
      details: 'Proceso en background (~1-2 minutos para 12 animales).',
    };
  }

  /**
   * Helper: Convertir entidad a DTO
   */
  private toResponseDto(
    horoscope: ChineseHoroscope,
  ): ChineseHoroscopeResponseDto {
    return {
      id: horoscope.id,
      animal: horoscope.animal,
      year: horoscope.year,
      generalOverview: horoscope.generalOverview,
      areas: horoscope.areas,
      luckyElements: horoscope.luckyElements,
      compatibility: horoscope.compatibility,
      monthlyHighlights: horoscope.monthlyHighlights,
    };
  }
}
