import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateTarotistaUseCase } from './create-tarotista.use-case';
import { CreateTarotistaDto } from '../../dto/create-tarotista.dto';

describe('CreateTarotistaUseCase', () => {
  let useCase: CreateTarotistaUseCase;

  const mockRepository = {
    findByUserId: jest.fn(),
    create: jest.fn(),
    createConfig: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTarotistaUseCase,
        {
          provide: 'ITarotistaRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateTarotistaUseCase>(CreateTarotistaUseCase);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validDto: CreateTarotistaDto = {
      userId: 1,
      nombrePublico: 'Luna Mística',
      biografia: 'Tarotista con 15 años de experiencia',
      especialidades: ['amor', 'trabajo'],
    };

    it('should create tarotista successfully', async () => {
      const expectedTarotista = {
        id: 1,
        userId: 1,
        nombrePublico: 'Luna Mística',
        bio: 'Tarotista con 15 años de experiencia',
        especialidades: ['amor', 'trabajo'],
        isActive: true,
      };

      mockRepository.findByUserId.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(expectedTarotista);

      const result = await useCase.execute(validDto);

      expect(result).toEqual(expectedTarotista);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(1);
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 1,
        nombrePublico: 'Luna Mística',
        bio: 'Tarotista con 15 años de experiencia',
        especialidades: ['amor', 'trabajo'],
        fotoPerfil: undefined,
        isActive: true,
      });
    });

    it('should throw BadRequestException if user already is tarotista', async () => {
      mockRepository.findByUserId.mockResolvedValue({
        id: 1,
        userId: 1,
        nombrePublico: 'Existing',
      });

      await expect(useCase.execute(validDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(useCase.execute(validDto)).rejects.toThrow(
        'El usuario con ID 1 ya es tarotista',
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should create default config if custom prompts provided', async () => {
      const dtoWithPrompts: CreateTarotistaDto = {
        ...validDto,
        systemPromptIdentity: 'Soy Luna',
        systemPromptGuidelines: 'Habla con empatía',
      };

      const createdTarotista = { id: 1, userId: 1 };

      mockRepository.findByUserId.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(createdTarotista);
      mockRepository.createConfig.mockResolvedValue({ id: 1 });

      await useCase.execute(dtoWithPrompts);

      expect(mockRepository.createConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          tarotistaId: 1,
          systemPrompt: expect.stringContaining('Soy Luna'),
        }),
      );
    });
  });
});
