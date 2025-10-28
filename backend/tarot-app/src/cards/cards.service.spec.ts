import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CardsService } from './cards.service';
import { TarotCard } from './entities/tarot-card.entity';
import { TarotDeck } from '../decks/entities/tarot-deck.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

describe('CardsService', () => {
  let service: CardsService;

  const mockCard: TarotCard = {
    id: 1,
    name: 'The Fool',
    number: 0,
    category: 'arcanos_mayores',
    imageUrl: 'https://example.com/fool.jpg',
    reversedImageUrl: 'https://example.com/fool-reversed.jpg',
    meaningUpright: 'New beginnings',
    meaningReversed: 'Recklessness',
    description: 'The Fool represents new beginnings',
    keywords: 'adventure, freedom, potential',
    deckId: 1,
    deck: {
      id: 1,
      name: 'Rider-Waite',
      description: 'Classic tarot deck',
      imageUrl: 'https://example.com/rw.jpg',
      cardCount: 78,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      cards: [],
    },
    readings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDeck: TarotDeck = {
    id: 1,
    name: 'Rider-Waite',
    description: 'Classic tarot deck',
    imageUrl: 'https://example.com/rw.jpg',
    cardCount: 78,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    cards: [],
  };

  const mockCardRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockDeckRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: getRepositoryToken(TarotCard),
          useValue: mockCardRepository,
        },
        {
          provide: getRepositoryToken(TarotDeck),
          useValue: mockDeckRepository,
        },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of cards', async () => {
      const cards = [mockCard];
      mockCardRepository.find.mockResolvedValue(cards);

      const result = await service.findAll();

      expect(result).toEqual(cards);
      expect(mockCardRepository.find).toHaveBeenCalledWith({
        relations: ['deck'],
      });
    });

    it('should return an empty array if no cards exist', async () => {
      mockCardRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a card by id', async () => {
      mockCardRepository.findOne.mockResolvedValue(mockCard);

      const result = await service.findById(1);

      expect(result).toEqual(mockCard);
      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['deck'],
      });
    });

    it('should throw NotFoundException if card not found', async () => {
      mockCardRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      await expect(service.findById(999)).rejects.toThrow(
        'Carta con ID 999 no encontrada',
      );
    });
  });

  describe('findByDeck', () => {
    it('should return all cards from a deck', async () => {
      const cards = [mockCard];
      mockDeckRepository.findOne.mockResolvedValue(mockDeck);
      mockCardRepository.find.mockResolvedValue(cards);

      const result = await service.findByDeck(1);

      expect(result).toEqual(cards);
      expect(mockDeckRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockCardRepository.find).toHaveBeenCalledWith({
        where: { deckId: 1 },
        relations: ['deck'],
      });
    });

    it('should throw NotFoundException if deck does not exist', async () => {
      mockDeckRepository.findOne.mockResolvedValue(null);

      await expect(service.findByDeck(999)).rejects.toThrow(NotFoundException);
      await expect(service.findByDeck(999)).rejects.toThrow(
        'Mazo con ID 999 no encontrado',
      );
    });
  });

  describe('create', () => {
    const createCardDto: CreateCardDto = {
      name: 'The Magician',
      number: 1,
      category: 'arcanos_mayores',
      imageUrl: 'https://example.com/magician.jpg',
      reversedImageUrl: 'https://example.com/magician-reversed.jpg',
      meaningUpright: 'Manifestation',
      meaningReversed: 'Manipulation',
      description: 'The Magician represents manifestation',
      keywords: 'power, skill, concentration',
      deckId: 1,
    };

    it('should create a new card', async () => {
      const newCard = { ...mockCard, ...createCardDto, id: 2 };
      mockDeckRepository.findOne.mockResolvedValue(mockDeck);
      mockCardRepository.findOne.mockResolvedValue(null);
      mockCardRepository.create.mockReturnValue(newCard);
      mockCardRepository.save.mockResolvedValue(newCard);

      const result = await service.create(createCardDto);

      expect(result).toEqual(newCard);
      expect(mockDeckRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { name: createCardDto.name, deckId: createCardDto.deckId },
      });
      expect(mockCardRepository.create).toHaveBeenCalledWith(createCardDto);
      expect(mockCardRepository.save).toHaveBeenCalledWith(newCard);
    });

    it('should throw NotFoundException if deck does not exist', async () => {
      mockDeckRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createCardDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createCardDto)).rejects.toThrow(
        'Mazo con ID 1 no encontrado',
      );
    });

    it('should throw ConflictException if card with same name exists in deck', async () => {
      mockDeckRepository.findOne.mockResolvedValue(mockDeck);
      mockCardRepository.findOne.mockResolvedValue(mockCard);

      await expect(service.create(createCardDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createCardDto)).rejects.toThrow(
        `Ya existe una carta con el nombre '${createCardDto.name}' en este mazo`,
      );
    });
  });

  describe('update', () => {
    const updateCardDto: UpdateCardDto = {
      meaningUpright: 'Updated meaning',
    };

    it('should update a card', async () => {
      const updatedCard = { ...mockCard, ...updateCardDto };
      mockCardRepository.findOne.mockResolvedValue(mockCard);
      mockCardRepository.save.mockResolvedValue(updatedCard);

      const result = await service.update(1, updateCardDto);

      expect(result).toEqual(updatedCard);
      expect(mockCardRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateCardDto),
      );
    });

    it('should throw NotFoundException if card does not exist', async () => {
      mockCardRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateCardDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a card', async () => {
      mockCardRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockCardRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if card does not exist', async () => {
      mockCardRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'Carta con ID 999 no encontrada',
      );
    });
  });
});
