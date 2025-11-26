import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controller
import { AuthController } from './auth.controller';

// Entities
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';

// Infrastructure
import { TypeOrmRefreshTokenRepository } from './infrastructure/repositories/typeorm-refresh-token.repository';
import { TypeOrmPasswordResetRepository } from './infrastructure/repositories/typeorm-password-reset.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

// Domain Interfaces (for DI tokens)
import {
  REFRESH_TOKEN_REPOSITORY,
  PASSWORD_RESET_REPOSITORY,
} from './domain/interfaces/repository.tokens';

// Application
import { AuthOrchestratorService } from './application/services/auth-orchestrator.service';
import { TokenCleanupService } from './application/services/token-cleanup.service';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';

// Other modules
import { UsersModule } from '../users/users.module';
import { SecurityModule } from '../security/security.module';

// Old services (mantener temporalmente para compatibilidad)
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetCleanupService } from './password-reset-cleanup.service';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    SecurityModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([RefreshToken, PasswordResetToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your_jwt_secret'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // ========== NEW LAYERED ARCHITECTURE ==========

    // Infrastructure - Repositories
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: TypeOrmRefreshTokenRepository,
    },
    {
      provide: PASSWORD_RESET_REPOSITORY,
      useClass: TypeOrmPasswordResetRepository,
    },

    // Infrastructure - Strategies
    JwtStrategy,

    // Application - Use Cases
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,

    // Application - Services
    AuthOrchestratorService,
    TokenCleanupService,

    // ========== OLD SERVICES (for backward compatibility) ==========
    AuthService,
    RefreshTokenService,
    PasswordResetService,
    PasswordResetCleanupService,
  ],
  exports: [
    // Export new orchestrator
    AuthOrchestratorService,
    REFRESH_TOKEN_REPOSITORY,
    PASSWORD_RESET_REPOSITORY,

    // Export old services for backward compatibility
    AuthService,
    JwtModule,
    RefreshTokenService,
    PasswordResetService,
  ],
})
export class AuthModule {}
