import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';
import { AuthOrchestratorService } from './application/services/auth-orchestrator.service';
import { CreateUserDto } from '../users/application/dto/create-user.dto';
import { LoginDto } from './application/dto/login.dto';
import { RefreshTokenDto } from './application/dto/refresh-token.dto';
import { ForgotPasswordDto } from './application/dto/forgot-password.dto';
import { ResetPasswordDto } from './application/dto/reset-password.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthOrchestratorService) {}

  @Post('register')
  @RateLimit({ ttl: 3600, limit: 3, blockDuration: 3600 }) // 3 registros/hora por IP
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // Enforce: 3 req/hour (ttl in ms)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea una nueva cuenta de usuario en el sistema. Por defecto, los usuarios se crean con plan FREE. El email debe ser único en el sistema.',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      ejemplo1: {
        summary: 'Registro de usuario básico',
        value: {
          email: 'usuario@ejemplo.com',
          name: 'Juan Pérez',
          password: 'MiPassword123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        id: 1,
        email: 'usuario@ejemplo.com',
        name: 'Juan Pérez',
        plan: 'free',
        roles: ['consumer'],
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
    schema: {
      example: {
        statusCode: 409,
        message: 'El email ya está en uso',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Please provide a valid email',
          'Password must be at least 6 characters long',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes. Límite: 3 registros por hora',
    schema: {
      example: {
        statusCode: 429,
        message: 'Too Many Requests',
      },
    },
  })
  async register(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    return this.authService.register(createUserDto, ipAddress, userAgent);
  }

  @Post('login')
  @RateLimit({ ttl: 900, limit: 5, blockDuration: 3600 }) // 5 intentos/15min, bloqueo 1 hora
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // Enforce: 5 req/15min (ttl in ms)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica un usuario y devuelve access_token y refresh_token. El access_token expira en 15 minutos, el refresh_token en 7 días.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      ejemplo1: {
        summary: 'Login básico',
        value: {
          email: 'usuario@ejemplo.com',
          password: 'MiPassword123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInBsYW4iOiJmcmVlIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        refresh_token:
          'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4gZXhhbXBsZSB0aGF0IGlzIGxvbmdlcg==',
        user: {
          id: 1,
          email: 'usuario@ejemplo.com',
          name: 'Juan Pérez',
          plan: 'free',
          roles: ['consumer'],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Credenciales inválidas',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes. Límite: 5 intentos cada 15 minutos',
    schema: {
      example: {
        statusCode: 429,
        message: 'Too Many Requests',
      },
    },
  })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      ipAddress,
      userAgent,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.authService.login(user.id, user.email, ipAddress, userAgent);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refrescar token de acceso',
    description:
      'Genera un nuevo access_token usando un refresh_token válido. Usa este endpoint cuando el access_token expire.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      ejemplo1: {
        summary: 'Refrescar token',
        value: {
          refreshToken:
            'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4gZXhhbXBsZSB0aGF0IGlzIGxvbmdlcg==',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refrescados exitosamente',
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInBsYW4iOiJmcmVlIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        refresh_token:
          'bmV3IHJlZnJlc2ggdG9rZW4gZXhhbXBsZSB0aGF0IGlzIGFsc28gbG9uZw==',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid or expired refresh token',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes',
    schema: {
      example: {
        statusCode: 429,
        message: 'Too Many Requests',
      },
    },
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
  @HttpCode(200)
  @ApiOperation({
    summary: 'Cerrar sesión (revocar refresh token actual)',
    description:
      'Revoca el refresh_token proporcionado, cerrando solo la sesión actual. Para cerrar todas las sesiones usa /logout-all',
  })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      ejemplo1: {
        summary: 'Logout de sesión actual',
        value: {
          refreshToken:
            'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4gZXhhbXBsZSB0aGF0IGlzIGxvbmdlcg==',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
    schema: {
      example: {
        message: 'Logout successful',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid refresh token',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes',
  })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Post('logout-all')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cerrar todas las sesiones (revocar todos los refresh tokens)',
    description:
      'Revoca todos los refresh_tokens del usuario, cerrando todas las sesiones activas en todos los dispositivos. Requiere autenticación con access_token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Todas las sesiones cerradas exitosamente',
    schema: {
      example: {
        message: 'All sessions logged out successfully',
        revokedTokens: 3,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes',
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
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // Enforce: 3 req/hour (ttl in ms)
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
