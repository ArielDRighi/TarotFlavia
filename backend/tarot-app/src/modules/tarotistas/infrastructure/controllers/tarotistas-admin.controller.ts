import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../../common/enums/user-role.enum';
import { TarotistasOrchestratorService } from '../../application/services/tarotistas-orchestrator.service';
import {
  CreateTarotistaDto,
  UpdateTarotistaDto,
  UpdateTarotistaConfigDto,
  SetCustomMeaningDto,
  BulkImportMeaningsDto,
  ApproveApplicationDto,
  RejectApplicationDto,
  GetTarotistasFilterDto,
} from '../../application/dto';

@ApiTags('Admin - Tarotistas')
@ApiBearerAuth()
@Controller('admin/tarotistas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class TarotistasAdminController {
  constructor(private readonly orchestrator: TarotistasOrchestratorService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo tarotista (solo admin)' })
  @ApiResponse({ status: 201, description: 'Tarotista creado exitosamente' })
  async createTarotista(@Body() createDto: CreateTarotistaDto) {
    return await this.orchestrator.createTarotista(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los tarotistas con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de tarotistas' })
  async getAllTarotistas(@Query() filterDto: GetTarotistasFilterDto) {
    return await this.orchestrator.getAllTarotistas(filterDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar información de tarotista' })
  @ApiResponse({
    status: 200,
    description: 'Tarotista actualizado exitosamente',
  })
  async updateTarotista(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTarotistaDto,
  ) {
    return await this.orchestrator.updateTarotista(id, updateDto);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar tarotista' })
  @ApiResponse({
    status: 200,
    description: 'Tarotista desactivado exitosamente',
  })
  async deactivateTarotista(@Param('id', ParseIntPipe) id: number) {
    return await this.orchestrator.setActiveStatus(id, false);
  }

  @Put(':id/reactivate')
  @ApiOperation({ summary: 'Reactivar tarotista' })
  @ApiResponse({
    status: 200,
    description: 'Tarotista reactivado exitosamente',
  })
  async reactivateTarotista(@Param('id', ParseIntPipe) id: number) {
    return await this.orchestrator.setActiveStatus(id, true);
  }

  @Get(':id/config')
  @ApiOperation({ summary: 'Obtener configuración de IA del tarotista' })
  @ApiResponse({ status: 200, description: 'Configuración del tarotista' })
  async getTarotistaConfig(@Param('id', ParseIntPipe) id: number) {
    return await this.orchestrator.getTarotistaConfig(id);
  }

  @Put(':id/config')
  @ApiOperation({ summary: 'Actualizar configuración de IA del tarotista' })
  @ApiResponse({ status: 200, description: 'Configuración actualizada' })
  async updateTarotistaConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTarotistaConfigDto,
  ) {
    return await this.orchestrator.updateConfig(id, updateDto);
  }

  @Post(':id/config/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resetear configuración a valores por defecto' })
  @ApiResponse({
    status: 200,
    description: 'Configuración reseteada a valores por defecto',
  })
  async resetConfigToDefault(@Param('id', ParseIntPipe) id: number) {
    return await this.orchestrator.resetConfigToDefault(id);
  }

  @Post(':id/meanings')
  @ApiOperation({ summary: 'Establecer significado personalizado de carta' })
  @ApiResponse({
    status: 201,
    description: 'Significado personalizado creado',
  })
  async setCustomMeaning(
    @Param('id', ParseIntPipe) id: number,
    @Body() meaningDto: SetCustomMeaningDto,
  ) {
    return await this.orchestrator.setCustomMeaning(id, meaningDto);
  }

  @Get(':id/meanings')
  @ApiOperation({
    summary: 'Listar todos los significados personalizados del tarotista',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de significados personalizados',
  })
  async getAllCustomMeanings(@Param('id', ParseIntPipe) id: number) {
    return await this.orchestrator.getAllCustomMeanings(id);
  }

  @Delete(':id/meanings/:meaningId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar significado personalizado' })
  @ApiResponse({
    status: 204,
    description: 'Significado personalizado eliminado',
  })
  async deleteCustomMeaning(
    @Param('id', ParseIntPipe) id: number,
    @Param('meaningId', ParseIntPipe) meaningId: number,
  ) {
    await this.orchestrator.deleteCustomMeaning(id, meaningId);
  }

  @Post(':id/meanings/bulk')
  @ApiOperation({ summary: 'Importar significados personalizados en lote' })
  @ApiResponse({ status: 201, description: 'Significados importados' })
  async bulkImportMeanings(
    @Param('id', ParseIntPipe) id: number,
    @Body() bulkDto: BulkImportMeaningsDto,
  ) {
    return await this.orchestrator.bulkImportCustomMeanings(
      id,
      bulkDto.meanings,
    );
  }

  @Get('applications')
  @ApiOperation({ summary: 'Listar todas las aplicaciones para tarotista' })
  @ApiResponse({ status: 200, description: 'Lista de aplicaciones' })
  async getAllApplications(@Query() filterDto: GetTarotistasFilterDto) {
    return await this.orchestrator.getAllApplications(filterDto);
  }

  @Post('applications/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprobar aplicación de tarotista' })
  @ApiResponse({ status: 200, description: 'Aplicación aprobada' })
  async approveApplication(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number } },
    @Body() approveDto: ApproveApplicationDto,
  ) {
    const result = await this.orchestrator.approveApplication(
      id,
      req.user.userId,
      approveDto,
    );
    // Return only application to maintain backward compatibility
    return result.application;
  }

  @Post('applications/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rechazar aplicación de tarotista' })
  @ApiResponse({ status: 200, description: 'Aplicación rechazada' })
  async rejectApplication(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number } },
    @Body() rejectDto: RejectApplicationDto,
  ) {
    return await this.orchestrator.rejectApplication(
      id,
      req.user.userId,
      rejectDto,
    );
  }
}
