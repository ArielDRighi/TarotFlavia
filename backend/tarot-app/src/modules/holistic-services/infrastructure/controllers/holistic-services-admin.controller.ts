import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
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
import { HolisticServicesOrchestratorService } from '../../application/orchestrators/holistic-services-orchestrator.service';
import { HolisticServiceAdminResponseDto } from '../../application/dto/holistic-service-response.dto';
import { PurchaseResponseDto } from '../../application/dto/purchase-response.dto';
import { CreateHolisticServiceDto } from '../../application/dto/create-holistic-service.dto';
import { UpdateHolisticServiceDto } from '../../application/dto/update-holistic-service.dto';

@ApiTags('Admin — Servicios Holísticos')
@ApiBearerAuth()
@Controller('admin/holistic-services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class HolisticServicesAdminController {
  constructor(
    private readonly orchestrator: HolisticServicesOrchestratorService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos los servicios holísticos (incluye inactivos)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los servicios holísticos',
    type: [HolisticServiceAdminResponseDto],
  })
  async getAllServices(): Promise<HolisticServiceAdminResponseDto[]> {
    return this.orchestrator.adminGetAllServices();
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo servicio holístico' })
  @ApiResponse({
    status: 201,
    description: 'Servicio creado exitosamente',
    type: HolisticServiceAdminResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createService(
    @Body() dto: CreateHolisticServiceDto,
  ): Promise<HolisticServiceAdminResponseDto> {
    return this.orchestrator.adminCreateService(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar servicio holístico' })
  @ApiResponse({
    status: 200,
    description: 'Servicio actualizado exitosamente',
    type: HolisticServiceAdminResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del servicio' })
  async updateService(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHolisticServiceDto,
  ): Promise<HolisticServiceAdminResponseDto> {
    return this.orchestrator.adminUpdateService(id, dto);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Historial de transacciones (todos los estados)' })
  @ApiResponse({
    status: 200,
    description: 'Historial completo de compras de servicios holísticos',
    type: [PurchaseResponseDto],
  })
  async getAllPurchases(): Promise<PurchaseResponseDto[]> {
    return this.orchestrator.getAllPurchases();
  }
}
