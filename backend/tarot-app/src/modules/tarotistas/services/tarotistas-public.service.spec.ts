import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TarotistasPublicService } from './tarotistas-public.service';
import { Tarotista } from '../entities/tarotista.entity';
import { GetPublicTarotistasFilterDto } from '../dto';

describe('TarotistasPublicService', () => {
  let service: TarotistasPublicService;
  let tarotistaRepository: jest.Mocked<Repository<Tarotista>>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Tarotista>>;

  beforeEach(async () => {
    // Mock QueryBuilder
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getOne: jest.fn(),
    } as unknown as jest.Mocked<SelectQueryBuilder<Tarotista>>;

    // Mock Repository
    tarotistaRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Tarotista>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TarotistasPublicService,
        {
          provide: getRepositoryToken(Tarotista),
          useValue: tarotistaRepository,
        },
      ],
    }).compile();

    service = module.get<TarotistasPublicService>(TarotistasPublicService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPublic', () => {
    it('should return only active tarotistas', async () => {
      const mockTarotistas = [
        {
          id: 1,
          nombrePublico: 'Luna',
          bio: 'Tarotista experta',
          especialidades: ['Amor'],
          ratingPromedio: 4.5,
          totalLecturas: 100,
          isActive: true,
        },
      ] as unknown as Tarotista[];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTarotistas, 1]);

      const filterDto: GetPublicTarotistasFilterDto = {};
      const result = await service.getAllPublic(filterDto);

      expect(result.data).toEqual(mockTarotistas);
      expect(result.total).toBe(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'tarotista.isActive = :isActive',
        { isActive: true },
      );
    });

    it('should apply search filter on nombrePublico', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const filterDto: GetPublicTarotistasFilterDto = { search: 'Luna' };
      await service.getAllPublic(filterDto);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'tarotista.isActive = :isActive',
        { isActive: true },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(tarotista.nombrePublico) LIKE LOWER(:search) OR LOWER(tarotista.bio) LIKE LOWER(:search))',
        { search: '%Luna%' },
      );
    });

    it('should escape special characters in search (prevent SQL injection)', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const filterDto: GetPublicTarotistasFilterDto = {
        search: '%malicious_',
      };
      await service.getAllPublic(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(tarotista.nombrePublico) LIKE LOWER(:search) OR LOWER(tarotista.bio) LIKE LOWER(:search))',
        { search: '%\\%malicious\\_%' },
      );
    });

    it('should apply especialidad filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const filterDto: GetPublicTarotistasFilterDto = {
        especialidad: 'Amor',
      };
      await service.getAllPublic(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        ':especialidad = ANY(tarotista.especialidades)',
        { especialidad: 'Amor' },
      );
    });

    it('should order by rating DESC by default when orderBy=rating', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const filterDto: GetPublicTarotistasFilterDto = {
        orderBy: 'rating',
        order: 'DESC',
      };
      await service.getAllPublic(filterDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'tarotista.ratingPromedio',
        'DESC',
        'NULLS LAST',
      );
    });

    it('should order by totalLecturas ASC', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const filterDto: GetPublicTarotistasFilterDto = {
        orderBy: 'totalLecturas',
        order: 'ASC',
      };
      await service.getAllPublic(filterDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'tarotista.totalLecturas',
        'ASC',
        'NULLS LAST',
      );
    });

    it('should order by nombrePublico ASC (alphabetical)', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const filterDto: GetPublicTarotistasFilterDto = {
        orderBy: 'nombrePublico',
        order: 'ASC',
      };
      await service.getAllPublic(filterDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'tarotista.nombrePublico',
        'ASC',
        'NULLS LAST',
      );
    });

    it('should order by createdAt DESC by default', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const filterDto: GetPublicTarotistasFilterDto = {};
      await service.getAllPublic(filterDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'tarotista.createdAt',
        'DESC',
        'NULLS LAST',
      );
    });

    it('should apply pagination with default values (page=1, limit=20)', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const filterDto: GetPublicTarotistasFilterDto = {};
      await service.getAllPublic(filterDto);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });

    it('should apply pagination with custom page and limit', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const filterDto: GetPublicTarotistasFilterDto = {
        page: 3,
        limit: 15,
      };
      await service.getAllPublic(filterDto);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(30); // (3-1) * 15
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(15);
    });

    it('should return correct pagination metadata', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 45]);

      const filterDto: GetPublicTarotistasFilterDto = {
        page: 2,
        limit: 15,
      };
      const result = await service.getAllPublic(filterDto);

      expect(result.total).toBe(45);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
      expect(result.totalPages).toBe(3); // Math.ceil(45 / 15)
    });

    it('should combine all filters: search + especialidad + orderBy + pagination', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const filterDto: GetPublicTarotistasFilterDto = {
        search: 'Flavia',
        especialidad: 'Trabajo',
        orderBy: 'rating',
        order: 'DESC',
        page: 2,
        limit: 10,
      };
      await service.getAllPublic(filterDto);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'tarotista.isActive = :isActive',
        { isActive: true },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(tarotista.nombrePublico) LIKE LOWER(:search) OR LOWER(tarotista.bio) LIKE LOWER(:search))',
        { search: '%Flavia%' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        ':especialidad = ANY(tarotista.especialidades)',
        { especialidad: 'Trabajo' },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'tarotista.ratingPromedio',
        'DESC',
        'NULLS LAST',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10); // (2-1) * 10
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should return empty array when no tarotistas match filters', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const filterDto: GetPublicTarotistasFilterDto = { search: 'Nonexistent' };
      const result = await service.getAllPublic(filterDto);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should NOT expose sensitive data (configs, customCardMeanings)', async () => {
      const mockTarotista = {
        id: 1,
        nombrePublico: 'Luna',
        bio: 'Test',
        especialidades: ['Amor'],
        ratingPromedio: 4.5,
        totalLecturas: 100,
        fotoPerfil: 'https://example.com/photo.jpg',
        isActive: true,
        // Sensitive data that should NOT be in response
        configs: [{ systemPrompt: 'SECRET' }],
        customCardMeanings: [{ cardId: 1, customMeaning: 'SECRET' }],
      } as unknown as Tarotista;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTarotista], 1]);

      const filterDto: GetPublicTarotistasFilterDto = {};
      const result = await service.getAllPublic(filterDto);

      // Verify that sensitive fields are NOT included in query builder
      expect(tarotistaRepository.createQueryBuilder).toHaveBeenCalledWith(
        'tarotista',
      );
      // QueryBuilder should NOT load relations with sensitive data
      expect(result.data[0]).toBeDefined();
    });
  });

  describe('getPublicProfile', () => {
    it('should return public profile of active tarotista', async () => {
      const mockTarotista = {
        id: 1,
        nombrePublico: 'Luna',
        bio: 'Tarotista experta en amor',
        especialidades: ['Amor', 'Trabajo'],
        fotoPerfil: 'https://example.com/luna.jpg',
        ratingPromedio: 4.8,
        totalLecturas: 250,
        totalReviews: 50,
        añosExperiencia: 10,
        idiomas: ['Español', 'Inglés'],
        isActive: true,
      } as unknown as Tarotista;

      mockQueryBuilder.getOne.mockResolvedValue(mockTarotista);

      const result = await service.getPublicProfile(1);

      expect(result).toEqual(mockTarotista);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'tarotista.id = :id AND tarotista.isActive = :isActive',
        { id: 1, isActive: true },
      );
    });

    it('should return null for inactive tarotista', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.getPublicProfile(999);

      expect(result).toBeNull();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'tarotista.id = :id AND tarotista.isActive = :isActive',
        { id: 999, isActive: true },
      );
    });

    it('should return null for non-existent tarotista', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.getPublicProfile(9999);

      expect(result).toBeNull();
    });

    it('should NOT expose sensitive data in public profile', async () => {
      const mockTarotista = {
        id: 1,
        nombrePublico: 'Luna',
        bio: 'Test',
        especialidades: ['Amor'],
        ratingPromedio: 4.5,
        totalLecturas: 100,
        isActive: true,
      } as unknown as Tarotista;

      mockQueryBuilder.getOne.mockResolvedValue(mockTarotista);

      await service.getPublicProfile(1);

      // Verify QueryBuilder does NOT select sensitive fields
      expect(tarotistaRepository.createQueryBuilder).toHaveBeenCalledWith(
        'tarotista',
      );
      // Should NOT load configs or customCardMeanings relations
    });

    it('should handle id = 0', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.getPublicProfile(0);

      expect(result).toBeNull();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'tarotista.id = :id AND tarotista.isActive = :isActive',
        { id: 0, isActive: true },
      );
    });

    it('should handle negative id', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.getPublicProfile(-1);

      expect(result).toBeNull();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'tarotista.id = :id AND tarotista.isActive = :isActive',
        { id: -1, isActive: true },
      );
    });
  });
});
