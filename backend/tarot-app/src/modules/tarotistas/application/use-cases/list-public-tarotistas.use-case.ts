import { Injectable, Inject } from '@nestjs/common';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { GetPublicTarotistasFilterDto } from '../dto';
import { Tarotista } from '../../infrastructure/entities/tarotista.entity';

@Injectable()
export class ListPublicTarotistasUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepository: ITarotistaRepository,
  ) {}

  async execute(filterDto: GetPublicTarotistasFilterDto): Promise<{
    data: Tarotista[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.tarotistaRepository.findAllPublic(filterDto);
  }
}
