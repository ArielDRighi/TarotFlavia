import { RefreshToken } from '../../entities/refresh-token.entity';
import { User } from '../../../users/entities/user.entity';

export interface IRefreshTokenRepository {
  /**
   * Crea un nuevo refresh token para un usuario
   * @returns Objeto con el token en texto plano y la entidad guardada
   */
  createRefreshToken(
    user: User,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<{ token: string; refreshToken: RefreshToken }>;

  /**
   * Encuentra un refresh token por el token en texto plano
   * Usa SHA-256 hash para búsqueda rápida O(1) con índice, luego valida con bcrypt
   */
  findTokenByPlainToken(plainToken: string): Promise<RefreshToken | null>;

  /**
   * Encuentra un refresh token por el hash del token
   * Compara el token en texto plano con todos los tokens hasheados del usuario
   */
  findTokenByHash(
    plainToken: string,
    userId: number,
  ): Promise<RefreshToken | null>;

  /**
   * Revoca un refresh token específico
   */
  revokeToken(tokenId: string): Promise<void>;

  /**
   * Revoca todos los refresh tokens de un usuario
   */
  revokeAllUserTokens(userId: number): Promise<void>;

  /**
   * Elimina tokens expirados hace más de N días (configurable)
   * @returns Número de tokens eliminados
   */
  deleteExpiredTokens(): Promise<number>;
}
