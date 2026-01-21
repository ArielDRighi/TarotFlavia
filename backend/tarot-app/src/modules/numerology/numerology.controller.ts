import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NumerologyService } from './numerology.service';
import { UsersService } from '../users/users.service';
import { CalculateNumerologyDto } from './dto/calculate-numerology.dto';
import { NumerologyResponseDto } from './dto/numerology-response.dto';
import { NumerologyInterpretationResponseDto } from './dto/numerology-interpretation-response.dto';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { AIQuotaGuard } from '../ai-usage/infrastructure/guards/ai-quota.guard';
import { RequiresPremiumForNumerologyAIGuard } from './guards/requires-premium-for-numerology-ai.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { calculateDayNumber } from '../../common/utils/numerology.utils';
import { NumberInterpretation } from './data/interpretations.data';
import { NumerologyInterpretation } from './entities/numerology-interpretation.entity';

/**
 * Controlador REST para consultar numerología
 *
 * Endpoints públicos:
 * - POST /numerology/calculate - Calcular perfil numerológico (anónimos)
 * - GET /numerology/meanings - Lista de todos los significados
 * - GET /numerology/meanings/:number - Significado de un número específico
 * - GET /numerology/day-number - Número del día actual
 *
 * Endpoints autenticados:
 * - GET /numerology/my-profile - Mi perfil numerológico (requiere birthDate)
 * - POST /numerology/my-profile/interpret - Interpretación IA (PREMIUM)
 */
@ApiTags('Numerología')
@Controller('numerology')
export class NumerologyController {
  constructor(
    private readonly numerologyService: NumerologyService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * POST /numerology/calculate
   * Calcula perfil básico (para anónimos y widget)
   */
  @Post('calculate')
  @ApiOperation({ summary: 'Calcular perfil numerológico básico' })
  @ApiResponse({ status: 200, type: NumerologyResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  calculate(@Body() dto: CalculateNumerologyDto): NumerologyResponseDto {
    return this.numerologyService.calculate(dto);
  }

  /**
   * GET /numerology/my-profile
   * Perfil completo del usuario autenticado
   */
  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mi perfil numerológico' })
  @ApiResponse({ status: 200, type: NumerologyResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Sin fecha de nacimiento configurada',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getMyProfile(
    @CurrentUser() currentUser: { userId: number; plan: string },
  ): Promise<NumerologyResponseDto> {
    // Cargar usuario completo para acceder a birthDate
    const user = await this.usersService.findById(currentUser.userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.birthDate) {
      throw new BadRequestException(
        'Configura tu fecha de nacimiento para ver tu perfil numerológico',
      );
    }

    return this.numerologyService.calculate({
      birthDate: user.birthDate,
      fullName: user.name,
    });
  }

  /**
   * POST /numerology/my-profile/interpret
   * Genera interpretación IA (solo PREMIUM)
   * Usa el mismo patrón de guards que readings
   */
  @Post('my-profile/interpret')
  @UseGuards(JwtAuthGuard, RequiresPremiumForNumerologyAIGuard, AIQuotaGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generar interpretación IA (PREMIUM)' })
  @ApiResponse({ status: 200, type: NumerologyInterpretationResponseDto })
  @ApiResponse({ status: 400, description: 'Sin fecha de nacimiento' })
  @ApiResponse({ status: 403, description: 'Requiere plan PREMIUM' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async interpretMyProfile(
    @CurrentUser() currentUser: { userId: number; plan: string },
  ): Promise<NumerologyInterpretationResponseDto> {
    // Cargar usuario completo
    const user = await this.usersService.findById(currentUser.userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.birthDate) {
      throw new BadRequestException(
        'Configura tu fecha de nacimiento para ver tu perfil numerológico',
      );
    }

    // Verifica si ya existe interpretación (se genera una sola vez)
    const existing = await this.numerologyService.getExistingInterpretation(
      user.id,
    );
    if (existing) {
      return this.toInterpretationDto(existing);
    }

    // Genera nueva interpretación
    const interpretation =
      await this.numerologyService.generateAndSaveInterpretation(user);
    return this.toInterpretationDto(interpretation);
  }

  /**
   * Helper: Convierte entidad de interpretación a DTO
   */
  private toInterpretationDto(
    entity: NumerologyInterpretation,
  ): NumerologyInterpretationResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      interpretation: entity.interpretation,
      lifePath: entity.lifePath,
      expressionNumber: entity.expressionNumber,
      soulUrge: entity.soulUrge,
      personality: entity.personality,
      birthdayNumber: entity.birthdayNumber,
      generatedAt: entity.generatedAt.toISOString(),
      aiProvider: entity.aiProvider,
      aiModel: entity.aiModel,
    };
  }

  /**
   * GET /numerology/meanings
   * Lista todos los significados (para galería)
   */
  @Get('meanings')
  @ApiOperation({ summary: 'Obtener todos los significados' })
  @ApiResponse({ status: 200, description: 'Lista de significados' })
  getAllMeanings(): NumberInterpretation[] {
    const validNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
    const meanings: NumberInterpretation[] = [];

    for (const num of validNumbers) {
      const meaning = this.numerologyService.getInterpretation(num);
      if (meaning) {
        meanings.push(meaning);
      }
    }

    return meanings;
  }

  /**
   * GET /numerology/meanings/:number
   * Significado de un número específico
   */
  @Get('meanings/:number')
  @ApiOperation({ summary: 'Obtener significado de un número' })
  @ApiParam({
    name: 'number',
    example: 7,
    description: 'Número (1-9, 11, 22, 33)',
  })
  @ApiResponse({ status: 200, description: 'Significado del número' })
  @ApiResponse({ status: 400, description: 'Número inválido' })
  @ApiResponse({ status: 404, description: 'Significado no encontrado' })
  getMeaning(
    @Param('number', ParseIntPipe) number: number,
  ): NumberInterpretation {
    // Validar que sea un número válido
    const validNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
    if (!validNumbers.includes(number)) {
      throw new BadRequestException(
        'Número inválido. Debe ser 1-9, 11, 22 o 33',
      );
    }

    const meaning = this.numerologyService.getInterpretation(number);
    if (!meaning) {
      throw new NotFoundException(
        `Significado del número ${number} no encontrado`,
      );
    }

    return meaning;
  }

  /**
   * GET /numerology/day-number
   * Número del día actual (para widget)
   */
  @Get('day-number')
  @ApiOperation({ summary: 'Obtener número del día actual' })
  @ApiResponse({
    status: 200,
    description: 'Número y significado del día',
    schema: {
      type: 'object',
      properties: {
        date: { type: 'string', example: '2026-01-18' },
        dayNumber: { type: 'number', example: 8 },
        meaning: { type: 'object', nullable: true },
      },
    },
  })
  getDayNumber(): {
    date: string;
    dayNumber: number;
    meaning: NumberInterpretation | null;
  } {
    const today = new Date();
    const dayNumber = calculateDayNumber(today);
    const meaning = this.numerologyService.getInterpretation(dayNumber);

    return {
      date: today.toISOString().split('T')[0],
      dayNumber,
      meaning,
    };
  }
}
