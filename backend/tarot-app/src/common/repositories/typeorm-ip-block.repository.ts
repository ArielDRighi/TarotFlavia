import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { IpBlock } from '../entities/ip-block.entity';
import { IIpBlockRepository } from '../interfaces/ip-block-repository.interface';

/**
 * Implementación TypeORM del repositorio de bloqueos de IP.
 * Persiste los bloqueos en la tabla `ip_blocks`.
 */
@Injectable()
export class TypeOrmIpBlockRepository implements IIpBlockRepository {
  constructor(
    @InjectRepository(IpBlock)
    private readonly repository: Repository<IpBlock>,
  ) {}

  async upsert(ip: string, blockedUntil: Date, reason: string): Promise<void> {
    // Buscar si ya existe un bloqueo para esta IP y reemplazarlo
    const existing = await this.repository.findOne({ where: { ip } });
    if (existing) {
      await this.repository.update({ ip }, { blockedUntil, reason });
    } else {
      const block = this.repository.create({ ip, blockedUntil, reason });
      await this.repository.save(block);
    }
  }

  async remove(ip: string): Promise<void> {
    await this.repository.delete({ ip });
  }

  async findActive(): Promise<IpBlock[]> {
    return this.repository.find({
      where: { blockedUntil: MoreThan(new Date()) },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.repository.delete({
      blockedUntil: LessThanOrEqual(new Date()),
    });
  }
}
