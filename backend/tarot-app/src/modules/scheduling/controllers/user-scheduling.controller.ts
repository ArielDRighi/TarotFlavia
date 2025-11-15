import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Request,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SessionService, AvailabilityService } from '../services';
import {
  BookSessionDto,
  CancelSessionDto,
  SessionResponseDto,
  AvailableSlotDto,
} from '../dto';
import { SessionStatus } from '../domain/enums';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@ApiTags('User Scheduling')
@ApiBearerAuth()
@Controller('scheduling')
export class UserSchedulingController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Get('available-slots')
  @ApiOperation({
    summary: 'Obtener slots disponibles de un tarotista en un rango de fechas',
  })
  @ApiQuery({
    name: 'tarotistaId',
    description: 'ID del tarotista',
    type: Number,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Fecha de inicio (YYYY-MM-DD)',
    example: '2025-11-15',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Fecha de fin (YYYY-MM-DD)',
    example: '2025-11-22',
  })
  @ApiQuery({
    name: 'durationMinutes',
    description: 'Duración de la sesión en minutos',
    enum: [30, 60, 90],
  })
  @ApiResponse({
    status: 200,
    description: 'Slots disponibles obtenidos',
    type: [AvailableSlotDto],
  })
  async getAvailableSlots(
    @Query('tarotistaId', ParseIntPipe) tarotistaId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('durationMinutes', ParseIntPipe) durationMinutes: number,
  ): Promise<AvailableSlotDto[]> {
    return this.availabilityService.getAvailableSlots(
      tarotistaId,
      startDate,
      endDate,
      durationMinutes,
    );
  }

  @Post('book')
  @ApiOperation({ summary: 'Reservar una sesión' })
  @ApiResponse({
    status: 201,
    description: 'Sesión reservada exitosamente',
    type: SessionResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'El slot no está disponible o ya existe una sesión pendiente',
  })
  @ApiResponse({
    status: 400,
    description: 'Debe reservarse con al menos 2 horas de anticipación',
  })
  async bookSession(
    @Request() req: AuthenticatedRequest,
    @Body() dto: BookSessionDto,
  ): Promise<SessionResponseDto> {
    const userId = req.user.id;
    const userEmail = req.user.email;
    return this.sessionService.bookSession(userId, userEmail, dto);
  }

  @Get('my-sessions')
  @ApiOperation({ summary: 'Obtener mis sesiones' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SessionStatus,
    description: 'Filtrar por estado',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesiones obtenidas',
    type: [SessionResponseDto],
  })
  async getUserSessions(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: SessionStatus,
  ): Promise<SessionResponseDto[]> {
    const userId = req.user.id;
    return this.sessionService.getUserSessions(userId, status);
  }

  @Get('my-sessions/:id')
  @ApiOperation({ summary: 'Obtener detalle de una sesión específica' })
  @ApiParam({ name: 'id', description: 'ID de la sesión' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la sesión',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  async getSessionDetail(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SessionResponseDto> {
    const userId = req.user.id;
    const sessions = await this.sessionService.getUserSessions(userId);
    const session = sessions.find((s) => s.id === id);

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    return session;
  }

  @Post('my-sessions/:id/cancel')
  @ApiOperation({
    summary: 'Cancelar una sesión (debe ser con >24h de anticipación)',
  })
  @ApiParam({ name: 'id', description: 'ID de la sesión' })
  @ApiResponse({
    status: 200,
    description: 'Sesión cancelada',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Debe cancelarse con al menos 24 horas de anticipación',
  })
  async cancelSession(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelSessionDto,
  ): Promise<SessionResponseDto> {
    const userId = req.user.id;
    return this.sessionService.cancelSession(id, userId, dto);
  }
}
