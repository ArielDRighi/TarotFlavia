import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { TarotInterpretation } from './entities/tarot-interpretation.entity';
import { TarotSpread } from '../spreads/entities/tarot-spread.entity';
import { TarotReading } from '../readings/entities/tarot-reading.entity';
import OpenAI from 'openai';

@Injectable()
export class InterpretationsService {
  private openai: OpenAI | null = null;

  constructor(
    @InjectRepository(TarotInterpretation)
    private interpretationRepository: Repository<TarotInterpretation>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    // Inicializar OpenAI con la clave API
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'tu_clave_de_api') {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(
          'ADVERTENCIA: No se encontró una clave API válida para OpenAI. La generación de interpretaciones no funcionará correctamente.',
        );
      }
    } else {
      this.openai = new OpenAI({ apiKey });
      if (process.env.NODE_ENV !== 'test') {
        console.log('API de OpenAI inicializada correctamente');
      }
    }
  }

  async generateInterpretation(
    cards: TarotCard[],
    positions: { cardId: number; position: string; isReversed: boolean }[],
    question?: string,
    spread?: TarotSpread,
  ): Promise<string> {
    if (!this.openai) {
      throw new InternalServerErrorException(
        'No se puede generar una interpretación porque la clave API de OpenAI no está configurada correctamente.',
      );
    }

    // Construir el contexto para la interpretación
    let prompt = 'Por favor, interpreta esta lectura de tarot:\n\n';

    // Agregar información sobre la tirada si está disponible
    if (spread) {
      prompt += `Tirada: ${spread.name}\nDescripción: ${spread.description}\n\n`;
    }

    // Agregar pregunta si existe
    if (question) {
      prompt += `Pregunta: "${question}"\n\n`;
    }

    // Preparar información de las cartas
    const cardDetails = cards.map((card) => {
      const position = positions.find((p) => p.cardId === card.id);
      const orientation = position?.isReversed ? 'invertida' : 'derecha';
      const meaning = position?.isReversed
        ? card.meaningReversed
        : card.meaningUpright;

      return {
        name: card.name,
        position: position?.position || 'No especificada',
        orientation,
        meaning,
        keywords: card.keywords,
        description: card.description,
      };
    });

    prompt += 'Cartas en la lectura:\n';
    cardDetails.forEach((card, index) => {
      prompt += `\nCarta ${index + 1}: ${card.name} (${card.orientation}) en posición "${card.position}"\n`;
      prompt += `Significado: ${card.meaning}\n`;
      prompt += `Palabras clave: ${card.keywords}\n`;
    });

    prompt += '\nPor favor proporciona:\n';
    prompt += '1. Una interpretación general de la lectura\n';
    prompt += '2. La interpretación de cada carta en su posición específica\n';
    prompt += '3. Como las cartas se relacionan entre sí\n';
    prompt += '4. Consejos prácticos basados en la lectura\n';
    prompt += '5. Una conclusión final\n\n';

    if (question) {
      prompt += `Por favor enfoca tu interpretación a la pregunta: "${question}"\n\n`;
    }

    try {
      console.log('Enviando solicitud a OpenAI...');
      const model =
        this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';

      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content:
              'Eres un experto tarólogo con años de experiencia en la lectura e interpretación del tarot. Debes proporcionar interpretaciones profundas, intuitivas y útiles basadas en las cartas presentadas. Usa un lenguaje claro pero místico, hablando directamente a la persona que consulta.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      // Obtener la interpretación generada
      const interpretation = response.choices[0].message.content;

      if (!interpretation) {
        throw new Error('No se pudo generar una interpretación');
      }

      // Registrar la interpretación generada (opcional)
      await this.saveInterpretation(interpretation, model, {
        model,
        temperature: 0.7,
        maxTokens: 1500,
      });

      return interpretation;
    } catch (error) {
      console.error('Error al generar interpretación con OpenAI:', error);
      throw new InternalServerErrorException(
        'Error al generar la interpretación. Por favor intenta nuevamente más tarde.',
      );
    }
  }

  private async saveInterpretation(
    content: string,
    modelUsed: string,
    aiConfig: any,
  ) {
    try {
      const interpretation = this.interpretationRepository.create({
        content,
        modelUsed,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        aiConfig,
      });
      await this.interpretationRepository.save(interpretation);
    } catch (error) {
      console.error('Error al guardar interpretación:', error);
      // No lanzamos excepción para no interrumpir el flujo principal
    }
  }

  async attachInterpretationToReading(
    readingId: number,
    interpretation: string,
    modelUsed: string,
    aiConfig: any,
  ) {
    try {
      const tarotInterpretation = this.interpretationRepository.create({
        reading: { id: readingId } as Pick<TarotReading, 'id'>,
        content: interpretation,
        modelUsed,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        aiConfig,
      });
      return await this.interpretationRepository.save(tarotInterpretation);
    } catch (error) {
      console.error('Error al asociar interpretación a lectura:', error);
      throw new InternalServerErrorException(
        'Error al guardar la interpretación',
      );
    }
  }

  // Método para regenerar la interpretación de una lectura existente
  async regenerateInterpretation(reading: TarotReading): Promise<string> {
    const cards = reading.cards;
    const positions = reading.cardPositions;

    const newInterpretation = await this.generateInterpretation(
      cards,
      positions,
      reading.question,
    );

    // Actualizar la interpretación en la lectura
    reading.interpretation = newInterpretation;

    return newInterpretation;
  }
}
