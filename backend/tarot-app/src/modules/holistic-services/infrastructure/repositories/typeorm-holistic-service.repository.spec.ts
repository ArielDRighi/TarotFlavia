import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmHolisticServiceRepository } from './typeorm-holistic-service.repository';
import { HolisticService } from '../../entities/holistic-service.entity';
import { SessionType } from '../../../scheduling/domain/enums/session-type.enum';

describe('TypeOrmHolisticServiceRepository', () => {
  let repository: TypeOrmHolisticServiceRepository;
  let typeOrmRepository: jest.Mocked<Repository<HolisticService>>;

  const mockService: HolisticService = {
    id: 1,
    name: 'Árbol Genealógico',
    slug: 'arbol-genealogico',
    shortDescription: '¿Qué heredamos del árbol familiar?',
    longDescription: 'Descripción larga del servicio.',
    priceArs: 15000,
    durationMinutes: 60,
    sessionType: SessionType.FAMILY_TREE,
    whatsappNumber: '+5491112345678',
    mercadoPagoLink: 'https://mpago.la/test',
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    purchases: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as HolisticService;

  const mockInactiveService: HolisticService = {
    ...mockService,
    id: 2,
    isActive: false,
    slug: 'servicio-inactivo',
  } as HolisticService;

  beforeEach(async () => {
    const mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmHolisticServiceRepository,
        {
          provide: getRepositoryToken(HolisticService),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmHolisticServiceRepository>(
      TypeOrmHolisticServiceRepository,
    );
    typeOrmRepository = module.get(getRepositoryToken(HolisticService));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllActive', () => {
    it('should return only active services ordered by displayOrder', async () => {
      typeOrmRepository.find.mockResolvedValue([mockService]);

      const result = await repository.findAllActive();

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { displayOrder: 'ASC' },
      });
      expect(result).toEqual([mockService]);
    });

    it('should return empty array when no active services', async () => {
      typeOrmRepository.find.mockResolvedValue([]);

      const result = await repository.findAllActive();

      expect(result).toEqual([]);
    });
  });

  describe('findBySlug', () => {
    it('should find a service by slug', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockService);

      const result = await repository.findBySlug('arbol-genealogico');

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'arbol-genealogico' },
      });
      expect(result).toEqual(mockService);
    });

    it('should return null when service not found by slug', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a service by id', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockService);

      const result = await repository.findById(1);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockService);
    });

    it('should return null when service not found by id', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all services (active and inactive) ordered by displayOrder', async () => {
      typeOrmRepository.find.mockResolvedValue([
        mockService,
        mockInactiveService,
      ]);

      const result = await repository.findAll();

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        order: { displayOrder: 'ASC' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('save', () => {
    it('should create and save a new service', async () => {
      const serviceData: Partial<HolisticService> = {
        name: 'Nuevo Servicio',
        slug: 'nuevo-servicio',
        shortDescription: 'Descripción corta',
        longDescription: 'Descripción larga',
        priceArs: 10000,
        durationMinutes: 60,
        sessionType: SessionType.ENERGY_CLEANING,
        whatsappNumber: '+5491112345678',
        mercadoPagoLink: 'https://mpago.la/test',
      };

      typeOrmRepository.create.mockReturnValue(mockService);
      typeOrmRepository.save.mockResolvedValue(mockService);

      const result = await repository.save(serviceData);

      expect(typeOrmRepository.create).toHaveBeenCalledWith(serviceData);
      expect(typeOrmRepository.save).toHaveBeenCalledWith(mockService);
      expect(result).toEqual(mockService);
    });
  });

  describe('update', () => {
    it('should update a service and return the updated entity', async () => {
      const updateData: Partial<HolisticService> = { priceArs: 20000 };
      const updatedService = {
        ...mockService,
        priceArs: 20000,
      } as HolisticService;

      typeOrmRepository.update.mockResolvedValue({ affected: 1 } as never);
      typeOrmRepository.findOne.mockResolvedValue(updatedService);

      const result = await repository.update(1, updateData);

      expect(typeOrmRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedService);
    });

    it('should return null when service to update is not found', async () => {
      typeOrmRepository.update.mockResolvedValue({ affected: 0 } as never);
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.update(999, { priceArs: 20000 });

      expect(result).toBeNull();
    });

    it('should strip id, createdAt, updatedAt and purchases from the update payload', async () => {
      const dirtyData: Partial<HolisticService> = {
        id: 99,
        priceArs: 20000,
        isActive: false,
        purchases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      typeOrmRepository.update.mockResolvedValue({ affected: 1 } as never);
      typeOrmRepository.findOne.mockResolvedValue(mockService);

      await repository.update(1, dirtyData);

      const updateCall = typeOrmRepository.update.mock
        .calls[0][1] as Partial<HolisticService>;
      expect(updateCall).not.toHaveProperty('id');
      expect(updateCall).not.toHaveProperty('purchases');
      expect(updateCall).not.toHaveProperty('createdAt');
      expect(updateCall).not.toHaveProperty('updatedAt');
      expect(updateCall.priceArs).toBe(20000);
      expect(updateCall.isActive).toBe(false);
    });
  });
});
