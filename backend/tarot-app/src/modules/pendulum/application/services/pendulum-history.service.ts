import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendulumQuery } from '../../entities/pendulum-query.entity';
import { PendulumResponse } from '../../domain/enums/pendulum.enums';

/**
 * Interface para el resultado raw de la query de estadísticas
 */
interface StatsRawResult {
  response: string;
  count: string;
}

/**
 * Servicio para gestionar historial de consultas al péndulo
 *
 * Responsabilidades:
 * - Obtener historial de consultas de un usuario
 * - Filtrar consultas por tipo de respuesta
 * - Calcular estadísticas de consultas
 * - Eliminar consultas del historial
 *
 * Solo disponible para usuarios Premium.
 */
@Injectable()
export class PendulumHistoryService {
  constructor(
    @InjectRepository(PendulumQuery)
    private readonly repository: Repository<PendulumQuery>,
  ) {}

  /**
   * Obtiene el historial de consultas de un usuario
   * @param userId - ID del usuario
   * @param limit - Número máximo de consultas a retornar (default: 20)
   * @param filterResponse - Tipo de respuesta para filtrar (opcional)
   * @returns Lista de consultas ordenadas por fecha descendente
   */
  async getUserHistory(
    userId: number,
    limit: number = 20,
    filterResponse?: PendulumResponse,
  ): Promise<PendulumQuery[]> {
    const query = this.repository
      .createQueryBuilder('query')
      .where('query.userId = :userId', { userId })
      .orderBy('query.createdAt', 'DESC')
      .take(limit);

    if (filterResponse) {
      query.andWhere('query.response = :response', {
        response: filterResponse,
      });
    }

    return query.getMany();
  }

  /**
   * Obtiene estadísticas de consultas de un usuario
   * @param userId - ID del usuario
   * @returns Estadísticas con totales por tipo de respuesta
   */
  async getUserStats(userId: number): Promise<{
    total: number;
    yesCount: number;
    noCount: number;
    maybeCount: number;
  }> {
    const result = await this.repository
      .createQueryBuilder('query')
      .select('query.response', 'response')
      .addSelect('COUNT(*)', 'count')
      .where('query.userId = :userId', { userId })
      .groupBy('query.response')
      .getRawMany<StatsRawResult>();

    const stats = { total: 0, yesCount: 0, noCount: 0, maybeCount: 0 };

    for (const row of result) {
      const count = parseInt(row.count, 10);
      stats.total += count;
      if (row.response === 'yes') stats.yesCount = count;
      if (row.response === 'no') stats.noCount = count;
      if (row.response === 'maybe') stats.maybeCount = count;
    }

    return stats;
  }

  /**
   * Elimina una consulta del historial
   * @param userId - ID del usuario (validación de propiedad)
   * @param queryId - ID de la consulta a eliminar
   * @returns true si se eliminó, false si no se encontró
   */
  async deleteQuery(userId: number, queryId: number): Promise<boolean> {
    const result = await this.repository.delete({ id: queryId, userId });
    return (result.affected ?? 0) > 0;
  }
}
