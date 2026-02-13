import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Logger,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { AdminLimitsService } from '../services/admin-limits.service';
import { UpdateBirthChartLimitsDto } from '../dto/usage-limits.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Admin - Límites de Uso')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/limits')
export class AdminLimitsController {
  private readonly logger = new Logger(AdminLimitsController.name);

  constructor(private readonly limitsService: AdminLimitsService) {}

  @Get('birth-chart')
  @ApiOperation({
    summary: 'Obtener límites actuales de carta astral (solo administradores)',
  })
  @ApiResponse({
    status: 200,
    description: 'Límites actuales por plan',
    schema: {
      type: 'object',
      properties: {
        anonymous: { type: 'number', example: 1 },
        free: { type: 'number', example: 3 },
        premium: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  async getBirthChartLimits() {
    this.logger.log('Fetching birth chart limits');
    return this.limitsService.getBirthChartLimits();
  }

  @Put('birth-chart')
  @ApiOperation({
    summary:
      'Actualizar límites de carta astral para planes Free y Premium (solo administradores)',
  })
  @ApiBody({ type: UpdateBirthChartLimitsDto })
  @ApiResponse({
    status: 200,
    description: 'Límites actualizados exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Límites actualizados exitosamente',
        },
        limits: {
          type: 'object',
          properties: {
            anonymous: { type: 'number', example: 1 },
            free: { type: 'number', example: 5 },
            premium: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  async updateBirthChartLimits(
    @Body() updateDto: UpdateBirthChartLimitsDto,
    @Req()
    req: Request & {
      user: { userId: number; email: string; roles: string[] };
    },
  ) {
    const userId = req.user.userId;
    const userEmail = req.user.email;
    this.logger.log(
      `Admin user ${userId} (${userEmail}) updating birth chart limits: ${JSON.stringify(updateDto)}`,
    );

    const updatedLimits = await this.limitsService.updateBirthChartLimits(
      updateDto,
      userId,
      userEmail,
    );

    return {
      message: 'Límites actualizados exitosamente',
      limits: updatedLimits,
    };
  }

  @Get('birth-chart/history')
  @ApiOperation({
    summary: 'Obtener historial de cambios de límites (solo administradores)',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de cambios',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          action: { type: 'string', example: 'UPDATE_USAGE_LIMITS' },
          performedBy: { type: 'number', example: 1 },
          performedAt: { type: 'string', example: '2026-02-12T10:00:00Z' },
          oldValue: {
            type: 'object',
            example: { free: 3, premium: 5 },
          },
          newValue: {
            type: 'object',
            example: { free: 5, premium: 10 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  async getLimitsHistory() {
    this.logger.log('Fetching birth chart limits history');
    return this.limitsService.getLimitsHistory();
  }
}
