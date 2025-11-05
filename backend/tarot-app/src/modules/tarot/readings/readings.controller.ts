import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';

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
import { QueryReadingsDto } from './dto/query-readings.dto';
import { PaginatedReadingsResponseDto } from './dto/paginated-readings-response.dto';
import { User } from '../../users/entities/user.entity';

@ApiTags('Lecturas de Tarot')
@Controller('readings')
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
    summary: 'Obtener historial de lecturas del usuario con paginación',
    description:
      'Recupera lecturas del usuario autenticado con soporte para paginación, ordenamiento y filtros. Usuarios free están limitados a ver solo las 10 lecturas más recientes.',
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
    description: 'Cantidad de elementos por página (default: 10, max: 50)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['created_at', 'updated_at'],
    description: 'Campo por el cual ordenar (default: created_at)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Orden de clasificación (default: DESC)',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'Filtrar por ID de categoría',
  })
  @ApiQuery({
    name: 'spreadId',
    required: false,
    type: Number,
    description: 'Filtrar por ID de spread',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    description: 'Filtrar desde fecha (ISO 8601)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    description: 'Filtrar hasta fecha (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de lecturas con paginación',
    type: PaginatedReadingsResponseDto,
  })
  async getUserReadings(
    @Request() req: { user: { userId: number } },
    @Query() queryDto: QueryReadingsDto,
  ): Promise<PaginatedReadingsResponseDto> {
    const userId = req.user.userId;
    return this.readingsService.findAll(userId, queryDto);
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

  @UseGuards(JwtAuthGuard, CheckUsageLimitGuard)
  @UseInterceptors(IncrementUsageInterceptor)
  @CheckUsageLimit(UsageFeature.INTERPRETATION_REGENERATION)
  @Post(':id/regenerate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Regenerar interpretación de una lectura existente',
    description:
      'Genera una nueva interpretación para una lectura existente manteniendo las mismas cartas. Solo disponible para usuarios premium. Límite: 3 regeneraciones por lectura.',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura a regenerar' })
  @ApiResponse({
    status: 201,
    description: 'Interpretación regenerada con éxito',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuario no es premium o no es el dueño de la lectura',
  })
  @ApiResponse({
    status: 404,
    description: 'Lectura no encontrada',
  })
  @ApiResponse({
    status: 429,
    description:
      'Límite de regeneraciones alcanzado (máximo 3 por lectura) o límite diario alcanzado',
  })
  async regenerateInterpretation(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.userId;
    return this.readingsService.regenerateInterpretation(id, userId);
  }
}
