import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReadingsService } from './readings.service';
import { TarotReading } from './entities/tarot-reading.entity';
import { User } from '../users/entities/user.entity';
import { TarotDeck } from '../decks/entities/tarot-deck.entity';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateReadingDto } from './dto/create-reading.dto';

describe('ReadingsService', () => {
  let service: ReadingsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    username: 'testuser',
    password: 'hashedpassword',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as User;

  const mockDeck: TarotDeck = {
    id: 1,
    name: 'Rider-Waite',
    description: 'Classic tarot deck',
    imageUrl: 'https://example.com/rw.jpg',
    cardCount: 78,
    isActive: true,
    isDefault: false,
    artist: 'Pamela Colman Smith',
    yearCreated: 1909,
    tradition: 'Hermética',
    publisher: 'Rider & Company',
    cards: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as TarotDeck;

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
      deck: mockDeck,
    } as unknown as TarotCard,
    {
      id: 2,
      name: 'The Magician',
      arcana: 'major',
      suit: null,
      number: 1,
      meaningUpright: 'Manifestation',
      meaningReversed: 'Manipulation',
      keywords: 'power,skill,concentration',
      description: 'The Magician card',
      imageUrl: '/images/magician.jpg',
      deck: mockDeck,
    } as unknown as TarotCard,
  ];

  const mockReading: TarotReading = {
    id: 1,
    question: 'What does my future hold?',
    user: mockUser,
    deck: mockDeck,
    cards: mockCards,
    cardPositions: [
      { cardId: 1, position: 'past', isReversed: false },
      { cardId: 2, position: 'present', isReversed: true },
    ],
    interpretation: 'Your reading suggests...',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingsService,
        {
          provide: getRepositoryToken(TarotReading),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReadingsService>(ReadingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new reading', async () => {
      const createReadingDto: CreateReadingDto = {
        question: 'What does my future hold?',
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2],
        cardPositions: [
          { cardId: 1, position: 'past', isReversed: false },
          { cardId: 2, position: 'present', isReversed: true },
        ],
        generateInterpretation: true,
      };

      mockRepository.create.mockReturnValue(mockReading);
      mockRepository.save.mockResolvedValue(mockReading);

      const result = await service.create(mockUser, createReadingDto);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockReading);
    });

    it('should create reading without interpretation if not requested', async () => {
      const createReadingDto: CreateReadingDto = {
        question: 'Test question',
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2],
        cardPositions: [
          { cardId: 1, position: 'past', isReversed: false },
          { cardId: 2, position: 'present', isReversed: true },
        ],
        generateInterpretation: false,
      };

      const readingWithoutInterpretation = {
        ...mockReading,
        interpretation: null,
      };
      mockRepository.create.mockReturnValue(readingWithoutInterpretation);
      mockRepository.save.mockResolvedValue(readingWithoutInterpretation);

      const result = await service.create(mockUser, createReadingDto);

      expect(result.interpretation).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all readings for a user', async () => {
      const readings = [mockReading];
      mockRepository.find.mockResolvedValue(readings);

      const result = await service.findAll(mockUser.id);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        relations: ['deck', 'cards', 'user'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(readings);
    });

    it('should return empty array if no readings found', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll(mockUser.id);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a reading by id for the owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockReading);

      const result = await service.findOne(mockReading.id, mockUser.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockReading.id },
        relations: ['deck', 'cards', 'user'],
      });
      expect(result).toEqual(mockReading);
    });

    it('should throw NotFoundException if reading does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockReading);

      await expect(service.findOne(mockReading.id, 999)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow admin to access any reading', async () => {
      mockRepository.findOne.mockResolvedValue(mockReading);

      const result = await service.findOne(mockReading.id, 999, true);

      expect(result).toEqual(mockReading);
    });
  });

  describe('update', () => {
    it('should update a reading', async () => {
      const updatedReading = { ...mockReading, question: 'Updated question' };
      mockRepository.findOne.mockResolvedValue(mockReading);
      mockRepository.save.mockResolvedValue(updatedReading);

      const result = await service.update(mockReading.id, mockUser.id, {
        question: 'Updated question',
      });

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.question).toBe('Updated question');
    });

    it('should throw NotFoundException if reading does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, mockUser.id, { question: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockReading);

      await expect(
        service.update(mockReading.id, 999, { question: 'Test' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a reading (soft delete)', async () => {
      mockRepository.findOne.mockResolvedValue(mockReading);
      mockRepository.save.mockResolvedValue({
        ...mockReading,
        deletedAt: new Date(),
      });

      await service.remove(mockReading.id, mockUser.id);

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if reading does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999, mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockReading);

      await expect(service.remove(mockReading.id, 999)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
