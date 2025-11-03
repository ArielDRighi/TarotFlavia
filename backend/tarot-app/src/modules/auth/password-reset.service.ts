import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async generateResetToken(
    email: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generar token aleatorio de 32 bytes
    const plainToken = crypto.randomBytes(32).toString('hex');

    // Hash del token para almacenar en DB
    const hashedToken = await bcrypt.hash(plainToken, 10);

    // Calcular fecha de expiración (1 hora)
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Crear y guardar el token
    const resetToken = this.passwordResetTokenRepository.create({
      userId: user.id,
      token: hashedToken,
      expiresAt,
      usedAt: null,
    });

    await this.passwordResetTokenRepository.save(resetToken);

    return { token: plainToken, expiresAt };
  }

  async validateToken(plainToken: string): Promise<PasswordResetToken> {
    // Buscar todos los tokens no usados
    const tokens = await this.passwordResetTokenRepository
      .createQueryBuilder('token')
      .where('token.usedAt IS NULL')
      .getMany();

    // Verificar cada token hasheado
    for (const token of tokens) {
      const isValid = await bcrypt.compare(plainToken, token.token);
      if (isValid) {
        // Verificar que no esté expirado
        if (token.expiresAt < new Date()) {
          throw new BadRequestException('Token has expired');
        }

        // Verificar que no esté usado
        if (token.usedAt) {
          throw new BadRequestException('Token has already been used');
        }

        return token;
      }
    }

    throw new BadRequestException('Invalid token');
  }

  async markTokenAsUsed(token: PasswordResetToken): Promise<void> {
    token.usedAt = new Date();
    await this.passwordResetTokenRepository.save(token);
  }

  async deleteExpiredTokens(): Promise<number> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await this.passwordResetTokenRepository
      .createQueryBuilder()
      .delete()
      .from(PasswordResetToken)
      .where('created_at < :date', { date: sevenDaysAgo })
      .execute();

    return result.affected || 0;
  }
}
