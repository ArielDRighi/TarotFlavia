import {
  Controller,
  Get,
  Delete,
  Patch,
  Query,
  Param,
  ParseIntPipe,
  ParseBoolPipe,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/infrastructure/guards/admin.guard';
import { AuditLogService } from '../../audit/audit-log.service';
import { AuditAction } from '../../audit/enums/audit-action.enum';
import { ReadingsOrchestratorService } from './application/services/readings-orchestrator.service';
import { PaginatedReadingsResponseDto } from './dto/paginated-readings-response.dto';
import { TarotReading } from './entities/tarot-reading.entity';

@ApiTags('Admin - Lecturas de Tarot')
@Controller('admin/readings')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('JWT-auth')
export class ReadingsAdminController {
  constructor(
    private readonly orchestrator: ReadingsOrchestratorService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las lecturas (admin)',
    description:
      'Endpoint para administradores. Permite ver todas las lecturas del sistema, incluyendo opcionalmente las eliminadas.',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description:
      'Si es true, incluye lecturas eliminadas en los resultados (default: false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de todas las lecturas',
    type: PaginatedReadingsResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  async getAllReadings(
    @Query('includeDeleted', new ParseBoolPipe({ optional: true }))
    includeDeleted?: boolean,
  ): Promise<PaginatedReadingsResponseDto> {
    return this.orchestrator.findAllForAdmin(includeDeleted ?? false);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar lectura (borrado lógico)',
    description:
      'Permite al administrador eliminar lógicamente una lectura. Queda traza en el Audit Log.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la lectura' })
  @ApiResponse({ status: 204, description: 'Lectura eliminada correctamente' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  async softDelete(
    @Param('id', ParseIntPipe) id: number,
    @Request()
    req: {
      user: { userId: number };
      ip: string;
      headers: Record<string, string>;
    },
  ): Promise<void> {
    await this.orchestrator.adminSoftDelete(id);

    await this.auditLogService.log({
      userId: req.user.userId,
      action: AuditAction.READING_DELETED,
      entityType: 'TarotReading',
      entityId: String(id),
      newValue: { deletedAt: new Date().toISOString() },
      ipAddress: req.ip ?? null,
      userAgent: (req.headers['user-agent'] as string) ?? null,
    });
  }

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restaurar lectura eliminada',
    description:
      'Permite al administrador restaurar una lectura previamente eliminada. Queda traza en el Audit Log.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la lectura' })
  @ApiResponse({ status: 200, description: 'Lectura restaurada correctamente' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @Request()
    req: {
      user: { userId: number };
      ip: string;
      headers: Record<string, string>;
    },
  ): Promise<TarotReading> {
    const restored = await this.orchestrator.adminRestore(id);

    await this.auditLogService.log({
      userId: req.user.userId,
      action: AuditAction.READING_RESTORED,
      entityType: 'TarotReading',
      entityId: String(id),
      newValue: { restoredAt: new Date().toISOString() },
      ipAddress: req.ip ?? null,
      userAgent: (req.headers['user-agent'] as string) ?? null,
    });

    return restored;
  }
}
