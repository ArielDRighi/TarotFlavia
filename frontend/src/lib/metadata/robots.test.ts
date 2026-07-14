import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildRobots } from './robots';

/**
 * Simula el matching de robots.txt como lo hace Google: una regla es un prefijo
 * de path, con dos comodines — `*` (cualquier secuencia) y `$` (fin exacto).
 *
 * Existe para poder aseverar el COMPORTAMIENTO ("¿queda bloqueada /tarotistas/1?")
 * y no la forma de la lista, que es donde se esconden los errores de prefijo.
 */
function isBlocked(path: string, disallow: string[]): boolean {
  return disallow.some((rule) => {
    const anchored = rule.endsWith('$');
    const pattern = anchored ? rule.slice(0, -1) : rule;
    const source = pattern
      .split('*')
      .map((chunk) => chunk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*');

    return new RegExp(`^${source}${anchored ? '$' : ''}`).test(path);
  });
}

function getDisallowRules(): string[] {
  const { rules } = buildRobots();
  const rule = Array.isArray(rules) ? rules[0] : rules;
  const { disallow } = rule;

  if (!disallow) return [];
  return Array.isArray(disallow) ? disallow : [disallow];
}

describe('buildRobots', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('fuera del dominio productivo', () => {
    it('bloquea el sitio entero en staging', () => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://staging.auguriatarot.com');

      const robots = buildRobots();
      const rule = Array.isArray(robots.rules) ? robots.rules[0] : robots.rules;

      expect(rule.disallow).toBe('/');
      expect(rule.allow).toBeUndefined();
    });

    it('no publica el sitemap en staging: no hay nada que rastrear', () => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://staging.auguriatarot.com');

      expect(buildRobots().sitemap).toBeUndefined();
    });
  });

  describe('en el dominio productivo', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://auguriatarot.com');
    });

    it('permite el rastreo y publica el sitemap', () => {
      const robots = buildRobots();
      const rule = Array.isArray(robots.rules) ? robots.rules[0] : robots.rules;

      expect(rule.allow).toBe('/');
      expect(robots.sitemap).toBe('https://auguriatarot.com/sitemap.xml');
    });

    it('bloquea las rutas privadas (Googlebot solo vería un esqueleto vacío)', () => {
      const disallow = getDisallowRules();

      expect(isBlocked('/admin/usuarios', disallow)).toBe(true);
      expect(isBlocked('/perfil', disallow)).toBe(true);
      expect(isBlocked('/historial/12', disallow)).toBe(true);
      expect(isBlocked('/mis-servicios', disallow)).toBe(true);
      expect(isBlocked('/sesiones', disallow)).toBe(true);
      expect(isBlocked('/premium/activacion', disallow)).toBe(true);
      expect(isBlocked('/compartida/abc123', disallow)).toBe(true);
      expect(isBlocked('/servicios/reservar/7', disallow)).toBe(true);
    });

    it('bloquea las rutas privadas que viven DENTRO de una sección pública', () => {
      const disallow = getDisallowRules();

      // El detalle del servicio y el perfil del tarotista son públicos, pero el
      // paso de pago y la reserva exigen sesión: hay que bloquearlos sin bloquear
      // a sus padres. Por eso van con comodín.
      expect(isBlocked('/servicios/registros-akashicos/pago', disallow)).toBe(true);
      expect(isBlocked('/tarotistas/3/reservar', disallow)).toBe(true);
      expect(isBlocked('/carta-astral/historial', disallow)).toBe(true);

      expect(isBlocked('/servicios/registros-akashicos', disallow)).toBe(false);
      expect(isBlocked('/tarotistas/3', disallow)).toBe(false);
      expect(isBlocked('/carta-astral', disallow)).toBe(false);
    });

    it('bloquea el flujo de lectura (/tarot y /ritual) sin arrastrar rutas públicas parecidas', () => {
      const disallow = getDisallowRules();

      // El flujo autenticado: bloqueado
      expect(isBlocked('/tarot', disallow)).toBe(true);
      expect(isBlocked('/tarot/tirada', disallow)).toBe(true);
      expect(isBlocked('/ritual', disallow)).toBe(true);
      expect(isBlocked('/ritual/preguntas', disallow)).toBe(true);

      // La trampa del prefijo: "/tarot" también matchea "/tarotistas/1", y
      // "/ritual" matchea "/rituales". Ambas son públicas y deben rastrearse.
      expect(isBlocked('/tarotistas/1', disallow)).toBe(false);
      expect(isBlocked('/rituales', disallow)).toBe(false);
      expect(isBlocked('/rituales/luna-llena', disallow)).toBe(false);
    });

    it('no bloquea el contenido indexable', () => {
      const disallow = getDisallowRules();

      expect(isBlocked('/', disallow)).toBe(false);
      expect(isBlocked('/enciclopedia/tarot/the-fool', disallow)).toBe(false);
      expect(isBlocked('/horoscopo/aries', disallow)).toBe(false);
      expect(isBlocked('/horoscopo-chino/rat', disallow)).toBe(false);
      expect(isBlocked('/servicios/lectura-de-registros', disallow)).toBe(false);
      expect(isBlocked('/premium', disallow)).toBe(false);
      expect(isBlocked('/contacto', disallow)).toBe(false);
    });
  });
});
