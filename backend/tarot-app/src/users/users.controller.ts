import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @ApiResponse({ status: 200, description: 'Perfil recuperado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getProfile(@Request() req: { user: { userId: number } }) {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // No devolver la contraseña en la respuesta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'Actualizar perfil del usuario actual' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateProfile(
    @Request() req: { user: { userId: number } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.userId;
    return this.usersService.update(userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios (solo admin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado (no es admin)' })
  async findAll(@Request() req: { user: { isAdmin: boolean } }) {
    // Verificar si es administrador
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Acceso denegado: se requieren permisos de administrador',
      );
    }

    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findOne(
    @Request() req: { user: { userId: number; isAdmin: boolean } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    // Permitir acceso si es el propio usuario o un administrador
    if (req.user.userId !== id && !req.user.isAdmin) {
      throw new ForbiddenException('Acceso denegado');
    }

    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario a eliminar' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async remove(
    @Request() req: { user: { userId: number; isAdmin: boolean } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    // Solo administradores o el propio usuario pueden eliminar cuentas
    if (req.user.userId !== id && !req.user.isAdmin) {
      throw new ForbiddenException('Acceso denegado');
    }

    const result = await this.usersService.remove(id);
    if (!result.affected) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return { message: 'Usuario eliminado exitosamente' };
  }
}
