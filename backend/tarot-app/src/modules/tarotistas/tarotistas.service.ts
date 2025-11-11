import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { TarotistaConfig } from './entities/tarotista-config.entity';
import { TarotistaCardMeaning } from './entities/tarotista-card-meaning.entity';

@Injectable()
export class TarotistasService {
  constructor(
    @InjectRepository(TarotistaConfig)
    private readonly configRepository: Repository<TarotistaConfig>,
    @InjectRepository(TarotistaCardMeaning)
    private readonly meaningRepository: Repository<TarotistaCardMeaning>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async updateTarotistaConfig(
    tarotistaId: number,
    configData: Partial<TarotistaConfig>,
  ): Promise<TarotistaConfig> {
    const existingConfig = await this.configRepository.findOne({
      where: { tarotistaId },
    });

    if (!existingConfig) {
      throw new NotFoundException(
        `Tarotista configuration not found for ID ${tarotistaId}`,
      );
    }

    const updatedConfig = await this.configRepository.save({
      ...existingConfig,
      ...configData,
    });

    this.eventEmitter.emit('tarotista.config.updated', {
      tarotistaId,
      previousConfig: existingConfig,
      newConfig: updatedConfig,
    });

    return updatedConfig;
  }

  async updateCardMeaning(
    tarotistaId: number,
    cardId: number,
    meaningData: Partial<TarotistaCardMeaning>,
  ): Promise<TarotistaCardMeaning> {
    const existingMeaning = await this.meaningRepository.findOne({
      where: { tarotistaId, cardId },
    });

    let savedMeaning: TarotistaCardMeaning;

    if (existingMeaning) {
      savedMeaning = await this.meaningRepository.save({
        ...existingMeaning,
        ...meaningData,
      });
    } else {
      const newMeaning = this.meaningRepository.create({
        tarotistaId,
        cardId,
        ...meaningData,
      });
      savedMeaning = await this.meaningRepository.save(newMeaning);
    }

    this.eventEmitter.emit('tarotista.meanings.updated', {
      tarotistaId,
      cardId,
      previousMeaning: existingMeaning,
      newMeaning: savedMeaning,
    });

    return savedMeaning;
  }

  async deleteCardMeaning(tarotistaId: number, cardId: number): Promise<void> {
    const existingMeaning = await this.meaningRepository.findOne({
      where: { tarotistaId, cardId },
    });

    if (!existingMeaning) {
      throw new NotFoundException(
        `Card meaning not found for tarotista ${tarotistaId} and card ${cardId}`,
      );
    }

    await this.meaningRepository.delete({ tarotistaId, cardId });

    this.eventEmitter.emit('tarotista.meanings.updated', {
      tarotistaId,
      cardId,
      previousMeaning: existingMeaning,
      newMeaning: null,
    });
  }
}
