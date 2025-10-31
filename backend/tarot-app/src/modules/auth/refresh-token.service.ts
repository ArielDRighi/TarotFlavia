import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

    const refreshToken = this.refreshTokenRepository.create({
      userId: user.id,
      user,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
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
   * Compara el token en texto plano con todos los tokens activos en la BD
   */
  async findTokenByPlainToken(
    plainToken: string,
  ): Promise<RefreshToken | null> {
    // Obtener todos los tokens no revocados
    const allTokens = await this.refreshTokenRepository.find({
      where: { revokedAt: IsNull() },
      relations: ['user'],
    });

    // Comparar el token en texto plano con cada token hasheado
    for (const token of allTokens) {
      const isMatch = await bcrypt.compare(plainToken, token.token);
      if (isMatch) {
        return token;
      }
    }

    return null;
  }

  /**
   * Encuentra un refresh token por el hash del token
   * Compara el token en texto plano con todos los tokens hasheados del usuario
   */
  async findTokenByHash(
    plainToken: string,
    userId: number,
  ): Promise<RefreshToken | null> {
    const userTokens = await this.refreshTokenRepository.find({
      where: { userId },
      relations: ['user'],
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
   * Elimina tokens expirados hace más de 30 días
   * @returns Número de tokens eliminados
   */
  async deleteExpiredTokens(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .from(RefreshToken)
      .where('expires_at < :date', { date: thirtyDaysAgo })
      .andWhere('(revoked_at IS NULL OR revoked_at < :date)', {
        date: thirtyDaysAgo,
      })
      .execute();

    return result.affected || 0;
  }
}
