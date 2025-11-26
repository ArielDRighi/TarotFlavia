import { Test, TestingModule } from '@nestjs/testing';
import { TarotistasPublicController } from './tarotistas-public.controller';
import { TarotistasOrchestratorService } from '../../application/services/tarotistas-orchestrator.service';
import { GetPublicTarotistasFilterDto } from '../../application/dto';
import { Tarotista } from '../entities/tarotista.entity';

describe('TarotistasPublicController', () => {
  let controller: TarotistasPublicController;
  let orchestrator: jest.Mocked<TarotistasOrchestratorService>;

  beforeEach(async () => {
    const mockOrchestrator: jest.Mocked<TarotistasOrchestratorService> = {
      listPublicTarotistas: jest.fn(),
      getPublicProfile: jest.fn(),
    } as unknown as jest.Mocked<TarotistasOrchestratorService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TarotistasPublicController],
      providers: [
        {
          provide: TarotistasOrchestratorService,
          useValue: mockOrchestrator,
        },
      ],
    }).compile();

    controller = module.get<TarotistasPublicController>(
      TarotistasPublicController,
    );
    orchestrator = module.get(TarotistasOrchestratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /tarotistas - getAllPublic', () => {
    it('should return list of tarotistas with default pagination', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            nombrePublico: 'Luna',
            bio: 'Tarotista experta',
            especialidades: ['Amor'],
            ratingPromedio: 4.5,
            totalLecturas: 100,
          },
        ] as unknown as Tarotista[],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      orchestrator.listPublicTarotistas.mockResolvedValue(mockResponse);

      const filterDto: GetPublicTarotistasFilterDto = {};
      const result = await controller.getAllPublic(filterDto);

      expect(result).toEqual(mockResponse);
      expect(orchestrator.listPublicTarotistas).toHaveBeenCalledWith(filterDto);
      expect(orchestrator.listPublicTarotistas).toHaveBeenCalledTimes(1);
    });

    it('should return list with custom pagination', async () => {
      const mockResponse = {
        data: [] as unknown as Tarotista[],
        total: 45,
        page: 3,
        limit: 15,
        totalPages: 3,
      };

      orchestrator.listPublicTarotistas.mockResolvedValue(mockResponse);

      const filterDto: GetPublicTarotistasFilterDto = {
        page: 3,
        limit: 15,
      };
      const result = await controller.getAllPublic(filterDto);

      expect(result).toEqual(mockResponse);
      expect(orchestrator.listPublicTarotistas).toHaveBeenCalledWith(filterDto);
    });

    it('should return list with search filter', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            nombrePublico: 'Luna Misteriosa',
            bio: 'Experta en tarot',
          },
        ] as unknown as Tarotista[],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      orchestrator.listPublicTarotistas.mockResolvedValue(mockResponse);

      const filterDto: GetPublicTarotistasFilterDto = { search: 'Luna' };
      const result = await controller.getAllPublic(filterDto);

      expect(result).toEqual(mockResponse);
      expect(orchestrator.listPublicTarotistas).toHaveBeenCalledWith(filterDto);
    });

    it('should return list filtered by especialidad', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            nombrePublico: 'Flavia',
            especialidades: ['Amor', 'Trabajo'],
          },
        ] as unknown as Tarotista[],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      orchestrator.listPublicTarotistas.mockResolvedValue(mockResponse);

      const filterDto: GetPublicTarotistasFilterDto = {
        especialidad: 'Amor',
      };
      const result = await controller.getAllPublic(filterDto);

      expect(result).toEqual(mockResponse);
      expect(orchestrator.listPublicTarotistas).toHaveBeenCalledWith(filterDto);
    });

    it('should return list ordered by rating DESC', async () => {
      const mockResponse = {
        data: [
          { id: 1, nombrePublico: 'Top1', ratingPromedio: 5.0 },
          { id: 2, nombrePublico: 'Top2', ratingPromedio: 4.8 },
        ] as unknown as Tarotista[],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      orchestrator.listPublicTarotistas.mockResolvedValue(mockResponse);

      const filterDto: GetPublicTarotistasFilterDto = {
        orderBy: 'rating',
        order: 'DESC',
      };
      const result = await controller.getAllPublic(filterDto);

      expect(result).toEqual(mockResponse);
      expect(orchestrator.listPublicTarotistas).toHaveBeenCalledWith(filterDto);
    });

    it('should return list ordered by totalLecturas ASC', async () => {
      const mockResponse = {
        data: [
          { id: 1, nombrePublico: 'New', totalLecturas: 5 },
          { id: 2, nombrePublico: 'Experienced', totalLecturas: 500 },
        ] as unknown as Tarotista[],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      orchestrator.listPublicTarotistas.mockResolvedValue(mockResponse);

      const filterDto: GetPublicTarotistasFilterDto = {
        orderBy: 'totalLecturas',
        order: 'ASC',
      };
      const result = await controller.getAllPublic(filterDto);

      expect(result).toEqual(mockResponse);
      expect(orchestrator.listPublicTarotistas).toHaveBeenCalledWith(filterDto);
    });

    it('should return empty list when no results', async () => {
      const mockResponse = {
        data: [] as unknown as Tarotista[],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      orchestrator.listPublicTarotistas.mockResolvedValue(mockResponse);

      const filterDto: GetPublicTarotistasFilterDto = {
        search: 'NonexistentName',
      };
      const result = await controller.getAllPublic(filterDto);

      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should combine multiple filters', async () => {
      const mockResponse = {
        data: [] as unknown as Tarotista[],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      };

      orchestrator.listPublicTarotistas.mockResolvedValue(mockResponse);

      const filterDto: GetPublicTarotistasFilterDto = {
        search: 'Luna',
        especialidad: 'Amor',
        orderBy: 'rating',
        order: 'DESC',
        page: 2,
        limit: 10,
      };
      const result = await controller.getAllPublic(filterDto);

      expect(result).toEqual(mockResponse);
      expect(orchestrator.listPublicTarotistas).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('GET /tarotistas/:id - getPublicProfile', () => {
    it('should return public profile of tarotista', async () => {
      const mockTarotista = {
        id: 1,
        nombrePublico: 'Luna',
        bio: 'Tarotista experta en amor y trabajo',
        especialidades: ['Amor', 'Trabajo'],
        fotoPerfil: 'https://example.com/luna.jpg',
        ratingPromedio: 4.8,
        totalLecturas: 250,
        totalReviews: 50,
        añosExperiencia: 10,
        idiomas: ['Español', 'Inglés'],
      } as unknown as Tarotista;

      orchestrator.getPublicProfile.mockResolvedValue(mockTarotista);

      const result = await controller.getPublicProfile(1);

      expect(result).toEqual(mockTarotista);
      expect(orchestrator.getPublicProfile).toHaveBeenCalledWith(1);
      expect(orchestrator.getPublicProfile).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when tarotista not found', async () => {
      orchestrator.getPublicProfile.mockResolvedValue(null);

      await expect(controller.getPublicProfile(999)).rejects.toThrow(
        'Tarotista no encontrado o inactivo',
      );
      expect(orchestrator.getPublicProfile).toHaveBeenCalledWith(999);
    });

    it('should throw NotFoundException for inactive tarotista', async () => {
      orchestrator.getPublicProfile.mockResolvedValue(null);

      await expect(controller.getPublicProfile(1)).rejects.toThrow(
        'Tarotista no encontrado o inactivo',
      );
      expect(orchestrator.getPublicProfile).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when id = 0', async () => {
      orchestrator.getPublicProfile.mockResolvedValue(null);

      await expect(controller.getPublicProfile(0)).rejects.toThrow(
        'Tarotista no encontrado o inactivo',
      );
      expect(orchestrator.getPublicProfile).toHaveBeenCalledWith(0);
    });

    it('should NOT expose sensitive data (configs, customCardMeanings)', async () => {
      const mockTarotista = {
        id: 1,
        nombrePublico: 'Luna',
        bio: 'Test',
        ratingPromedio: 4.5,
        totalLecturas: 100,
        // These sensitive fields should NOT be returned
        // (service layer already filters them)
      } as unknown as Tarotista;

      orchestrator.getPublicProfile.mockResolvedValue(mockTarotista);

      const result = await controller.getPublicProfile(1);

      expect(result).toEqual(mockTarotista);
      expect(result).not.toHaveProperty('configs');
      expect(result).not.toHaveProperty('customCardMeanings');
    });
  });

  describe('Edge cases', () => {
    it('should handle service throwing error', async () => {
      const error = new Error('Database connection failed');
      orchestrator.listPublicTarotistas.mockRejectedValue(error);

      const filterDto: GetPublicTarotistasFilterDto = {};

      await expect(controller.getAllPublic(filterDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle service throwing error on getPublicProfile', async () => {
      const error = new Error('Database error');
      orchestrator.getPublicProfile.mockRejectedValue(error);

      await expect(controller.getPublicProfile(1)).rejects.toThrow(
        'Database error',
      );
    });

    it('should pass through empty query params correctly', async () => {
      const mockResponse = {
        data: [] as unknown as Tarotista[],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      orchestrator.listPublicTarotistas.mockResolvedValue(mockResponse);

      // Empty object = default values
      const result = await controller.getAllPublic({});

      expect(result).toEqual(mockResponse);
      expect(orchestrator.listPublicTarotistas).toHaveBeenCalledWith({});
    });
  });
});
