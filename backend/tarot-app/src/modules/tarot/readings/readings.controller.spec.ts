import { Test, TestingModule } from '@nestjs/testing';
import { ReadingsController } from './readings.controller';
import { ReadingsService } from './readings.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { User } from '../../users/entities/user.entity';
import { TarotReading } from './entities/tarot-reading.entity';

describe('ReadingsController', () => {
  let controller: ReadingsController;

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    username: 'testuser',
    password: 'hashedpassword',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as User;

  const mockReading: TarotReading = {
    id: 1,
    question: 'What does my future hold?',
    user: mockUser,
    cardPositions: [
      { cardId: 1, position: 'past', isReversed: false },
      { cardId: 2, position: 'present', isReversed: true },
    ],
    interpretation: 'Your reading suggests...',
    createdAt: new Date(),
  } as TarotReading;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadingsController],
      providers: [
        {
          provide: ReadingsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ReadingsController>(ReadingsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new reading with predefined question', async () => {
      const createDto: CreateReadingDto = {
        predefinedQuestionId: 5,
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2],
        cardPositions: [
          { cardId: 1, position: 'past', isReversed: false },
          { cardId: 2, position: 'present', isReversed: true },
        ],
        generateInterpretation: true,
      };

      const req = { user: { userId: mockUser.id } };
      mockService.create.mockResolvedValue(mockReading);

      const result = await controller.createReading(req, createDto);

      expect(mockService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUser.id,
        }),
        createDto,
      );
      expect(result).toEqual(mockReading);
    });

    it('should create a new reading with custom question', async () => {
      const createDto: CreateReadingDto = {
        customQuestion: '¿Cuál es mi propósito en la vida?',
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2],
        cardPositions: [
          { cardId: 1, position: 'past', isReversed: false },
          { cardId: 2, position: 'present', isReversed: true },
        ],
        generateInterpretation: true,
      };

      const req = { user: { userId: mockUser.id } };
      const readingWithCustom = {
        ...mockReading,
        customQuestion: createDto.customQuestion,
      };
      mockService.create.mockResolvedValue(readingWithCustom);

      const result = await controller.createReading(req, createDto);

      expect(mockService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUser.id,
        }),
        createDto,
      );
      expect(result).toEqual(readingWithCustom);
    });
  });

  describe('getUserReadings', () => {
    it('should return all readings for the user', async () => {
      const readings = [mockReading];
      const req = { user: { userId: mockUser.id } };
      mockService.findAll.mockResolvedValue(readings);

      const result = await controller.getUserReadings(req);

      expect(mockService.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(readings);
    });
  });

  describe('getReadingById', () => {
    it('should return a specific reading', async () => {
      const req = { user: { userId: mockUser.id, isAdmin: false } };
      mockService.findOne.mockResolvedValue(mockReading);

      const result = await controller.getReadingById(req, mockReading.id);

      expect(mockService.findOne).toHaveBeenCalledWith(
        mockReading.id,
        mockUser.id,
        false,
      );
      expect(result).toEqual(mockReading);
    });
  });
});
