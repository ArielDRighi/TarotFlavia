import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { HolisticServicesOrchestratorService } from '../../application/orchestrators/holistic-services-orchestrator.service';
import { HolisticServiceResponseDto } from '../../application/dto/holistic-service-response.dto';
import { HolisticServiceDetailResponseDto } from '../../application/dto/holistic-service-response.dto';

@ApiTags('Servicios Holísticos')
@Controller('holistic-services')
export class HolisticServicesPublicController {
  constructor(
    private readonly orchestrator: HolisticServicesOrchestratorService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar servicios holísticos activos (público)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de servicios holísticos activos',
    type: [HolisticServiceResponseDto],
  })
  async getAll(): Promise<HolisticServiceResponseDto[]> {
    return this.orchestrator.getAllActiveServices();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Obtener detalle de servicio holístico por slug (público)',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle del servicio holístico',
    type: HolisticServiceDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  @ApiParam({ name: 'slug', type: String, description: 'Slug del servicio' })
  async getBySlug(
    @Param('slug') slug: string,
  ): Promise<HolisticServiceDetailResponseDto> {
    return this.orchestrator.getServiceBySlug(slug);
  }
}
