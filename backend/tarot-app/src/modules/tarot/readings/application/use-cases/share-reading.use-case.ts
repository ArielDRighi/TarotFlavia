import { Injectable, Inject, Logger } from '@nestjs/common';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
import { ReadingShareService } from '../services/reading-share.service';

@Injectable()
export class ShareReadingUseCase {
  private readonly logger = new Logger(ShareReadingUseCase.name);

  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
    private readonly validator: ReadingValidatorService,
    private readonly shareService: ReadingShareService,
  ) {}

  async execute(
    readingId: number,
    userId: number,
  ): Promise<{ sharedToken: string; shareUrl: string; isPublic: boolean }> {
    // Verificar que el usuario sea premium
    await this.validator.validateUserIsPremium(userId);

    // Verificar ownership
    const reading = await this.validator.validateReadingOwnership(
      readingId,
      userId,
    );

    // Si ya tiene un token, retornarlo
    if (reading.sharedToken && reading.isPublic) {
      return {
        sharedToken: reading.sharedToken,
        shareUrl: this.shareService.generateShareUrl(reading.sharedToken),
        isPublic: reading.isPublic,
      };
    }

    // Generar nuevo token único
    const baseToken = this.shareService.generateShareToken();
    const sharedToken = await this.shareService.validateTokenUniqueness(
      baseToken,
      async (token) => {
        const existing = await this.readingRepo.findByShareToken(token);
        return existing !== null;
      },
    );

    // Actualizar la lectura
    await this.readingRepo.update(readingId, {
      sharedToken,
      isPublic: true,
    });

    const shareUrl = this.shareService.generateShareUrl(sharedToken);

    this.logger.log(`Reading ${readingId} shared with token ${sharedToken}`);

    return {
      sharedToken,
      shareUrl,
      isPublic: true,
    };
  }
}
