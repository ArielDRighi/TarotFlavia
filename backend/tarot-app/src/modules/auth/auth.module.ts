import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { SecurityModule } from '../security/security.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';
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
    AuthService,
    JwtStrategy,
    RefreshTokenService,
    PasswordResetService,
    PasswordResetCleanupService,
  ],
  exports: [AuthService, JwtModule, RefreshTokenService, PasswordResetService],
})
export class AuthModule {}
