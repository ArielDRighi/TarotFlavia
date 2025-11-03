import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequiresPremiumForCustomQuestionGuard } from './guards/requires-premium-for-custom-question.guard';
import {
  CheckUsageLimitGuard,
  IncrementUsageInterceptor,
  CheckUsageLimit,
  UsageFeature,
} from '../../usage-limits';
import { ReadingsService } from './readings.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { User } from '../../users/entities/user.entity';

@ApiTags('Lecturas de Tarot')
@Controller('readings')
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests por minuto para endpoints de lecturas
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @UseGuards(
    JwtAuthGuard,
    RequiresPremiumForCustomQuestionGuard,
    CheckUsageLimitGuard,
  )
  @UseInterceptors(IncrementUsageInterceptor)
  @CheckUsageLimit(UsageFeature.TAROT_READING)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear una nueva lectura de tarot',
    description:
      'Procesa una lectura completa con cartas seleccionadas, generando interpretación. Los usuarios free solo pueden usar preguntas predefinidas, mientras que los usuarios premium pueden usar preguntas personalizadas.',
  })
  @ApiBody({ type: CreateReadingDto })
  @ApiResponse({
    status: 201,
    description: 'Lectura creada con éxito',
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuario free intentando usar pregunta personalizada (requiere plan premium) o límite de lecturas alcanzado',
  })
  @ApiResponse({
    status: 400,
    description:
      'Validación fallida: ninguna pregunta o ambas preguntas proporcionadas',
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes. Límite: 10 por minuto',
  })
  async createReading(
    @Request() req: { user: { userId: number } },
    @Body() createReadingDto: CreateReadingDto,
  ) {
    const user = { id: req.user.userId } as User;
    return this.readingsService.create(user, createReadingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener historial de lecturas del usuario',
    description:
      'Recupera todas las lecturas realizadas por el usuario autenticado',
  })
  async getUserReadings(@Request() req: { user: { userId: number } }) {
    const userId = req.user.userId;
    return this.readingsService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener detalles de una lectura específica',
    description: 'Recupera todos los detalles de una lectura de tarot',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura' })
  async getReadingById(
    @Request() req: { user: { userId: number; isAdmin?: boolean } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin || false;

    return this.readingsService.findOne(id, userId, isAdmin);
  }
}
