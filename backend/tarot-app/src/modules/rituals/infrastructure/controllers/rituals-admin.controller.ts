import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../../common/enums/user-role.enum';
import { RitualsAdminService } from '../../application/services/rituals-admin.service';
import {
  CreateRitualDto,
  UpdateRitualDto,
  CreateRitualStepDto,
  UpdateRitualStepDto,
  CreateRitualMaterialDto,
  UpdateRitualMaterialDto,
} from '../../application/dto';

@ApiTags('Admin - Rituals')
@Controller('admin/rituals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class RitualsAdminController {
  constructor(private readonly adminService: RitualsAdminService) {}

  // ==================
  // CRUD DE RITUALES
  // ==================

  @Post()
  @ApiOperation({ summary: 'Crear nuevo ritual' })
  @ApiResponse({ status: 201, description: 'Ritual creado exitosamente' })
  @ApiResponse({ status: 409, description: 'Ya existe un ritual con ese slug' })
  async create(@Body() dto: CreateRitualDto) {
    return this.adminService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los rituales (incluye inactivos)' })
  @ApiResponse({ status: 200, description: 'Lista de rituales' })
  async findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ritual por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Ritual encontrado' })
  @ApiResponse({ status: 404, description: 'Ritual no encontrado' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar ritual' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Ritual actualizado' })
  @ApiResponse({ status: 404, description: 'Ritual no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRitualDto,
  ) {
    return this.adminService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar ritual (soft delete)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Ritual eliminado' })
  @ApiResponse({ status: 404, description: 'Ritual no encontrado' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.softDelete(id);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Activar/desactivar ritual' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Estado del ritual actualizado' })
  @ApiResponse({ status: 404, description: 'Ritual no encontrado' })
  async toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleActive(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicar ritual' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { properties: { newSlug: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Ritual duplicado exitosamente' })
  @ApiResponse({ status: 404, description: 'Ritual no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un ritual con ese slug' })
  async duplicate(
    @Param('id', ParseIntPipe) id: number,
    @Body('newSlug') newSlug: string,
  ) {
    return this.adminService.duplicate(id, newSlug);
  }

  // ==================
  // GESTIÓN DE PASOS
  // ==================

  @Post(':id/steps')
  @ApiOperation({ summary: 'Agregar paso a ritual' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 201, description: 'Paso agregado exitosamente' })
  @ApiResponse({ status: 404, description: 'Ritual no encontrado' })
  async addStep(
    @Param('id', ParseIntPipe) ritualId: number,
    @Body() dto: CreateRitualStepDto,
  ) {
    return this.adminService.addStep(ritualId, dto);
  }

  @Patch(':id/steps/:stepId')
  @ApiOperation({ summary: 'Actualizar paso' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'stepId', type: Number })
  @ApiResponse({ status: 200, description: 'Paso actualizado' })
  @ApiResponse({ status: 404, description: 'Paso o ritual no encontrado' })
  async updateStep(
    @Param('id', ParseIntPipe) ritualId: number,
    @Param('stepId', ParseIntPipe) stepId: number,
    @Body() dto: UpdateRitualStepDto,
  ) {
    return this.adminService.updateStep(ritualId, stepId, dto);
  }

  @Delete(':id/steps/:stepId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar paso' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'stepId', type: Number })
  @ApiResponse({ status: 204, description: 'Paso eliminado' })
  @ApiResponse({ status: 404, description: 'Paso o ritual no encontrado' })
  async deleteStep(
    @Param('id', ParseIntPipe) ritualId: number,
    @Param('stepId', ParseIntPipe) stepId: number,
  ) {
    await this.adminService.deleteStep(ritualId, stepId);
  }

  // ==================
  // GESTIÓN DE MATERIALES
  // ==================

  @Post(':id/materials')
  @ApiOperation({ summary: 'Agregar material a ritual' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 201, description: 'Material agregado exitosamente' })
  @ApiResponse({ status: 404, description: 'Ritual no encontrado' })
  async addMaterial(
    @Param('id', ParseIntPipe) ritualId: number,
    @Body() dto: CreateRitualMaterialDto,
  ) {
    return this.adminService.addMaterial(ritualId, dto);
  }

  @Patch(':id/materials/:materialId')
  @ApiOperation({ summary: 'Actualizar material' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'materialId', type: Number })
  @ApiResponse({ status: 200, description: 'Material actualizado' })
  @ApiResponse({
    status: 404,
    description: 'Material o ritual no encontrado',
  })
  async updateMaterial(
    @Param('id', ParseIntPipe) ritualId: number,
    @Param('materialId', ParseIntPipe) materialId: number,
    @Body() dto: UpdateRitualMaterialDto,
  ) {
    return this.adminService.updateMaterial(ritualId, materialId, dto);
  }

  @Delete(':id/materials/:materialId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar material' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'materialId', type: Number })
  @ApiResponse({ status: 204, description: 'Material eliminado' })
  @ApiResponse({
    status: 404,
    description: 'Material o ritual no encontrado',
  })
  async deleteMaterial(
    @Param('id', ParseIntPipe) ritualId: number,
    @Param('materialId', ParseIntPipe) materialId: number,
  ) {
    await this.adminService.deleteMaterial(ritualId, materialId);
  }
}
