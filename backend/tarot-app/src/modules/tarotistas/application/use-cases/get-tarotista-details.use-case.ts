import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { Tarotista } from '../../entities/tarotista.entity';

/**
 * Use case: Get tarotista details with related data
 */
@Injectable()
export class GetTarotistaDetailsUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepository: ITarotistaRepository,
  ) {}

  /**
   * Get tarotista by ID with config and custom meanings
   */
  async execute(tarotistaId: number): Promise<Tarotista> {
    const tarotista = await this.tarotistaRepository.findById(tarotistaId);

    if (!tarotista) {
      throw new NotFoundException(`Tarotista with ID ${tarotistaId} not found`);
    }

    return tarotista;
  }

  /**
   * Get tarotista by user ID
   */
  async byUserId(userId: number): Promise<Tarotista | null> {
    return await this.tarotistaRepository.findByUserId(userId);
  }
}
