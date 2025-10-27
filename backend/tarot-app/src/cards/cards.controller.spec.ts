import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { TarotCard } from './entities/tarot-card.entity';

describe('CardsController', () => {
  let controller: CardsController;
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

  const mockCardsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByDeck: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [
        {
          provide: CardsService,
          useValue: mockCardsService,
        },
      ],
    }).compile();

    controller = module.get<CardsController>(CardsController);
    service = module.get<CardsService>(CardsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllCards', () => {
    it('should return an array of cards', async () => {
      const cards = [mockCard];
      mockCardsService.findAll.mockResolvedValue(cards);

      const result = await controller.getAllCards();

      expect(result).toEqual(cards);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getCardById', () => {
    it('should return a card by id', async () => {
      mockCardsService.findById.mockResolvedValue(mockCard);

      const result = await controller.getCardById(1);

      expect(result).toEqual(mockCard);
      expect(service.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('getCardsByDeck', () => {
    it('should return all cards from a deck', async () => {
      const cards = [mockCard];
      mockCardsService.findByDeck.mockResolvedValue(cards);

      const result = await controller.getCardsByDeck(1);

      expect(result).toEqual(cards);
      expect(service.findByDeck).toHaveBeenCalledWith(1);
    });
  });

  describe('createCard', () => {
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

    it('should create a card when user is admin', async () => {
      const newCard = { ...mockCard, ...createCardDto, id: 2 };
      mockCardsService.create.mockResolvedValue(newCard);

      const result = await controller.createCard(adminUser, createCardDto);

      expect(result).toEqual(newCard);
      expect(service.create).toHaveBeenCalledWith(createCardDto);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      await expect(
        controller.createCard(regularUser, createCardDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.createCard(regularUser, createCardDto),
      ).rejects.toThrow('Solo administradores pueden crear cartas');
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('updateCard', () => {
    const updateCardDto: UpdateCardDto = {
      meaningUpright: 'Updated meaning',
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

    it('should update a card when user is admin', async () => {
      const updatedCard = { ...mockCard, ...updateCardDto };
      mockCardsService.update.mockResolvedValue(updatedCard);

      const result = await controller.updateCard(adminUser, 1, updateCardDto);

      expect(result).toEqual(updatedCard);
      expect(service.update).toHaveBeenCalledWith(1, updateCardDto);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      await expect(
        controller.updateCard(regularUser, 1, updateCardDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.updateCard(regularUser, 1, updateCardDto),
      ).rejects.toThrow('Solo administradores pueden actualizar cartas');
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('removeCard', () => {
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

    it('should delete a card when user is admin', async () => {
      mockCardsService.remove.mockResolvedValue(undefined);

      const result = await controller.removeCard(adminUser, 1);

      expect(result).toEqual({ message: 'Carta eliminada con éxito' });
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      await expect(controller.removeCard(regularUser, 1)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(controller.removeCard(regularUser, 1)).rejects.toThrow(
        'Solo administradores pueden eliminar cartas',
      );
      expect(service.remove).not.toHaveBeenCalled();
    });
  });
});
