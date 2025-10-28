import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { SpreadsController } from './spreads.controller';
import { SpreadsService } from './spreads.service';
import { CreateSpreadDto } from './dto/create-spread.dto';
import { UpdateSpreadDto } from './dto/update-spread.dto';
import { TarotSpread } from './entities/tarot-spread.entity';

describe('SpreadsController', () => {
  let controller: SpreadsController;

  const mockSpread: TarotSpread = {
    id: 1,
    name: 'Tirada de Tres Cartas',
    description: 'Pasado, presente y futuro',
    cardCount: 3,
    positions: [
      { name: 'Pasado', description: 'Eventos pasados' },
      { name: 'Presente', description: 'Situación actual' },
      { name: 'Futuro', description: 'Posibilidades futuras' },
    ],
    imageUrl: 'https://example.com/three-card.jpg',
    difficulty: 'beginner',
    isBeginnerFriendly: true,
    whenToUse:
      'Ideal para consultas rápidas sobre situaciones con pasado, presente y futuro',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSpreadsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpreadsController],
      providers: [
        {
          provide: SpreadsService,
          useValue: mockSpreadsService,
        },
      ],
    }).compile();

    controller = module.get<SpreadsController>(SpreadsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllSpreads', () => {
    it('should return an array of spreads', async () => {
      const spreads = [mockSpread];
      mockSpreadsService.findAll.mockResolvedValue(spreads);

      const result = await controller.getAllSpreads();

      expect(result).toEqual(spreads);
      expect(mockSpreadsService.findAll).toHaveBeenCalled();
    });
  });

  describe('getSpreadById', () => {
    it('should return a spread by id', async () => {
      mockSpreadsService.findById.mockResolvedValue(mockSpread);

      const result = await controller.getSpreadById(1);

      expect(result).toEqual(mockSpread);
      expect(mockSpreadsService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('createSpread', () => {
    const createSpreadDto: CreateSpreadDto = {
      name: 'Cruz Celta',
      description: 'Tirada completa de 10 cartas',
      cardCount: 10,
      positions: [{ name: 'Situación', description: 'Situación actual' }],
      imageUrl: 'https://example.com/celtic-cross.jpg',
    };

    const adminUser = {
      user: {
        id: 1,
        email: 'admin@test.com',
        isAdmin: true,
      },
    };

    const regularUser = {
      user: {
        id: 2,
        email: 'user@test.com',
        isAdmin: false,
      },
    };

    it('should create a spread when user is admin', async () => {
      const newSpread = { ...mockSpread, ...createSpreadDto, id: 2 };
      mockSpreadsService.create.mockResolvedValue(newSpread);

      const result = await controller.createSpread(adminUser, createSpreadDto);

      expect(result).toEqual(newSpread);
      expect(mockSpreadsService.create).toHaveBeenCalledWith(createSpreadDto);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      await expect(
        controller.createSpread(regularUser, createSpreadDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.createSpread(regularUser, createSpreadDto),
      ).rejects.toThrow('Solo administradores pueden crear tiradas');
      expect(mockSpreadsService.create).not.toHaveBeenCalled();
    });
  });

  describe('updateSpread', () => {
    const updateSpreadDto: UpdateSpreadDto = {
      description: 'Updated description',
    };

    const adminUser = {
      user: {
        id: 1,
        email: 'admin@test.com',
        isAdmin: true,
      },
    };

    const regularUser = {
      user: {
        id: 2,
        email: 'user@test.com',
        isAdmin: false,
      },
    };

    it('should update a spread when user is admin', async () => {
      const updatedSpread = { ...mockSpread, ...updateSpreadDto };
      mockSpreadsService.update.mockResolvedValue(updatedSpread);

      const result = await controller.updateSpread(
        adminUser,
        1,
        updateSpreadDto,
      );

      expect(result).toEqual(updatedSpread);
      expect(mockSpreadsService.update).toHaveBeenCalledWith(
        1,
        updateSpreadDto,
      );
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      await expect(
        controller.updateSpread(regularUser, 1, updateSpreadDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.updateSpread(regularUser, 1, updateSpreadDto),
      ).rejects.toThrow('Solo administradores pueden actualizar tiradas');
      expect(mockSpreadsService.update).not.toHaveBeenCalled();
    });
  });

  describe('removeSpread', () => {
    const adminUser = {
      user: {
        id: 1,
        email: 'admin@test.com',
        isAdmin: true,
      },
    };

    const regularUser = {
      user: {
        id: 2,
        email: 'user@test.com',
        isAdmin: false,
      },
    };

    it('should delete a spread when user is admin', async () => {
      mockSpreadsService.remove.mockResolvedValue(undefined);

      const result = await controller.removeSpread(adminUser, 1);

      expect(result).toEqual({ message: 'Tirada eliminada con éxito' });
      expect(mockSpreadsService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      await expect(controller.removeSpread(regularUser, 1)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(controller.removeSpread(regularUser, 1)).rejects.toThrow(
        'Solo administradores pueden eliminar tiradas',
      );
      expect(mockSpreadsService.remove).not.toHaveBeenCalled();
    });
  });
});
