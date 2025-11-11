import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class ReadingShareService {
  constructor(private readonly configService: ConfigService) {}

  generateShareToken(): string {
    const length = Math.floor(crypto.randomInt(5)) + 8; // Entre 8 y 12 caracteres
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(chars.length);
      token += chars.charAt(randomIndex);
    }

    return token;
  }

  generateShareUrl(token: string): string {
    const baseUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return `${baseUrl}/shared/${token}`;
  }

  async validateTokenUniqueness(
    token: string,
    checkFn: (token: string) => Promise<boolean>,
  ): Promise<string> {
    const maxAttempts = 10;
    let attempts = 0;
    let uniqueToken = token;

    while (attempts < maxAttempts) {
      const exists = await checkFn(uniqueToken);
      if (!exists) {
        return uniqueToken;
      }
      uniqueToken = this.generateShareToken();
      attempts++;
    }

    throw new HttpException(
      'No se pudo generar un token único. Intente nuevamente.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
