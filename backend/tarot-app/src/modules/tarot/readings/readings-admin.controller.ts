import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ReadingsService } from './readings.service';
import { ReadingsOrchestratorService } from './application/services/readings-orchestrator.service';
import { PaginatedReadingsResponseDto } from './dto/paginated-readings-response.dto';

@ApiTags('Admin - Lecturas de Tarot')
@Controller('admin/readings')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class ReadingsAdminController {
  constructor(
    private readonly readingsService: ReadingsService, // Legacy
    private readonly orchestrator: ReadingsOrchestratorService, // NEW
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
}
