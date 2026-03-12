import {
  Controller,
  Post,
  Get,
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
import { HolisticServicesOrchestratorService } from '../../application/orchestrators/holistic-services-orchestrator.service';
import { PurchaseResponseDto } from '../../application/dto/purchase-response.dto';
import { CreatePurchaseDto } from '../../application/dto/purchase.dto';

@ApiTags('Servicios Holísticos — Compras')
@ApiBearerAuth()
@Controller('holistic-services')
@UseGuards(JwtAuthGuard)
export class HolisticServicesController {
  constructor(
    private readonly orchestrator: HolisticServicesOrchestratorService,
  ) {}

  @Post('purchases')
  @ApiOperation({ summary: 'Crear una nueva compra de servicio holístico' })
  @ApiResponse({
    status: 201,
    description: 'Compra creada exitosamente',
    type: PurchaseResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ya tienes una compra pendiente para este servicio',
  })
  async createPurchase(
    @Request() req: { user: { userId: number } },
    @Body() dto: CreatePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    return this.orchestrator.createPurchase(req.user.userId, dto);
  }

  @Get('purchases/my')
  @ApiOperation({ summary: 'Listar mis compras de servicios holísticos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de compras del usuario',
    type: [PurchaseResponseDto],
  })
  async getMyPurchases(
    @Request() req: { user: { userId: number } },
  ): Promise<PurchaseResponseDto[]> {
    return this.orchestrator.getUserPurchases(req.user.userId);
  }

  @Get('purchases/:id')
  @ApiOperation({ summary: 'Obtener detalle de una compra propia' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la compra',
    type: PurchaseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para ver esta compra',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la compra' })
  async getPurchaseById(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PurchaseResponseDto> {
    return this.orchestrator.getPurchaseById(id, req.user.userId);
  }

  @Patch('purchases/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar una compra pendiente' })
  @ApiResponse({
    status: 200,
    description: 'Compra cancelada exitosamente',
    type: PurchaseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden cancelar compras en estado PENDING',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la compra' })
  async cancelPurchase(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PurchaseResponseDto> {
    return this.orchestrator.cancelPurchase(id, req.user.userId, false);
  }
}
