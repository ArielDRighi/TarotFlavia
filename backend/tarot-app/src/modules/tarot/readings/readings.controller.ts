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
  Delete,
  HttpCode,
  HttpStatus,
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
import { AIQuotaGuard } from '../../ai-usage/ai-quota.guard';
import { ReadingsOrchestratorService } from './application/services/readings-orchestrator.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { QueryReadingsDto } from './dto/query-readings.dto';
import { PaginatedReadingsResponseDto } from './dto/paginated-readings-response.dto';
import { ReadingsCacheInterceptor } from './interceptors/readings-cache.interceptor';
import { User } from '../../users/entities/user.entity';

@ApiTags('Lecturas de Tarot')
@Controller('readings')
export class ReadingsController {
  constructor(private readonly orchestrator: ReadingsOrchestratorService) {}

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
    return this.orchestrator.create(user, createReadingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('trash')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener lecturas eliminadas (papelera)',
    description:
      'Recupera las lecturas eliminadas del usuario en los últimos 30 días. Las lecturas pueden ser restauradas desde aquí.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de lecturas eliminadas',
  })
  async getTrashedReadings(@Request() req: { user: { userId: number } }) {
    const userId = req.user.userId;
    return this.orchestrator.findTrashedReadings(userId);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ReadingsCacheInterceptor)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener historial de lecturas del usuario con paginación',
    description:
      'Recupera lecturas del usuario autenticado con soporte para paginación, ordenamiento y filtros. Usuarios free están limitados a ver solo las 10 lecturas más recientes. Resultados cacheados por 5 minutos.',
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
    const user = { id: req.user.userId } as User;
    return this.orchestrator.findAll(user, queryDto);
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

    return this.orchestrator.findOne(id, userId, isAdmin);
  }

  @UseGuards(JwtAuthGuard, AIQuotaGuard, CheckUsageLimitGuard)
  @UseInterceptors(IncrementUsageInterceptor)
  @CheckUsageLimit(UsageFeature.INTERPRETATION_REGENERATION)
  @Post(':id/regenerate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Regenerar interpretación de una lectura existente',
    description:
      'Genera una nueva interpretación para una lectura existente manteniendo las mismas cartas. Solo disponible para usuarios premium. Límite: 3 regeneraciones por lectura. Consume cuota mensual de IA.',
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
    return this.orchestrator.regenerateInterpretation(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar una lectura (soft delete)',
    description:
      'Elimina lógicamente una lectura. La lectura no se elimina de la base de datos pero no aparecerá en los listados normales. Puede ser restaurada dentro de 30 días.',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura a eliminar' })
  @ApiResponse({
    status: 200,
    description: 'Lectura eliminada con éxito',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para eliminar esta lectura',
  })
  @ApiResponse({
    status: 404,
    description: 'Lectura no encontrada',
  })
  async deleteReading(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const userId = req.user.userId;
    await this.orchestrator.remove(id, userId);
    return { message: 'Lectura eliminada con éxito' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Restaurar una lectura eliminada',
    description:
      'Restaura una lectura eliminada haciéndola visible nuevamente en los listados normales.',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura a restaurar' })
  @ApiResponse({
    status: 200,
    description: 'Lectura restaurada con éxito',
  })
  @ApiResponse({
    status: 400,
    description: 'La lectura no está eliminada',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para restaurar esta lectura',
  })
  @ApiResponse({
    status: 404,
    description: 'Lectura no encontrada',
  })
  async restoreReading(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.userId;
    return this.orchestrator.restore(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Compartir una lectura (solo premium)',
    description:
      'Genera un token único para compartir la lectura públicamente. Solo disponible para usuarios premium.',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura a compartir' })
  @ApiResponse({
    status: 201,
    description: 'Lectura compartida con éxito',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuario no es premium o no es el dueño de la lectura',
  })
  @ApiResponse({
    status: 404,
    description: 'Lectura no encontrada',
  })
  async shareReading(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.userId;
    return this.orchestrator.shareReading(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/unshare')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Dejar de compartir una lectura',
    description:
      'Remueve el token de compartir y marca la lectura como privada.',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura' })
  @ApiResponse({
    status: 200,
    description: 'Lectura dejó de ser compartida con éxito',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para modificar esta lectura',
  })
  @ApiResponse({
    status: 404,
    description: 'Lectura no encontrada',
  })
  async unshareReading(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.userId;
    return this.orchestrator.unshareReading(id, userId);
  }
}
