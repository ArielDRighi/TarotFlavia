import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { TarotistasService } from './tarotistas.service';
import { TarotistaConfig } from './entities/tarotista-config.entity';
import { TarotistaCardMeaning } from './entities/tarotista-card-meaning.entity';

describe('TarotistasService', () => {
  let service: TarotistasService;
  let configRepository: Repository<TarotistaConfig>;
  let meaningRepository: Repository<TarotistaCardMeaning>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TarotistasService,
        {
          provide: getRepositoryToken(TarotistaConfig),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(TarotistaCardMeaning),
          useClass: Repository,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TarotistasService>(TarotistasService);
    configRepository = module.get<Repository<TarotistaConfig>>(
      getRepositoryToken(TarotistaConfig),
    );
    meaningRepository = module.get<Repository<TarotistaCardMeaning>>(
      getRepositoryToken(TarotistaCardMeaning),
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateTarotistaConfig', () => {
    it('should emit tarotista.config.updated event when config is updated', async () => {
      const tarotistaId = 1;
      const configData = {
        systemPrompt: 'Updated prompt',
        temperature: 0.8,
      };

      const existingConfig = {
        id: 1,
        tarotistaId,
        systemPrompt: 'Old prompt',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        version: 1,
        isActive: true,
      } as TarotistaConfig;

      jest.spyOn(configRepository, 'findOne').mockResolvedValue(existingConfig);
      jest.spyOn(configRepository, 'save').mockResolvedValue({
        ...existingConfig,
        ...configData,
      } as TarotistaConfig);

      await service.updateTarotistaConfig(tarotistaId, configData);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'tarotista.config.updated',
        {
          tarotistaId,
          previousConfig: existingConfig,
          newConfig: expect.objectContaining(configData) as TarotistaConfig,
        },
      );
    });
  });

  describe('updateCardMeaning', () => {
    it('should emit tarotista.meanings.updated event when meaning is updated', async () => {
      const tarotistaId = 1;
      const cardId = 5;
      const meaningData = {
        customMeaningUpright: 'New upright meaning',
        customKeywords: 'transformation,change',
      };

      const existingMeaning = {
        id: 1,
        tarotistaId,
        cardId,
        customMeaningUpright: 'Old meaning',
        customKeywords: 'old keywords',
      } as TarotistaCardMeaning;

      jest
        .spyOn(meaningRepository, 'findOne')
        .mockResolvedValue(existingMeaning);
      jest.spyOn(meaningRepository, 'save').mockResolvedValue({
        ...existingMeaning,
        ...meaningData,
      } as TarotistaCardMeaning);

      await service.updateCardMeaning(tarotistaId, cardId, meaningData);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'tarotista.meanings.updated',
        {
          tarotistaId,
          cardId,
          previousMeaning: existingMeaning,
          newMeaning: expect.objectContaining(
            meaningData,
          ) as TarotistaCardMeaning,
        },
      );
    });

    it('should emit tarotista.meanings.updated event when new meaning is created', async () => {
      const tarotistaId = 1;
      const cardId = 5;
      const meaningData = {
        customMeaningUpright: 'New upright meaning',
        customKeywords: 'transformation,change',
      };

      jest.spyOn(meaningRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(meaningRepository, 'create').mockReturnValue({
        tarotistaId,
        cardId,
        ...meaningData,
      } as TarotistaCardMeaning);
      jest.spyOn(meaningRepository, 'save').mockResolvedValue({
        id: 1,
        tarotistaId,
        cardId,
        ...meaningData,
      } as TarotistaCardMeaning);

      await service.updateCardMeaning(tarotistaId, cardId, meaningData);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'tarotista.meanings.updated',
        {
          tarotistaId,
          cardId,
          previousMeaning: null,
          newMeaning: expect.objectContaining(
            meaningData,
          ) as TarotistaCardMeaning,
        },
      );
    });
  });

  describe('deleteCardMeaning', () => {
    it('should emit tarotista.meanings.updated event when meaning is deleted', async () => {
      const tarotistaId = 1;
      const cardId = 5;

      const existingMeaning = {
        id: 1,
        tarotistaId,
        cardId,
        customMeaningUpright: 'Some meaning',
      } as TarotistaCardMeaning;

      jest
        .spyOn(meaningRepository, 'findOne')
        .mockResolvedValue(existingMeaning);
      jest
        .spyOn(meaningRepository, 'delete')
        .mockResolvedValue({ affected: 1, raw: [] });

      await service.deleteCardMeaning(tarotistaId, cardId);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'tarotista.meanings.updated',
        {
          tarotistaId,
          cardId,
          previousMeaning: existingMeaning,
          newMeaning: null,
        },
      );
    });
  });
});
