import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import { UsersService } from '../../../users/users.service';
import { IPasswordResetRepository } from '../../domain/interfaces/password-reset-repository.interface';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TypeOrmPasswordResetRepository
  implements IPasswordResetRepository
{
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    private readonly usersService: UsersService,
  ) {}

  async generateResetToken(
    email: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    // Verify that user exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Security: Don't reveal whether email exists (prevent user enumeration)
      // Return dummy values that won't work but don't expose information
      return {
        token: crypto.randomBytes(32).toString('hex'),
        expiresAt: new Date(Date.now() + 3600000),
      };
    }

    // Generate random 32-byte token
    const plainToken = crypto.randomBytes(32).toString('hex');

    // Hash token for database storage
    const hashedToken = await bcrypt.hash(plainToken, 10);

    // Calculate expiration date (1 hour)
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Create and save token
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
    // Find all unused and non-expired tokens to reduce comparison overhead
    const now = new Date();
    const tokens = await this.passwordResetTokenRepository
      .createQueryBuilder('token')
      .where('token.usedAt IS NULL')
      .andWhere('token.expiresAt > :now', { now })
      .getMany();

    // Check each hashed token
    for (const token of tokens) {
      const isValid = await bcrypt.compare(plainToken, token.token);
      if (isValid) {
        // CRITICAL BUG FIX: Double-check expiration after finding the correct token
        // The query filter may not catch race conditions or clock skew
        if (token.expiresAt <= now) {
          throw new BadRequestException('Token has expired');
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
