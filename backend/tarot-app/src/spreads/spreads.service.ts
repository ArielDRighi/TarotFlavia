import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotSpread } from './entities/tarot-spread.entity';
import { CreateSpreadDto } from './dto/create-spread.dto';
import { UpdateSpreadDto } from './dto/update-spread.dto';

@Injectable()
export class SpreadsService {
  constructor(
    @InjectRepository(TarotSpread)
    private spreadRepository: Repository<TarotSpread>,
  ) {}

  async findAll(): Promise<TarotSpread[]> {
    return this.spreadRepository.find();
  }

  async findById(id: number): Promise<TarotSpread> {
    const spread = await this.spreadRepository.findOne({
      where: { id },
    });

    if (!spread) {
      throw new NotFoundException(`Tirada con ID ${id} no encontrada`);
    }

    return spread;
  }

  async create(createSpreadDto: CreateSpreadDto): Promise<TarotSpread> {
    const existingSpread = await this.spreadRepository.findOne({
      where: { name: createSpreadDto.name },
    });

    if (existingSpread) {
      throw new ConflictException(
        `Ya existe una tirada con el nombre: ${createSpreadDto.name}`,
      );
    }

    const spread = this.spreadRepository.create(createSpreadDto);
    return this.spreadRepository.save(spread);
  }

  async update(
    id: number,
    updateSpreadDto: UpdateSpreadDto,
  ): Promise<TarotSpread> {
    const spread = await this.findById(id);
    Object.assign(spread, updateSpreadDto);
    return this.spreadRepository.save(spread);
  }

  async remove(id: number): Promise<void> {
    const result = await this.spreadRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Tirada con ID ${id} no encontrada`);
    }
  }
}
