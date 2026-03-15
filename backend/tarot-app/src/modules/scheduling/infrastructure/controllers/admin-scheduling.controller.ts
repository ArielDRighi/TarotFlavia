import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../../common/enums/user-role.enum';
import { AdminSchedulingOrchestratorService } from '../../application/services/admin-scheduling-orchestrator.service';
import { SetWeeklyAvailabilityDto } from '../../application/dto/set-weekly-availability.dto';
import { AddExceptionDto } from '../../application/dto/add-exception.dto';
import { TarotistAvailability, TarotistException } from '../../entities';

@ApiTags('Admin — Gestión de Agenda')
@ApiBearerAuth()
@Controller('admin/tarotistas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSchedulingController {
  constructor(
    private readonly orchestrator: AdminSchedulingOrchestratorService,
  ) {}

  // ==================== AVAILABILITY ====================

  @Get(':id/availability')
  @ApiOperation({
    summary: 'Obtener disponibilidad semanal de un tarotista (admin)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del tarotista' })
  @ApiResponse({
    status: 200,
    description: 'Disponibilidad semanal del tarotista',
    type: [TarotistAvailability],
  })
  async getWeeklyAvailability(
    @Param('id', ParseIntPipe) tarotistaId: number,
  ): Promise<TarotistAvailability[]> {
    return this.orchestrator.getWeeklyAvailability(tarotistaId);
  }

  @Post(':id/availability')
  @ApiOperation({
    summary: 'Establecer disponibilidad para un día de la semana (admin)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del tarotista' })
  @ApiResponse({
    status: 201,
    description: 'Disponibilidad establecida',
    type: TarotistAvailability,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto de horarios',
  })
  async setWeeklyAvailability(
    @Param('id', ParseIntPipe) tarotistaId: number,
    @Body() dto: SetWeeklyAvailabilityDto,
  ): Promise<TarotistAvailability> {
    return this.orchestrator.setWeeklyAvailability(tarotistaId, dto);
  }

  @Delete(':id/availability/:availabilityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar disponibilidad de un día específico (admin)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del tarotista' })
  @ApiParam({
    name: 'availabilityId',
    type: Number,
    description: 'ID de la disponibilidad',
  })
  @ApiResponse({ status: 200, description: 'Disponibilidad eliminada' })
  @ApiResponse({ status: 404, description: 'Disponibilidad no encontrada' })
  async removeWeeklyAvailability(
    @Param('id', ParseIntPipe) tarotistaId: number,
    @Param('availabilityId', ParseIntPipe) availabilityId: number,
  ): Promise<{ message: string }> {
    await this.orchestrator.removeWeeklyAvailability(
      tarotistaId,
      availabilityId,
    );
    return { message: 'Disponibilidad eliminada correctamente' };
  }

  // ==================== EXCEPTIONS (BLOCKED DATES) ====================

  @Get(':id/blocked-dates')
  @ApiOperation({
    summary: 'Obtener fechas bloqueadas / excepciones de un tarotista (admin)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del tarotista' })
  @ApiResponse({
    status: 200,
    description: 'Lista de excepciones / fechas bloqueadas',
    type: [TarotistException],
  })
  async getExceptions(
    @Param('id', ParseIntPipe) tarotistaId: number,
  ): Promise<TarotistException[]> {
    return this.orchestrator.getExceptions(tarotistaId);
  }

  @Post(':id/blocked-dates')
  @ApiOperation({
    summary: 'Agregar excepción o fecha bloqueada para un tarotista (admin)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del tarotista' })
  @ApiResponse({
    status: 201,
    description: 'Excepción agregada',
    type: TarotistException,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una excepción para esta fecha',
  })
  async addException(
    @Param('id', ParseIntPipe) tarotistaId: number,
    @Body() dto: AddExceptionDto,
  ): Promise<TarotistException> {
    return this.orchestrator.addException(tarotistaId, dto);
  }

  @Delete(':id/blocked-dates/:dateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar excepción / fecha bloqueada de un tarotista (admin)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del tarotista' })
  @ApiParam({
    name: 'dateId',
    type: Number,
    description: 'ID de la excepción',
  })
  @ApiResponse({ status: 200, description: 'Excepción eliminada' })
  @ApiResponse({ status: 404, description: 'Excepción no encontrada' })
  async removeException(
    @Param('id', ParseIntPipe) tarotistaId: number,
    @Param('dateId', ParseIntPipe) dateId: number,
  ): Promise<{ message: string }> {
    await this.orchestrator.removeException(tarotistaId, dateId);
    return { message: 'Excepción eliminada correctamente' };
  }
}
