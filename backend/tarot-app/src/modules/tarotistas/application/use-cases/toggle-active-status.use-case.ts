import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { Tarotista } from '../../entities/tarotista.entity';

/**
 * Use case: Toggle tarotista active status
 */
@Injectable()
export class ToggleActiveStatusUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepository: ITarotistaRepository,
  ) {}

  /**
   * Toggle active status (activate/deactivate)
   */
  async execute(tarotistaId: number): Promise<Tarotista> {
    const tarotista = await this.tarotistaRepository.findById(tarotistaId);

    if (!tarotista) {
      throw new NotFoundException(`Tarotista with ID ${tarotistaId} not found`);
    }

    return await this.tarotistaRepository.update(tarotistaId, {
      isActive: !tarotista.isActive,
    });
  }

  /**
   * Set specific active status
   */
  async setStatus(tarotistaId: number, isActive: boolean): Promise<Tarotista> {
    const tarotista = await this.tarotistaRepository.findById(tarotistaId);

    if (!tarotista) {
      throw new NotFoundException(`Tarotista with ID ${tarotistaId} not found`);
    }

    return await this.tarotistaRepository.update(tarotistaId, { isActive });
  }
}
