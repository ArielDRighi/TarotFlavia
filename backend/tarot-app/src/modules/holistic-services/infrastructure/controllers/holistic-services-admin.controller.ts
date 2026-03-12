import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Request,
  UseGuards,
  ParseIntPipe,
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
import { HolisticServicesOrchestratorService } from '../../application/orchestrators/holistic-services-orchestrator.service';
import { HolisticServiceAdminResponseDto } from '../../application/dto/holistic-service-response.dto';
import { PurchaseResponseDto } from '../../application/dto/purchase-response.dto';
import { CreateHolisticServiceDto } from '../../application/dto/create-holistic-service.dto';
import { UpdateHolisticServiceDto } from '../../application/dto/update-holistic-service.dto';
import { ApprovePurchaseDto } from '../../application/dto/purchase.dto';

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
  @ApiOperation({ summary: 'Listar pagos pendientes de aprobación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de compras con pago pendiente',
    type: [PurchaseResponseDto],
  })
  async getPendingPayments(): Promise<PurchaseResponseDto[]> {
    return this.orchestrator.getPendingPayments();
  }

  @Patch('payments/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprobar pago de servicio holístico' })
  @ApiResponse({
    status: 200,
    description: 'Pago aprobado exitosamente',
    type: PurchaseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden aprobar compras en estado PENDING',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la compra' })
  async approvePayment(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApprovePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    return this.orchestrator.approvePurchase(id, req.user.userId, dto);
  }
}
