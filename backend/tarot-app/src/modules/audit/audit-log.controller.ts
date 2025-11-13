import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuditLogService, AuditLogListResponse } from './audit-log.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@ApiTags('Admin - Audit Logs')
@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener logs de auditoría (solo administradores)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de logs de auditoría con paginación',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  async findAll(
    @Query() query: QueryAuditLogDto,
  ): Promise<AuditLogListResponse> {
    return await this.auditLogService.findAll(query);
  }
}
