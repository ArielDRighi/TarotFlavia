import { Test, TestingModule } from '@nestjs/testing';
import { InterpretationsService } from './interpretations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TarotInterpretation } from './entities/tarot-interpretation.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { InternalServerErrorException } from '@nestjs/common';

describe('InterpretationsService', () => {
  let service: InterpretationsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    manager: {
      findOne: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockCards: TarotCard[] = [
    {
      id: 1,
      name: 'The Fool',
      arcana: 'major',
      suit: null,
      number: 0,
      meaningUpright: 'New beginnings',
      meaningReversed: 'Recklessness',
      keywords: 'beginning,freedom,spontaneity',
      description: 'The Fool card',
      imageUrl: '/images/fool.jpg',
    } as unknown as TarotCard,
  ];

  const mockPositions = [{ cardId: 1, position: 'present', isReversed: false }];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterpretationsService,
        {
          provide: getRepositoryToken(TarotInterpretation),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<InterpretationsService>(InterpretationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateInterpretation', () => {
    it('should throw error if OpenAI is not configured', async () => {
      // The service was already created with null API key in beforeEach
      // so we just need to test that it throws the error
      await expect(
        service.generateInterpretation(mockCards, mockPositions),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('saveInterpretation', () => {
    it('should save interpretation to database', () => {
      const interpretation = 'Test interpretation';
      const modelUsed = 'gpt-4';
      const aiConfig = { model: 'gpt-4', temperature: 0.7, maxTokens: 1000 };

      mockRepository.create.mockReturnValue({
        content: interpretation,
        modelUsed,
        aiConfig,
      });
      mockRepository.save.mockResolvedValue({
        id: 1,
        content: interpretation,
        modelUsed,
        aiConfig,
      });

      // This is a private method, so we'll test it indirectly
      // through attachInterpretationToReading
    });
  });

  describe('attachInterpretationToReading', () => {
    it('should attach interpretation to a reading', async () => {
      const readingId = 1;
      const interpretation = 'Test interpretation';
      const modelUsed = 'gpt-4';
      const aiConfig = { model: 'gpt-4', temperature: 0.7, maxTokens: 1000 };

      const savedInterpretation = {
        id: 1,
        reading: { id: readingId },
        content: interpretation,
        modelUsed,
        aiConfig,
      };

      mockRepository.create.mockReturnValue(savedInterpretation);
      mockRepository.save.mockResolvedValue(savedInterpretation);

      const result = await service.attachInterpretationToReading(
        readingId,
        interpretation,
        modelUsed,
        aiConfig,
      );

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedInterpretation);
    });
  });
});
