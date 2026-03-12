import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { HolisticServicesPublicController } from './holistic-services-public.controller';
import { HolisticServicesOrchestratorService } from '../../application/orchestrators/holistic-services-orchestrator.service';
import { HolisticServiceResponseDto } from '../../application/dto/holistic-service-response.dto';
import { HolisticServiceDetailResponseDto } from '../../application/dto/holistic-service-response.dto';
import { SessionType } from '../../../scheduling/domain/enums';

describe('HolisticServicesPublicController', () => {
  let controller: HolisticServicesPublicController;

  const mockOrchestrator: jest.Mocked<
    Pick<
      HolisticServicesOrchestratorService,
      'getAllActiveServices' | 'getServiceBySlug'
    >
  > = {
    getAllActiveServices: jest.fn(),
    getServiceBySlug: jest.fn(),
  };

  const mockService: HolisticServiceResponseDto = {
    id: 1,
    name: 'Trabajo con el Árbol Genealógico',
    slug: 'arbol-genealogico',
    shortDescription: 'Descripción corta',
    priceArs: 15000,
    durationMinutes: 60,
    sessionType: SessionType.FAMILY_TREE,
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockServiceDetail: HolisticServiceDetailResponseDto = {
    ...mockService,
    longDescription: 'Descripción larga del servicio',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HolisticServicesPublicController],
      providers: [
        {
          provide: HolisticServicesOrchestratorService,
          useValue: mockOrchestrator,
        },
      ],
    }).compile();

    controller = module.get<HolisticServicesPublicController>(
      HolisticServicesPublicController,
    );
    jest.clearAllMocks();
  });

  describe('GET /holistic-services', () => {
    it('should return list of active services', async () => {
      mockOrchestrator.getAllActiveServices.mockResolvedValue([mockService]);

      const result = await controller.getAll();

      expect(result).toEqual([mockService]);
      expect(mockOrchestrator.getAllActiveServices).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no services', async () => {
      mockOrchestrator.getAllActiveServices.mockResolvedValue([]);

      const result = await controller.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('GET /holistic-services/:slug', () => {
    it('should return service detail by slug', async () => {
      mockOrchestrator.getServiceBySlug.mockResolvedValue(mockServiceDetail);

      const result = await controller.getBySlug('arbol-genealogico');

      expect(result).toEqual(mockServiceDetail);
      expect(mockOrchestrator.getServiceBySlug).toHaveBeenCalledWith(
        'arbol-genealogico',
      );
    });

    it('should throw NotFoundException when service not found', async () => {
      mockOrchestrator.getServiceBySlug.mockRejectedValue(
        new NotFoundException('Servicio no encontrado'),
      );

      await expect(controller.getBySlug('slug-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
