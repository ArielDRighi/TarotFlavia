import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TarotistasOrchestratorService } from '../../application/services/tarotistas-orchestrator.service';
import { GetPublicTarotistasFilterDto } from '../../application/dto';
import { Tarotista } from '../../entities/tarotista.entity';

@ApiTags('Tarotistas Públicos')
@Controller('tarotistas')
export class TarotistasPublicController {
  constructor(private readonly orchestrator: TarotistasOrchestratorService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar tarotistas activos (público, sin autenticación)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de tarotistas activos',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'especialidad', required: false, type: String })
  @ApiQuery({ name: 'orderBy', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async getAllPublic(
    @Query() filterDto: GetPublicTarotistasFilterDto,
  ): Promise<{
    data: Tarotista[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.orchestrator.listPublicTarotistas(filterDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ver perfil público de tarotista (público, sin autenticación)',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil público del tarotista',
    type: Tarotista,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarotista no encontrado o inactivo',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del tarotista' })
  async getPublicProfile(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Tarotista> {
    const tarotista = await this.orchestrator.getPublicProfile(id);

    if (!tarotista) {
      throw new NotFoundException('Tarotista no encontrado o inactivo');
    }

    return tarotista;
  }
}
