import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { TarotDeck } from './decks/entities/tarot-deck.entity';
import { TarotCard } from './cards/entities/tarot-card.entity';
import { TarotSpread } from './spreads/entities/tarot-spread.entity';
import { seedTarotDecks } from './database/seeds/tarot-decks.seeder';
import { seedTarotCards } from './database/seeds/tarot-cards.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const deckRepository = app.get<Repository<TarotDeck>>(
    getRepositoryToken(TarotDeck),
  );
  const cardRepository = app.get<Repository<TarotCard>>(
    getRepositoryToken(TarotCard),
  );
  const spreadRepository = app.get<Repository<TarotSpread>>(
    getRepositoryToken(TarotSpread),
  );

  try {
    console.log('🌱 Starting database seeding process...\n');

    // Seed Decks first (required for cards)
    await seedTarotDecks(deckRepository);

    // Seed Cards (requires deck to exist)
    await seedTarotCards(cardRepository, deckRepository);

    // Seed Spreads
    const spreadsCount = await spreadRepository.count();

    if (spreadsCount === 0) {
      console.log('\n🔮 Cargando tiradas iniciales...');

      // Crear una tirada de 3 cartas
      const spread = await spreadRepository.save({
        name: 'Tirada de Tres Cartas',
        description:
          'Una tirada simple pero poderosa que representa el pasado, presente y futuro en relación a una situación o pregunta.',
        cardCount: 3,
        positions: [
          {
            name: 'Pasado',
            description:
              'Representa eventos o influencias del pasado que afectan la situación actual.',
          },
          {
            name: 'Presente',
            description:
              'Muestra la situación actual y las energías que rodean el momento presente.',
          },
          {
            name: 'Futuro',
            description:
              'Indica la dirección hacia donde se dirige la situación si se mantiene el rumbo actual.',
          },
        ],
        imageUrl: 'https://ejemplo.com/tiradas/tres-cartas.jpg',
      });

      console.log(`Tirada "${spread.name}" creada con ID: ${spread.id}`);

      // Crear una tirada de Cruz Celta
      const celticCross = await spreadRepository.save({
        name: 'Cruz Celta',
        description:
          'Una de las tiradas más completas y tradicionales del tarot, que permite un análisis profundo de una situación con múltiples perspectivas.',
        cardCount: 10,
        positions: [
          {
            name: 'Presente',
            description:
              'Representa la situación actual y las energías que te rodean.',
          },
          {
            name: 'Desafío',
            description: 'El obstáculo principal que debes enfrentar.',
          },
          {
            name: 'Pasado',
            description:
              'Influencias y eventos del pasado que han contribuido a la situación actual.',
          },
          {
            name: 'Futuro',
            description:
              'Lo que podría ocurrir en un futuro cercano si se mantiene el curso actual.',
          },
          {
            name: 'Consciente',
            description: 'Lo que piensas conscientemente sobre la situación.',
          },
          {
            name: 'Inconsciente',
            description:
              'Lo que sientes inconscientemente o lo que podría estar oculto.',
          },
          {
            name: 'Tu influencia',
            description:
              'Cómo tus acciones y actitud están afectando la situación.',
          },
          {
            name: 'Influencia externa',
            description:
              'Cómo el entorno y otras personas están impactando la situación.',
          },
          {
            name: 'Esperanzas o temores',
            description: 'Tus deseos o miedos respecto a la situación.',
          },
          {
            name: 'Resultado',
            description:
              'El resultado probable si continúa el curso actual de los acontecimientos.',
          },
        ],
        imageUrl: 'https://ejemplo.com/tiradas/cruz-celta.jpg',
      });

      console.log(
        `Tirada "${celticCross.name}" creada con ID: ${celticCross.id}`,
      );
    } else {
      console.log(
        `Ya existen ${spreadsCount} tiradas en la base de datos. Saltando creación de tiradas.`,
      );
    }

    console.log('¡Datos iniciales cargados con éxito!');
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
  } finally {
    await app.close();
  }
}

void bootstrap();
