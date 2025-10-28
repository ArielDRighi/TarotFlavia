import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SpreadsService } from './spreads.service';
import { TarotSpread } from './entities/tarot-spread.entity';
import { CreateSpreadDto } from './dto/create-spread.dto';
import { UpdateSpreadDto } from './dto/update-spread.dto';

describe('SpreadsService', () => {
  let service: SpreadsService;

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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSpreadRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpreadsService,
        {
          provide: getRepositoryToken(TarotSpread),
          useValue: mockSpreadRepository,
        },
      ],
    }).compile();

    service = module.get<SpreadsService>(SpreadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of spreads', async () => {
      const spreads = [mockSpread];
      mockSpreadRepository.find.mockResolvedValue(spreads);

      const result = await service.findAll();

      expect(result).toEqual(spreads);
      expect(mockSpreadRepository.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a spread by id', async () => {
      mockSpreadRepository.findOne.mockResolvedValue(mockSpread);

      const result = await service.findById(1);

      expect(result).toEqual(mockSpread);
      expect(mockSpreadRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if spread not found', async () => {
      mockSpreadRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      await expect(service.findById(999)).rejects.toThrow(
        'Tirada con ID 999 no encontrada',
      );
    });
  });

  describe('create', () => {
    const createSpreadDto: CreateSpreadDto = {
      name: 'Cruz Celta',
      description: 'Tirada completa de 10 cartas',
      cardCount: 10,
      positions: [{ name: 'Situación', description: 'Situación actual' }],
      imageUrl: 'https://example.com/celtic-cross.jpg',
    };

    it('should create a new spread', async () => {
      const newSpread = { ...mockSpread, ...createSpreadDto, id: 2 };
      mockSpreadRepository.findOne.mockResolvedValue(null);
      mockSpreadRepository.create.mockReturnValue(newSpread);
      mockSpreadRepository.save.mockResolvedValue(newSpread);

      const result = await service.create(createSpreadDto);

      expect(result).toEqual(newSpread);
      expect(mockSpreadRepository.findOne).toHaveBeenCalledWith({
        where: { name: createSpreadDto.name },
      });
      expect(mockSpreadRepository.create).toHaveBeenCalledWith(createSpreadDto);
      expect(mockSpreadRepository.save).toHaveBeenCalledWith(newSpread);
    });

    it('should throw ConflictException if spread name already exists', async () => {
      mockSpreadRepository.findOne.mockResolvedValue(mockSpread);

      await expect(service.create(createSpreadDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createSpreadDto)).rejects.toThrow(
        `Ya existe una tirada con el nombre: ${createSpreadDto.name}`,
      );
    });
  });

  describe('update', () => {
    const updateSpreadDto: UpdateSpreadDto = {
      description: 'Updated description',
    };

    it('should update a spread', async () => {
      const updatedSpread = { ...mockSpread, ...updateSpreadDto };
      mockSpreadRepository.findOne.mockResolvedValue(mockSpread);
      mockSpreadRepository.save.mockResolvedValue(updatedSpread);

      const result = await service.update(1, updateSpreadDto);

      expect(result).toEqual(updatedSpread);
      expect(mockSpreadRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateSpreadDto),
      );
    });

    it('should throw NotFoundException if spread does not exist', async () => {
      mockSpreadRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateSpreadDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a spread', async () => {
      mockSpreadRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockSpreadRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if spread does not exist', async () => {
      mockSpreadRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'Tirada con ID 999 no encontrada',
      );
    });
  });
});
