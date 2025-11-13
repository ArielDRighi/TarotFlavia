import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
  Logger,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { UserWithoutPassword } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { BanUserDto } from '../users/dto/ban-user.dto';
import { UserQueryDto } from '../users/dto/user-query.dto';
import { UpdateUserPlanDto } from '../users/dto/update-user-plan.dto';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditAction } from '../audit/enums/audit-action.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Admin - Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  private readonly logger = new Logger(AdminUsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios con paginación y filtros (solo administradores)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'banned', required: false, type: Boolean })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'lastLogin', 'email', 'name'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios paginada con filtros',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAllWithFilters(query);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Obtener detalles de usuario con estadísticas (solo administradores)',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Detalles del usuario con estadísticas',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getUserDetail(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserDetail(id);
  }

  @Post(':id/ban')
  @ApiOperation({ summary: 'Banear usuario (solo administradores)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ type: BanUserDto })
  @ApiResponse({ status: 201, description: 'Usuario baneado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async banUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() banUserDto: BanUserDto,
    @Req() req: Request & { user: { id: number; roles: string[] } },
  ): Promise<{ message: string; user: UserWithoutPassword }> {
    const oldUser = await this.usersService.findById(id);
    if (!oldUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const user = await this.usersService.banUser(id, banUserDto.reason);

    await this.auditLogService.log({
      userId: req.user.id,
      targetUserId: id,
      action: AuditAction.USER_BANNED,
      entityType: 'User',
      entityId: String(id),
      oldValue: { bannedAt: oldUser.bannedAt, banReason: oldUser.banReason },
      newValue: { bannedAt: user.bannedAt, banReason: user.banReason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    this.logger.warn(
      `Admin action: User banned - userId: ${id}, reason: ${banUserDto.reason}`,
    );
    return {
      message: 'Usuario baneado exitosamente',
      user,
    };
  }

  @Post(':id/unban')
  @ApiOperation({ summary: 'Desbanear usuario (solo administradores)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario desbaneado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async unbanUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: { id: number; roles: string[] } },
  ): Promise<{ message: string; user: UserWithoutPassword }> {
    const oldUser = await this.usersService.findById(id);
    if (!oldUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const user = await this.usersService.unbanUser(id);

    await this.auditLogService.log({
      userId: req.user.id,
      targetUserId: id,
      action: AuditAction.USER_UNBANNED,
      entityType: 'User',
      entityId: String(id),
      oldValue: { bannedAt: oldUser.bannedAt, banReason: oldUser.banReason },
      newValue: { bannedAt: user.bannedAt, banReason: user.banReason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    this.logger.log(`Admin action: User unbanned - userId: ${id}`);
    return {
      message: 'Usuario desbaneado exitosamente',
      user,
    };
  }

  @Patch(':id/plan')
  @ApiOperation({
    summary: 'Actualizar plan de usuario (solo administradores)',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ type: UpdateUserPlanDto })
  @ApiResponse({ status: 200, description: 'Plan actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateUserPlan(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserPlanDto: UpdateUserPlanDto,
    @Req() req: Request & { user: { id: number; roles: string[] } },
  ): Promise<{ message: string; user: UserWithoutPassword }> {
    const oldUser = await this.usersService.findById(id);
    if (!oldUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const user = await this.usersService.updatePlan(id, updateUserPlanDto);

    await this.auditLogService.log({
      userId: req.user.id,
      targetUserId: id,
      action: AuditAction.PLAN_CHANGED,
      entityType: 'User',
      entityId: String(id),
      oldValue: { plan: oldUser.plan },
      newValue: { plan: user.plan },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    this.logger.log(
      `Admin action: User plan updated - userId: ${id}, newPlan: ${updateUserPlanDto.plan}`,
    );
    return {
      message: 'Plan actualizado exitosamente',
      user,
    };
  }

  @Post(':id/roles/tarotist')
  @ApiOperation({
    summary: 'Promover usuario a TAROTIST (solo administradores)',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 201,
    description: 'Rol TAROTIST agregado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Usuario ya tiene el rol TAROTIST' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async addTarotistRole(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: { id: number; roles: string[] } },
  ): Promise<{ message: string; user: UserWithoutPassword }> {
    const oldUser = await this.usersService.findById(id);
    if (!oldUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const user = await this.usersService.addTarotistRole(id);

    await this.auditLogService.log({
      userId: req.user.id,
      targetUserId: id,
      action: AuditAction.ROLE_ADDED,
      entityType: 'User',
      entityId: String(id),
      oldValue: { roles: oldUser.roles },
      newValue: { roles: user.roles },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    this.logger.log(
      `Admin action: TAROTIST role added - userId: ${id}, email: ${user.email}`,
    );
    return {
      message: 'Rol TAROTIST agregado exitosamente',
      user,
    };
  }

  @Post(':id/roles/admin')
  @ApiOperation({
    summary: 'Promover usuario a ADMIN (solo administradores)',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 201,
    description: 'Rol ADMIN agregado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Usuario ya tiene el rol ADMIN' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async addAdminRole(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: { id: number; roles: string[] } },
    
  ): Promise<{ message: string; user: UserWithoutPassword }> {
    const oldUser = await this.usersService.findById(id);
    if (!oldUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const user = await this.usersService.addAdminRole(id);

    await this.auditLogService.log({
      userId: req.user.id,
      targetUserId: id,
      action: AuditAction.ROLE_ADDED,
      entityType: 'User',
      entityId: String(id),
      oldValue: { roles: oldUser.roles },
      newValue: { roles: user.roles },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    this.logger.warn(
      `Admin action: ADMIN role added - userId: ${id}, email: ${user.email}`,
    );
    return {
      message: 'Rol ADMIN agregado exitosamente',
      user,
    };
  }

  @Delete(':id/roles/:role')
  @ApiOperation({
    summary: 'Eliminar rol de usuario (solo administradores)',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiParam({
    name: 'role',
    description: 'Rol a eliminar (tarotist o admin)',
    enum: ['tarotist', 'admin'],
  })
  @ApiResponse({
    status: 200,
    description: 'Rol eliminado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description:
      'Usuario no tiene el rol especificado o se intenta eliminar CONSUMER',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async removeRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('role') role: string,
    @Req() req: Request & { user: { id: number; roles: string[] } },
    
  ) {
    // Whitelist de roles permitidos para prevenir inyecciones
    const roleMap: Record<string, UserRole> = {
      tarotist: UserRole.TAROTIST,
      admin: UserRole.ADMIN,
    };

    const roleEnum = roleMap[role.toLowerCase()];
    if (!roleEnum) {
      throw new BadRequestException('Rol inválido');
    }

    const oldUser = await this.usersService.findById(id);
    if (!oldUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const user = await this.usersService.removeRole(id, roleEnum);

    await this.auditLogService.log({
      userId: req.user.id,
      targetUserId: id,
      action: AuditAction.ROLE_REMOVED,
      entityType: 'User',
      entityId: String(id),
      oldValue: { roles: oldUser.roles },
      newValue: { roles: user.roles },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    this.logger.log(
      `Admin action: Role removed - userId: ${id}, role: ${roleEnum}, email: ${user.email}`,
    );
    return {
      message: `Rol ${role.toUpperCase()} eliminado exitosamente`,
      user,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario (solo administradores)' })
  @ApiParam({ name: 'id', description: 'ID del usuario a eliminar' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requieren permisos de administrador',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: { id: number; roles: string[] } },
    
  ): Promise<{ message: string }> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const result = await this.usersService.remove(id);
    if (!result.affected) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.auditLogService.log({
      userId: req.user.id,
      targetUserId: id,
      action: AuditAction.USER_DELETED,
      entityType: 'User',
      entityId: String(id),
      oldValue: { email: user.email, roles: user.roles, plan: user.plan },
      newValue: { deleted: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    this.logger.warn(`Admin action: User deleted - userId: ${id}`);
    return { message: 'Usuario eliminado exitosamente' };
  }
}
