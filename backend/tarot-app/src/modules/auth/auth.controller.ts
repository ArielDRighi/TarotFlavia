import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @RateLimit({ ttl: 3600, limit: 3, blockDuration: 3600 }) // 3 registros/hora por IP
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
  @RateLimit({ ttl: 900, limit: 5, blockDuration: 3600 }) // 5 intentos/15min, bloqueo 1 hora
  @HttpCode(200)
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
  @UseGuards(JwtAuthGuard)
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

  @Post('forgot-password')
  @RateLimit({ ttl: 3600, limit: 3, blockDuration: 3600 }) // 3 requests/hora por IP
  @HttpCode(200)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiBody({
    type: ForgotPasswordDto,
    examples: {
      example1: {
        value: {
          email: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Email de recuperación enviado',
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes. Límite: 5 por minuto',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      example1: {
        value: {
          token:
            'cb7e614a86f3ddf5e793af8a9c4e0f68291af6b058ca70c01422fee8d49bed65',
          newPassword: 'NewSecurePass123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido o expirado',
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes. Límite: 5 por minuto',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }
}
