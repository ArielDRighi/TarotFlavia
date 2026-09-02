import { Logger } from '@nestjs/common';

/**
 * Dispara una escritura que **no puede romper la respuesta** y registra el
 * fallo si lo hay.
 *
 * Es el patrón que salió del incidente del 31-ago-2026: un `await` a un
 * contador de vistas dentro de un endpoint de lectura convirtió un
 * `Query read timeout` en un 500 y tiró el deploy del frontend (T-DEPLOY-001).
 * La regla que quedó es que la telemetría nunca va en el camino crítico.
 *
 * **Por qué loguea en vez de silenciar.** La primera versión de aquel fix usaba
 * un `.catch()` vacío. En producción TypeORM corre con `logging: false`
 * (`config/typeorm.ts:80`), así que eso dejaba el fallo **sin ningún rastro** —
 * y el log que permitió diagnosticar el incidente venía del interceptor HTTP,
 * que es justamente lo que este patrón deja de alcanzar.
 *
 * **Por qué devuelve `void`.** Para que no se pueda esperar por accidente. El
 * tipo es la mitad de la garantía; la otra mitad es el `.catch()`.
 *
 * ⚠️ La operación puede perderse si llega un SIGTERM entre la respuesta y el
 * commit. Para contadores es el trade-off que se elige a cambio de no tumbar la
 * lectura. Si algún número tiene que ser exacto, no se arregla con `await`: se
 * arregla con un buffer y un flush.
 *
 * @example
 * fireAndForget(
 *   this.cardRepository.increment({ id }, 'viewCount', 1),
 *   this.logger,
 *   `No se pudo incrementar view_count de la carta ${id}`,
 * );
 */
export function fireAndForget(
  operacion: Promise<unknown>,
  logger: Logger,
  queFallo: string,
): void {
  void operacion.catch((error: unknown) => {
    // El `try` no es paranoia: sin él, un logger que tira —un transport roto—
    // dejaría rechazada la promesa que devuelve este `.catch()`, y esa sí no
    // tiene a nadie atrás. Sería una unhandled rejection, o sea el proceso, que
    // es la moraleja entera de este backlog. Los `.catch(() => {})` que este
    // helper reemplaza no podían fallar; esto empata esa garantía.
    try {
      logger.warn(
        `${queFallo}: ${error instanceof Error ? error.message : String(error)}`,
      );
    } catch {
      // Si ni siquiera se puede loguear, no queda nada útil por hacer acá.
    }
  });
}
