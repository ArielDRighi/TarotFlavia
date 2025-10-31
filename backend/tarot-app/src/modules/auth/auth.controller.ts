import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Autenticación')
@Controller('auth')
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests por minuto para endpoints de autenticación
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes. Límite: 5 por minuto',
  })
  async register(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    return this.authService.register(createUserDto, ipAddress, userAgent);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes. Límite: 5 por minuto',
  })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    return this.authService.login(user, ipAddress, userAgent);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens refrescados exitosamente',
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes. Límite: 5 por minuto',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    return this.authService.refresh(
      refreshTokenDto.refreshToken,
      ipAddress,
      userAgent,
    );
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión (revocar refresh token actual)' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes. Límite: 5 por minuto',
  })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Post('logout-all')
  @ApiOperation({
    summary: 'Cerrar todas las sesiones (revocar todos los refresh tokens)',
  })
  @ApiResponse({
    status: 200,
    description: 'Todas las sesiones cerradas exitosamente',
  })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes. Límite: 5 por minuto',
  })
  async logoutAll(@Req() req: Request) {
    const user = req.user as { userId: number } | undefined;
    if (!user || !user.userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.authService.logoutAll(user.userId);
  }
}
