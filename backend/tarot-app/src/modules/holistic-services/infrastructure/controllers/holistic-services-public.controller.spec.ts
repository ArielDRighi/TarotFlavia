import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
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
      'getAllActiveServices' | 'getServiceBySlug' | 'getServiceAvailability'
    >
  > = {
    getAllActiveServices: jest.fn(),
    getServiceBySlug: jest.fn(),
    getServiceAvailability: jest.fn(),
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

  describe('GET /holistic-services/:slug/availability', () => {
    it('should return availability for a valid slug and date', async () => {
      const mockAvailability = {
        date: '2099-06-01',
        slots: [
          { time: '09:00', available: true },
          { time: '09:30', available: false },
          { time: '10:00', available: true },
        ],
      };
      mockOrchestrator.getServiceAvailability.mockResolvedValue(
        mockAvailability,
      );

      const result = await controller.getAvailability(
        'arbol-genealogico',
        '2099-06-01',
      );

      expect(result).toEqual(mockAvailability);
      expect(mockOrchestrator.getServiceAvailability).toHaveBeenCalledWith(
        'arbol-genealogico',
        '2099-06-01',
      );
    });

    it('should throw NotFoundException when service not found', async () => {
      mockOrchestrator.getServiceAvailability.mockRejectedValue(
        new NotFoundException('Servicio no encontrado'),
      );

      await expect(
        controller.getAvailability('slug-inexistente', '2099-06-01'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid date format', async () => {
      mockOrchestrator.getServiceAvailability.mockRejectedValue(
        new BadRequestException('Formato de fecha inválido'),
      );

      await expect(
        controller.getAvailability('arbol-genealogico', 'invalid-date'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for past date', async () => {
      mockOrchestrator.getServiceAvailability.mockRejectedValue(
        new BadRequestException('No se puede consultar fechas pasadas'),
      );

      await expect(
        controller.getAvailability('arbol-genealogico', '2020-01-01'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return empty slots when no availability configured', async () => {
      const mockEmptyAvailability = { date: '2099-06-01', slots: [] };
      mockOrchestrator.getServiceAvailability.mockResolvedValue(
        mockEmptyAvailability,
      );

      const result = await controller.getAvailability(
        'arbol-genealogico',
        '2099-06-01',
      );

      expect(result.slots).toHaveLength(0);
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
