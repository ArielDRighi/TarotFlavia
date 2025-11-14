import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, IsNull } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Genera un token aleatorio y seguro
   */
  async generateToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(64, (err, buffer) => {
        if (err) reject(err);
        resolve(buffer.toString('hex'));
      });
    });
  }

  /**
   * Hashea un token usando bcrypt
   */
  async hashToken(token: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(token, saltRounds);
  }

  /**
   * Genera un hash SHA-256 rápido para indexación
   */
  private generateTokenHash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Crea un nuevo refresh token para un usuario
   * @returns Objeto con el token en texto plano y la entidad guardada
   */
  async createRefreshToken(
    user: User,
    ipAddress: string | null = null,
    userAgent: string | null = null,
  ): Promise<{ token: string; refreshToken: RefreshToken }> {
    const plainToken = await this.generateToken();
    const hashedToken = await this.hashToken(plainToken);
    const tokenHash = this.generateTokenHash(plainToken);

    const expiryDays =
      this.configService.get<number>('REFRESH_TOKEN_EXPIRY_DAYS') || 7;

    const refreshToken = this.refreshTokenRepository.create({
      userId: user.id,
      user,
      token: hashedToken,
      tokenHash,
      expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
      ipAddress,
      userAgent,
    });

    const savedToken = await this.refreshTokenRepository.save(refreshToken);

    return {
      token: plainToken,
      refreshToken: savedToken,
    };
  }

  /**
   * Encuentra un refresh token por el hash del token sin conocer el userId
   * Usa SHA-256 hash para búsqueda rápida O(1) con índice, luego valida con bcrypt
   */
  async findTokenByPlainToken(
    plainToken: string,
  ): Promise<RefreshToken | null> {
    // Generar hash SHA-256 para búsqueda indexada
    const tokenHash = this.generateTokenHash(plainToken);

    // Búsqueda O(1) por índice
    // user se carga automáticamente por eager: true en la entidad
    const token = await this.refreshTokenRepository.findOne({
      where: { tokenHash, revokedAt: IsNull() },
    });

    if (!token) {
      return null;
    }

    // Validación final con bcrypt para seguridad
    const isMatch = await bcrypt.compare(plainToken, token.token);
    if (!isMatch) {
      return null;
    }

    return token;
  }

  /**
   * Encuentra un refresh token por el hash del token
   * Compara el token en texto plano con todos los tokens hasheados del usuario
   */
  async findTokenByHash(
    plainToken: string,
    userId: number,
  ): Promise<RefreshToken | null> {
    // user se carga automáticamente por eager: true en la entidad
    const userTokens = await this.refreshTokenRepository.find({
      where: { userId },
    });

    for (const token of userTokens) {
      const isMatch = await bcrypt.compare(plainToken, token.token);
      if (isMatch) {
        return token;
      }
    }

    return null;
  }

  /**
   * Revoca un refresh token específico
   */
  async revokeToken(tokenId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { id: tokenId },
      { revokedAt: new Date() },
    );
  }

  /**
   * Revoca todos los refresh tokens de un usuario
   */
  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  /**
   * Elimina tokens expirados hace más de N días (configurable)
   * @returns Número de tokens eliminados
   */
  async deleteExpiredTokens(): Promise<number> {
    const retentionDays =
      this.configService.get<number>('REFRESH_TOKEN_RETENTION_DAYS') || 30;

    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - retentionDays);

    const result = await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .from(RefreshToken)
      .where('expires_at < :date', { date: retentionDate })
      .andWhere('(revoked_at IS NULL OR revoked_at < :date)', {
        date: retentionDate,
      })
      .execute();

    return result.affected || 0;
  }
}
