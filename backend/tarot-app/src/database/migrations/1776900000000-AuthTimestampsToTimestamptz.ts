import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * T-PROD-021 — las expiraciones de auth pasan a `timestamptz`.
 *
 * ## Por qué
 *
 * Estas columnas eran `timestamp` **sin zona horaria**. TypeORM las escribía con
 * la hora de pared LOCAL del proceso Node y las releía como UTC al hidratar la
 * entidad: con `TZ` distinto de UTC, el `Date` volvía desfasado exactamente el
 * offset del timezone. Medido con `TZ=America/Argentina/Buenos_Aires`, un token
 * de reset con TTL de 1 hora nacía **2 horas vencido**.
 *
 * El impacto no era solo el reset de contraseña: `RefreshToken.isExpired()` hace
 * la misma comparación, así que el login se caía para todos los usuarios, y la
 * caché de interpretaciones se daba por vencida siempre (se vuelve a pagar cada
 * llamada al proveedor de IA).
 *
 * `timestamptz` guarda un **instante absoluto**: el round-trip deja de depender
 * del timezone del proceso, que es la propiedad que necesitamos.
 *
 * ## Conversión de los datos existentes
 *
 * `USING "col" AT TIME ZONE 'UTC'` reinterpreta el valor naive **como UTC**, que
 * es exactamente lo que hay guardado: el server siempre corrió en UTC (nadie
 * setea `TZ` en el Dockerfile, en CI ni en Railway). Por eso la conversión
 * preserva los instantes reales y **no invalida sesiones ni tokens vigentes**.
 *
 * Si en algún momento el server hubiera corrido en otro timezone, los datos
 * escritos en esa ventana quedarían corridos — pero ese escenario es justamente
 * el que esta migración vuelve imposible hacia adelante.
 *
 * ## Alcance
 *
 * Se convierten TODAS las columnas `timestamp` de las tres tablas, no solo
 * `expires_at`: dejar una tabla con dos semánticas distintas de tiempo es la
 * trampa que hace que el próximo que la toque se equivoque.
 *
 * NO se tocan las columnas `date` (fecha sin hora). Ésas están deliberadamente
 * en hora local y su manejo está documentado en `CLAUDE.md` (`parseBirthDate`,
 * `getTodayAppDateString`).
 */
export class AuthTimestampsToTimestamptz1776900000000 implements MigrationInterface {
  name = 'AuthTimestampsToTimestamptz1776900000000';

  private static readonly COLUMNS: ReadonlyArray<[string, string]> = [
    ['password_reset_tokens', 'expires_at'],
    ['password_reset_tokens', 'used_at'],
    ['password_reset_tokens', 'created_at'],
    ['refresh_tokens', 'expires_at'],
    ['refresh_tokens', 'created_at'],
    ['refresh_tokens', 'revoked_at'],
    ['cached_interpretations', 'expires_at'],
    ['cached_interpretations', 'created_at'],
    ['cached_interpretations', 'last_used_at'],
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [
      table,
      column,
    ] of AuthTimestampsToTimestamptz1776900000000.COLUMNS) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE TIMESTAMP WITH TIME ZONE USING "${column}" AT TIME ZONE 'UTC'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // `timestamptz AT TIME ZONE 'UTC'` devuelve la hora de pared en UTC, que es
    // el inverso exacto de la conversión de `up()`.
    for (const [
      table,
      column,
    ] of AuthTimestampsToTimestamptz1776900000000.COLUMNS) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE TIMESTAMP WITHOUT TIME ZONE USING "${column}" AT TIME ZONE 'UTC'`,
      );
    }
  }
}
