import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { Tarotista } from '../../../tarotistas/entities/tarotista.entity';

/**
 * Implementación TypeORM del repositorio de tarotistas
 * Solo implementa las operaciones necesarias para el módulo users
 */
@Injectable()
export class TypeOrmTarotistaRepository implements ITarotistaRepository {
  constructor(
    @InjectRepository(Tarotista)
    private readonly tarotistasRepository: Repository<Tarotista>,
  ) {}

  async findByUserId(userId: number): Promise<Tarotista | null> {
    return this.tarotistasRepository.findOne({
      where: { userId },
    });
  }
}
