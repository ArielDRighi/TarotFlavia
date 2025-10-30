import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PredefinedQuestionsService } from './predefined-questions.service';
import { PredefinedQuestion } from './entities/predefined-question.entity';
import { CreatePredefinedQuestionDto } from './dto/create-predefined-question.dto';
import { UpdatePredefinedQuestionDto } from './dto/update-predefined-question.dto';

describe('PredefinedQuestionsService', () => {
  let service: PredefinedQuestionsService;

  const mockQuestion: Partial<PredefinedQuestion> = {
    id: 1,
    categoryId: 1,
    questionText: '¿Cómo puedo mejorar mi relación de pareja?',
    order: 1,
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    count: jest.fn(),
    increment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredefinedQuestionsService,
        {
          provide: getRepositoryToken(PredefinedQuestion),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PredefinedQuestionsService>(
      PredefinedQuestionsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of questions ordered by order field', async () => {
      const questions = [mockQuestion];
      mockRepository.find.mockResolvedValue(questions);

      const result = await service.findAll();

      expect(result).toEqual(questions);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { order: 'ASC' },
      });
    });
  });

  describe('findByCategoryId', () => {
    it('should return questions filtered by categoryId', async () => {
      const questions = [mockQuestion];
      mockRepository.find.mockResolvedValue(questions);

      const result = await service.findByCategoryId(1);

      expect(result).toEqual(questions);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { categoryId: 1, isActive: true },
        order: { order: 'ASC' },
      });
    });

    it('should return empty array if no questions found for category', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByCategoryId(999);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a question by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockQuestion);

      const result = await service.findOne(1);

      expect(result).toEqual(mockQuestion);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when question does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('create', () => {
    const createDto: CreatePredefinedQuestionDto = {
      categoryId: 1,
      questionText: '¿Cómo puedo mejorar mi relación de pareja?',
      order: 1,
      isActive: true,
    };

    it('should create a new question', async () => {
      mockRepository.create.mockReturnValue(mockQuestion);
      mockRepository.save.mockResolvedValue(mockQuestion);

      const result = await service.create(createDto);

      expect(result).toEqual(mockQuestion);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockQuestion);
    });
  });

  describe('update', () => {
    const updateDto: UpdatePredefinedQuestionDto = {
      questionText: '¿Cómo fortalecer mi relación de pareja?',
    };

    it('should update a question', async () => {
      const updatedQuestion = { ...mockQuestion, ...updateDto };
      mockRepository.findOne.mockResolvedValue(mockQuestion);
      mockRepository.save.mockResolvedValue(updatedQuestion);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedQuestion);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent question', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a question', async () => {
      mockRepository.findOne.mockResolvedValue(mockQuestion);
      mockRepository.softDelete.mockResolvedValue({ affected: 1, raw: {} });

      await service.remove(1);

      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when removing non-existent question', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('incrementUsageCount', () => {
    it('should increment usage count for a question', async () => {
      mockRepository.increment.mockResolvedValue({ affected: 1, raw: {} });

      await service.incrementUsageCount(1);

      expect(mockRepository.increment).toHaveBeenCalledWith(
        { id: 1 },
        'usageCount',
        1,
      );
    });
  });
});
