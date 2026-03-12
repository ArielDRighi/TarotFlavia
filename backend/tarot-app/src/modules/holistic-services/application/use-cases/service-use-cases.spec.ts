import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetAllActiveServicesUseCase } from './get-all-active-services.use-case';
import { GetServiceBySlugUseCase } from './get-service-by-slug.use-case';
import { AdminCreateServiceUseCase } from './admin-create-service.use-case';
import { AdminUpdateServiceUseCase } from './admin-update-service.use-case';
import {
  HOLISTIC_SERVICE_REPOSITORY,
  IHolisticServiceRepository,
} from '../../domain/interfaces';
import { HolisticService } from '../../entities/holistic-service.entity';
import { SessionType } from '../../../scheduling/domain/enums';
import { CreateHolisticServiceDto } from '../dto/create-holistic-service.dto';
import { UpdateHolisticServiceDto } from '../dto/update-holistic-service.dto';

const mockHolisticService: HolisticService = {
  id: 1,
  name: 'Trabajo con el Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: '¿Qué heredamos del árbol familiar?',
  longDescription: 'Descripción larga del servicio...',
  priceArs: 15000,
  durationMinutes: 60,
  sessionType: SessionType.FAMILY_TREE,
  whatsappNumber: '+5491112345678',
  mercadoPagoLink: 'https://mpago.la/1234567',
  imageUrl: null,
  displayOrder: 1,
  isActive: true,
  purchases: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('GetAllActiveServicesUseCase', () => {
  let useCase: GetAllActiveServicesUseCase;
  let mockRepo: jest.Mocked<IHolisticServiceRepository>;

  beforeEach(async () => {
    mockRepo = {
      findAllActive: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllActiveServicesUseCase,
        { provide: HOLISTIC_SERVICE_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get(GetAllActiveServicesUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe retornar lista de servicios activos', async () => {
    mockRepo.findAllActive.mockResolvedValue([mockHolisticService]);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe('Trabajo con el Árbol Genealógico');
    expect(mockRepo.findAllActive).toHaveBeenCalledTimes(1);
  });

  it('debe retornar lista vacía si no hay servicios activos', async () => {
    mockRepo.findAllActive.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toHaveLength(0);
  });

  it('no debe exponer whatsappNumber ni mercadoPagoLink en la respuesta pública', async () => {
    mockRepo.findAllActive.mockResolvedValue([mockHolisticService]);

    const result = await useCase.execute();

    expect(result[0]).not.toHaveProperty('whatsappNumber');
    expect(result[0]).not.toHaveProperty('mercadoPagoLink');
  });
});

describe('GetServiceBySlugUseCase', () => {
  let useCase: GetServiceBySlugUseCase;
  let mockRepo: jest.Mocked<IHolisticServiceRepository>;

  beforeEach(async () => {
    mockRepo = {
      findAllActive: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetServiceBySlugUseCase,
        { provide: HOLISTIC_SERVICE_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get(GetServiceBySlugUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe retornar el detalle del servicio por slug', async () => {
    mockRepo.findBySlug.mockResolvedValue(mockHolisticService);

    const result = await useCase.execute('arbol-genealogico');

    expect(result.id).toBe(1);
    expect(result.slug).toBe('arbol-genealogico');
    expect(result.longDescription).toBe('Descripción larga del servicio...');
    expect(mockRepo.findBySlug).toHaveBeenCalledWith('arbol-genealogico');
  });

  it('debe lanzar NotFoundException si el slug no existe', async () => {
    mockRepo.findBySlug.mockResolvedValue(null);

    await expect(useCase.execute('slug-inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debe lanzar NotFoundException si el servicio existe pero está inactivo', async () => {
    mockRepo.findBySlug.mockResolvedValue({
      ...mockHolisticService,
      isActive: false,
    });

    await expect(useCase.execute('arbol-genealogico')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('no debe exponer whatsappNumber ni mercadoPagoLink en la respuesta pública', async () => {
    mockRepo.findBySlug.mockResolvedValue(mockHolisticService);

    const result = await useCase.execute('arbol-genealogico');

    expect(result).not.toHaveProperty('whatsappNumber');
    expect(result).not.toHaveProperty('mercadoPagoLink');
  });
});

describe('AdminCreateServiceUseCase', () => {
  let useCase: AdminCreateServiceUseCase;
  let mockRepo: jest.Mocked<IHolisticServiceRepository>;

  const createDto: CreateHolisticServiceDto = {
    name: 'Nuevo Servicio',
    slug: 'nuevo-servicio',
    shortDescription: 'Descripción corta',
    longDescription: 'Descripción larga del nuevo servicio holístico',
    priceArs: 10000,
    durationMinutes: 60,
    sessionType: SessionType.ENERGY_CLEANING,
    whatsappNumber: '+5491112345678',
    mercadoPagoLink: 'https://mpago.la/1234567',
  };

  beforeEach(async () => {
    mockRepo = {
      findAllActive: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminCreateServiceUseCase,
        { provide: HOLISTIC_SERVICE_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get(AdminCreateServiceUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe crear un servicio y retornar la respuesta admin completa', async () => {
    mockRepo.findBySlug.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue({
      ...mockHolisticService,
      ...createDto,
      id: 2,
    });

    const result = await useCase.execute(createDto);

    expect(result.id).toBe(2);
    expect(result.name).toBe('Nuevo Servicio');
    expect(result.whatsappNumber).toBeDefined();
    expect(result.mercadoPagoLink).toBeDefined();
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar ConflictException si el slug ya existe', async () => {
    mockRepo.findBySlug.mockResolvedValue(mockHolisticService);

    const { ConflictException } = await import('@nestjs/common');
    await expect(useCase.execute(createDto)).rejects.toThrow(ConflictException);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});

describe('AdminUpdateServiceUseCase', () => {
  let useCase: AdminUpdateServiceUseCase;
  let mockRepo: jest.Mocked<IHolisticServiceRepository>;

  const updateDto: UpdateHolisticServiceDto = {
    priceArs: 20000,
    isActive: false,
  };

  beforeEach(async () => {
    mockRepo = {
      findAllActive: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUpdateServiceUseCase,
        { provide: HOLISTIC_SERVICE_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get(AdminUpdateServiceUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe actualizar el servicio y retornar la respuesta admin completa', async () => {
    mockRepo.findById.mockResolvedValue(mockHolisticService);
    mockRepo.update.mockResolvedValue({
      ...mockHolisticService,
      priceArs: 20000,
      isActive: false,
    });

    const result = await useCase.execute(1, updateDto);

    expect(result.priceArs).toBe(20000);
    expect(result.isActive).toBe(false);
    expect(result.whatsappNumber).toBeDefined();
    expect(mockRepo.update).toHaveBeenCalledWith(1, updateDto);
  });

  it('debe lanzar NotFoundException si el servicio no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, updateDto)).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('debe lanzar ConflictException si se intenta actualizar el slug a uno ya existente', async () => {
    const otroServicio: HolisticService = { ...mockHolisticService, id: 2 };
    mockRepo.findById.mockResolvedValue(mockHolisticService);
    mockRepo.findBySlug.mockResolvedValue(otroServicio);

    const { ConflictException } = await import('@nestjs/common');
    await expect(useCase.execute(1, { slug: 'slug-en-uso' })).rejects.toThrow(
      ConflictException,
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});
