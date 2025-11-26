import { Injectable, Inject } from '@nestjs/common';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { UpdateTarotistaDto } from '../dto/update-tarotista.dto';
import { Tarotista } from '../../infrastructure/entities/tarotista.entity';

/**
 * Use Case: Update Tarotista Information
 * Responsibility: Update tarotista profile data
 */
@Injectable()
export class UpdateTarotistaUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepo: ITarotistaRepository,
  ) {}

  async execute(id: number, dto: UpdateTarotistaDto): Promise<Tarotista> {
    return await this.tarotistaRepo.update(id, dto);
  }
}
