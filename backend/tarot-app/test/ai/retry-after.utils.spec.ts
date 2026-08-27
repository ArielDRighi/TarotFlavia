import { parseRetryAfterMs } from '../../src/modules/ai/infrastructure/errors/retry-after.utils';

/**
 * T-IA-005: el reintento tiene que preguntarle al proveedor CUÁNDO volver.
 *
 * Durante el incidente del 26-ago-2026 la respuesta a un 429 por tokens era
 * volver a pedir a los 2s del backoff ciego, dentro de la misma ventana del
 * bucket que se acababa de vaciar: el reintento realimentaba el 429. Los tres
 * proveedores dicen cuándo reintentar, cada uno en su formato; esto los lee.
 */
describe('parseRetryAfterMs', () => {
  describe('cabecera `retry-after` (segundos)', () => {
    it('lee un entero de segundos y lo pasa a milisegundos', () => {
      expect(parseRetryAfterMs({ headers: { 'retry-after': '30' } })).toBe(
        30_000,
      );
    });

    it('lee segundos fraccionarios', () => {
      expect(parseRetryAfterMs({ headers: { 'retry-after': '2.5' } })).toBe(
        2_500,
      );
    });

    it('acepta la cabecera en un objeto tipo `Headers` (con .get)', () => {
      const headers = new Map([['retry-after', '12']]);

      expect(
        parseRetryAfterMs({
          headers: { get: (name: string) => headers.get(name) ?? null },
        }),
      ).toBe(12_000);
    });

    it('es insensible a mayúsculas en el nombre de la cabecera', () => {
      expect(parseRetryAfterMs({ headers: { 'Retry-After': '5' } })).toBe(
        5_000,
      );
    });
  });

  describe('cabecera `retry-after` (fecha HTTP)', () => {
    it('devuelve lo que falta hasta la fecha indicada', () => {
      const enTreintaSegundos = new Date(Date.now() + 30_000).toUTCString();

      const parsed = parseRetryAfterMs({
        headers: { 'retry-after': enTreintaSegundos },
      });

      // `toUTCString` trunca a segundos, así que se admite ese redondeo.
      expect(parsed).toBeGreaterThanOrEqual(29_000);
      expect(parsed).toBeLessThanOrEqual(30_000);
    });

    it('devuelve 0 para una fecha ya pasada (nunca una espera negativa)', () => {
      const haceUnMinuto = new Date(Date.now() - 60_000).toUTCString();

      expect(
        parseRetryAfterMs({ headers: { 'retry-after': haceUnMinuto } }),
      ).toBe(0);
    });
  });

  describe('cabecera `retry-after-ms` (OpenAI)', () => {
    it('la prefiere sobre `retry-after` por ser más precisa', () => {
      expect(
        parseRetryAfterMs({
          headers: { 'retry-after': '1', 'retry-after-ms': '1450' },
        }),
      ).toBe(1_450);
    });
  });

  describe('cabeceras `x-ratelimit-reset-*` (Groq)', () => {
    it('lee el formato de duración de Groq en segundos ("7.66s")', () => {
      expect(
        parseRetryAfterMs({
          headers: { 'x-ratelimit-reset-tokens': '7.66s' },
        }),
      ).toBe(7_660);
    });

    it('lee minutos y segundos combinados ("2m59.56s")', () => {
      expect(
        parseRetryAfterMs({
          headers: { 'x-ratelimit-reset-tokens': '2m59.56s' },
        }),
      ).toBe(179_560);
    });

    it('lee milisegundos ("500ms")', () => {
      expect(
        parseRetryAfterMs({
          headers: { 'x-ratelimit-reset-tokens': '500ms' },
        }),
      ).toBe(500);
    });

    it('el techo que manda es el de TOKENS, no el de requests', () => {
      // El incidente probó que en el tier gratuito de Groq el límite que se
      // toca primero es el de 8.000 tokens/minuto. Si vinieran los dos, hay
      // que esperar al más lejano para no volver a chocar.
      expect(
        parseRetryAfterMs({
          headers: {
            'x-ratelimit-reset-requests': '1s',
            'x-ratelimit-reset-tokens': '45s',
          },
        }),
      ).toBe(45_000);
    });
  });

  describe('valores que no sirven', () => {
    it('devuelve undefined si no hay cabeceras', () => {
      expect(parseRetryAfterMs(new Error('boom'))).toBeUndefined();
    });

    it('devuelve undefined si el error no es un objeto', () => {
      expect(parseRetryAfterMs('boom')).toBeUndefined();
      expect(parseRetryAfterMs(null)).toBeUndefined();
      expect(parseRetryAfterMs(undefined)).toBeUndefined();
    });

    it('devuelve undefined ante un valor no parseable', () => {
      expect(
        parseRetryAfterMs({ headers: { 'retry-after': 'pronto' } }),
      ).toBeUndefined();
    });

    it('ignora valores negativos (una espera negativa no es una espera)', () => {
      expect(
        parseRetryAfterMs({ headers: { 'retry-after': '-5' } }),
      ).toBeUndefined();
    });

    it('acepta el 0 explícito como "ya podés reintentar"', () => {
      expect(parseRetryAfterMs({ headers: { 'retry-after': '0' } })).toBe(0);
    });

    it('devuelve undefined si `headers` no es un objeto', () => {
      expect(parseRetryAfterMs({ headers: 'retry-after: 5' })).toBeUndefined();
    });

    it('busca también en `error.response.headers` (clientes tipo axios)', () => {
      expect(
        parseRetryAfterMs({ response: { headers: { 'retry-after': '8' } } }),
      ).toBe(8_000);
    });
  });
});
