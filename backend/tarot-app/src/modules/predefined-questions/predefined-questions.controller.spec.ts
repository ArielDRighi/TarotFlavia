import { Test, TestingModule } from '@nestjs/testing';
import { PredefinedQuestionsController } from './predefined-questions.controller';
import { PredefinedQuestionsService } from './predefined-questions.service';
import { CreatePredefinedQuestionDto } from './dto/create-predefined-question.dto';
import { UpdatePredefinedQuestionDto } from './dto/update-predefined-question.dto';
import { PredefinedQuestion } from './entities/predefined-question.entity';

describe('PredefinedQuestionsController', () => {
  let controller: PredefinedQuestionsController;

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

  const mockPredefinedQuestionsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCategoryId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    incrementUsageCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PredefinedQuestionsController],
      providers: [
        {
          provide: PredefinedQuestionsService,
          useValue: mockPredefinedQuestionsService,
        },
      ],
    }).compile();

    controller = module.get<PredefinedQuestionsController>(
      PredefinedQuestionsController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all questions when no categoryId is provided', async () => {
      const questions = [mockQuestion];
      mockPredefinedQuestionsService.findAll.mockResolvedValue(questions);

      const result = await controller.findAll(undefined);

      expect(result).toEqual(questions);
      expect(mockPredefinedQuestionsService.findAll).toHaveBeenCalled();
    });

    it('should return questions filtered by categoryId when provided', async () => {
      const questions = [mockQuestion];
      mockPredefinedQuestionsService.findByCategoryId.mockResolvedValue(
        questions,
      );

      const result = await controller.findAll(1);

      expect(result).toEqual(questions);
      expect(
        mockPredefinedQuestionsService.findByCategoryId,
      ).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should return a question by id', async () => {
      mockPredefinedQuestionsService.findOne.mockResolvedValue(mockQuestion);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockQuestion);
      expect(mockPredefinedQuestionsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new question', async () => {
      const createDto: CreatePredefinedQuestionDto = {
        categoryId: 1,
        questionText: '¿Cómo puedo mejorar mi relación de pareja?',
        order: 1,
        isActive: true,
      };
      mockPredefinedQuestionsService.create.mockResolvedValue(mockQuestion);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockQuestion);
      expect(mockPredefinedQuestionsService.create).toHaveBeenCalledWith(
        createDto,
      );
    });
  });

  describe('update', () => {
    it('should update a question', async () => {
      const updateDto: UpdatePredefinedQuestionDto = {
        questionText: '¿Cómo fortalecer mi relación de pareja?',
      };
      const updatedQuestion = { ...mockQuestion, ...updateDto };
      mockPredefinedQuestionsService.update.mockResolvedValue(updatedQuestion);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updatedQuestion);
      expect(mockPredefinedQuestionsService.update).toHaveBeenCalledWith(
        1,
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a question', async () => {
      mockPredefinedQuestionsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockPredefinedQuestionsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
