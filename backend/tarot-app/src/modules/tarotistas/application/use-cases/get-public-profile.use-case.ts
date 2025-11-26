import { Injectable, Inject } from '@nestjs/common';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { Tarotista } from '../../entities/tarotista.entity';

@Injectable()
export class GetPublicProfileUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepository: ITarotistaRepository,
  ) {}

  async execute(id: number): Promise<Tarotista | null> {
    return await this.tarotistaRepository.findPublicProfile(id);
  }
}
