import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Servicio de mezcla de cartas del lado del servidor.
 *
 * La identidad y la orientación de cada carta se deciden EXCLUSIVAMENTE aquí,
 * con aleatoriedad criptográfica (`crypto.randomInt`). Nunca se usa
 * `Math.random`, que no ofrece garantías de imprevisibilidad y permitiría a un
 * cliente predecir la tirada.
 */
@Injectable()
export class DeckShufflerService {
  /**
   * Probabilidad de negocio de que una carta salga invertida (30%).
   * Se mantiene como constante para no dispersar el número mágico.
   */
  static readonly REVERSED_PROBABILITY = 0.3;

  /**
   * Mezcla criptográfica (Fisher-Yates) que devuelve una copia nueva sin mutar
   * el array original.
   */
  shuffle<T>(items: readonly T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = crypto.randomInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Baraja el pool elegible y toma las primeras `count` cartas.
   *
   * @throws Error si `count` es negativo o supera el tamaño del pool.
   */
  draw<T>(pool: readonly T[], count: number): T[] {
    if (count < 0) {
      throw new Error('La cantidad de cartas a repartir no puede ser negativa');
    }
    if (count > pool.length) {
      throw new Error(
        `No hay suficientes cartas para la tirada: se requieren ${count}, hay ${pool.length}`,
      );
    }
    return this.shuffle(pool).slice(0, count);
  }

  /**
   * Decide con azar criptográfico si una carta sale invertida, respetando la
   * probabilidad de negocio (`REVERSED_PROBABILITY`).
   */
  decideReversed(): boolean {
    return (
      crypto.randomInt(100) < DeckShufflerService.REVERSED_PROBABILITY * 100
    );
  }
}
