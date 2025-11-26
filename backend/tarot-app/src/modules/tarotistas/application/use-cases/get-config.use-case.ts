import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { TarotistaConfig } from '../../entities/tarotista-config.entity';

/**
 * Use Case: Get Tarotista Configuration
 * Responsibility: Retrieve tarotista AI configuration
 */
@Injectable()
export class GetConfigUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepo: ITarotistaRepository,
  ) {}

  async execute(tarotistaId: number): Promise<TarotistaConfig> {
    const config =
      await this.tarotistaRepo.findConfigByTarotistaId(tarotistaId);

    if (!config) {
      throw new NotFoundException(
        `Configuración no encontrada para tarotista ID ${tarotistaId}`,
      );
    }

    return config;
  }
}
