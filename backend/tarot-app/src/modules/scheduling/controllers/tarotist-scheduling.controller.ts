import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AvailabilityService, SessionService } from '../services';
import {
  SetWeeklyAvailabilityDto,
  AddExceptionDto,
  ConfirmSessionDto,
  CompleteSessionDto,
  CancelSessionDto,
  SessionResponseDto,
} from '../dto';
import { TarotistAvailability, TarotistException } from '../entities';
import { SessionStatus } from '../enums';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@ApiTags('Tarotist Scheduling')
@ApiBearerAuth('JWT-auth')
@Controller('tarotist/scheduling')
export class TarotistSchedulingController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly sessionService: SessionService,
  ) {}

  // ==================== AVAILABILITY ====================

  @Get('availability/weekly')
  @ApiOperation({ summary: 'Obtener disponibilidad semanal del tarotista' })
  @ApiResponse({
    status: 200,
    description: 'Disponibilidad semanal obtenida',
    type: [TarotistAvailability],
  })
  async getWeeklyAvailability(
    @Request() req: AuthenticatedRequest,
  ): Promise<TarotistAvailability[]> {
    const tarotistaId = req.user.tarotistaId!; // Asumiendo que el user tiene tarotistaId
    return this.availabilityService.getWeeklyAvailability(tarotistaId);
  }

  @Post('availability/weekly')
  @ApiOperation({
    summary: 'Establecer disponibilidad para un día de la semana',
  })
  @ApiResponse({
    status: 201,
    description: 'Disponibilidad establecida',
    type: TarotistAvailability,
  })
  @ApiResponse({ status: 409, description: 'Conflicto de horarios' })
  async setWeeklyAvailability(
    @Request() req: AuthenticatedRequest,
    @Body() dto: SetWeeklyAvailabilityDto,
  ): Promise<TarotistAvailability> {
    const tarotistaId = req.user.tarotistaId!;
    return this.availabilityService.setWeeklyAvailability(tarotistaId, dto);
  }

  @Delete('availability/weekly/:id')
  @ApiOperation({ summary: 'Eliminar disponibilidad de un día específico' })
  @ApiParam({ name: 'id', description: 'ID de la disponibilidad' })
  @ApiResponse({ status: 200, description: 'Disponibilidad eliminada' })
  @ApiResponse({ status: 404, description: 'Disponibilidad no encontrada' })
  async removeWeeklyAvailability(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const tarotistaId = req.user.tarotistaId!;
    await this.availabilityService.removeWeeklyAvailability(tarotistaId, id);
    return { message: 'Disponibilidad eliminada correctamente' };
  }

  // ==================== EXCEPTIONS ====================

  @Get('availability/exceptions')
  @ApiOperation({ summary: 'Listar excepciones futuras' })
  @ApiResponse({
    status: 200,
    description: 'Excepciones obtenidas',
    type: [TarotistException],
  })
  async getExceptions(
    @Request() req: AuthenticatedRequest,
  ): Promise<TarotistException[]> {
    const tarotistaId = req.user.tarotistaId!;
    return this.availabilityService.getExceptions(tarotistaId);
  }

  @Post('availability/exceptions')
  @ApiOperation({
    summary: 'Agregar excepción (día bloqueado o con horarios custom)',
  })
  @ApiResponse({
    status: 201,
    description: 'Excepción agregada',
    type: TarotistException,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe excepción para esta fecha',
  })
  async addException(
    @Request() req: AuthenticatedRequest,
    @Body() dto: AddExceptionDto,
  ): Promise<TarotistException> {
    const tarotistaId = req.user.tarotistaId!;
    return this.availabilityService.addException(tarotistaId, dto);
  }

  @Delete('availability/exceptions/:id')
  @ApiOperation({ summary: 'Eliminar excepción' })
  @ApiParam({ name: 'id', description: 'ID de la excepción' })
  @ApiResponse({ status: 200, description: 'Excepción eliminada' })
  @ApiResponse({ status: 404, description: 'Excepción no encontrada' })
  async removeException(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const tarotistaId = req.user.tarotistaId!;
    await this.availabilityService.removeException(tarotistaId, id);
    return { message: 'Excepción eliminada correctamente' };
  }

  // ==================== SESSIONS ====================

  @Get('sessions')
  @ApiOperation({ summary: 'Obtener sesiones del tarotista' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SessionStatus,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Filtrar por fecha específica (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesiones obtenidas',
    type: [SessionResponseDto],
  })
  async getTarotistSessions(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: SessionStatus,
    @Query('date') date?: string,
  ): Promise<SessionResponseDto[]> {
    const tarotistaId = req.user.tarotistaId!;
    return this.sessionService.getTarotistSessions(tarotistaId, date);
  }

  @Post('sessions/:id/confirm')
  @ApiOperation({ summary: 'Confirmar sesión pendiente' })
  @ApiParam({ name: 'id', description: 'ID de la sesión' })
  @ApiResponse({
    status: 200,
    description: 'Sesión confirmada',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden confirmar sesiones pendientes',
  })
  async confirmSession(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConfirmSessionDto,
  ): Promise<SessionResponseDto> {
    const tarotistaId = req.user.tarotistaId!;
    return this.sessionService.confirmSession(id, tarotistaId, dto);
  }

  @Post('sessions/:id/complete')
  @ApiOperation({ summary: 'Marcar sesión como completada' })
  @ApiParam({ name: 'id', description: 'ID de la sesión' })
  @ApiResponse({
    status: 200,
    description: 'Sesión completada',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden completar sesiones confirmadas',
  })
  async completeSession(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteSessionDto,
  ): Promise<SessionResponseDto> {
    const tarotistaId = req.user.tarotistaId!;
    return this.sessionService.completeSession(id, tarotistaId, dto);
  }

  @Post('sessions/:id/cancel')
  @ApiOperation({ summary: 'Cancelar sesión (por parte del tarotista)' })
  @ApiParam({ name: 'id', description: 'ID de la sesión' })
  @ApiResponse({
    status: 200,
    description: 'Sesión cancelada',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  async cancelSession(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelSessionDto,
  ): Promise<SessionResponseDto> {
    const tarotistaId = req.user.tarotistaId!;
    return this.sessionService.cancelSessionByTarotist(id, tarotistaId, dto);
  }
}
