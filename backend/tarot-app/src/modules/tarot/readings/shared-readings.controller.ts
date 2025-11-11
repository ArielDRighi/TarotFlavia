import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReadingsService } from './readings.service';
import { ReadingsOrchestratorService } from './application/services/readings-orchestrator.service';
import { TarotReading } from './entities/tarot-reading.entity';

@ApiTags('Lecturas Compartidas')
@Controller('shared')
export class SharedReadingsController {
  constructor(
    private readonly readingsService: ReadingsService, // Legacy
    private readonly orchestrator: ReadingsOrchestratorService, // NEW
  ) {}

  @Get(':token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener lectura compartida (público)',
    description:
      'Obtiene una lectura compartida mediante su token único. No requiere autenticación. Incrementa el contador de visualizaciones.',
  })
  @ApiParam({
    name: 'token',
    description: 'Token único de la lectura compartida',
  })
  @ApiResponse({
    status: 200,
    description: 'Lectura compartida obtenida con éxito',
    type: TarotReading,
  })
  @ApiResponse({
    status: 404,
    description: 'Lectura compartida no encontrada o no está pública',
  })
  @ApiResponse({
    status: 429,
    description: 'Límite de solicitudes excedido (100 por 15 minutos)',
  })
  async getSharedReading(@Param('token') token: string): Promise<TarotReading> {
    return this.orchestrator.getSharedReading(token);
  }
}
