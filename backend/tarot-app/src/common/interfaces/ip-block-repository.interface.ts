import { IpBlock } from '../entities/ip-block.entity';

/**
 * Interfaz del repositorio de bloqueos de IP.
 * Permite persistir y consultar bloques de forma independiente del ORM.
 */
export interface IIpBlockRepository {
  /**
   * Guarda o actualiza un bloqueo de IP.
   * Si ya existe un bloqueo para esa IP, lo reemplaza.
   */
  upsert(ip: string, blockedUntil: Date, reason: string): Promise<void>;

  /**
   * Elimina el bloqueo de una IP.
   */
  remove(ip: string): Promise<void>;

  /**
   * Obtiene los bloqueos vigentes (blocked_until > now).
   */
  findActive(): Promise<IpBlock[]>;

  /**
   * Elimina todos los bloqueos expirados (blocked_until <= now).
   */
  deleteExpired(): Promise<void>;
}
