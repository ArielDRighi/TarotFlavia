import { PasswordResetToken } from '../../entities/password-reset-token.entity';

export interface IPasswordResetRepository {
  /**
   * Genera un token de reseteo de contraseña
   * @returns Token en texto plano y fecha de expiración
   */
  generateResetToken(
    email: string,
  ): Promise<{ token: string; expiresAt: Date }>;

  /**
   * Valida un token de reseteo de contraseña
   * @throws BadRequestException si el token es inválido o expirado
   */
  validateToken(plainToken: string): Promise<PasswordResetToken>;

  /**
   * Marca un token como usado
   */
  markTokenAsUsed(token: PasswordResetToken): Promise<void>;

  /**
   * Elimina tokens expirados hace más de 7 días
   * @returns Número de tokens eliminados
   */
  deleteExpiredTokens(): Promise<number>;
}
