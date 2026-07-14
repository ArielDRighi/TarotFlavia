import type { MetadataRoute } from 'next';
import { getBaseUrl } from './base-url';
import { isIndexingAllowed } from './indexing';

/**
 * Rutas que no deben rastrearse.
 *
 * Dos motivos: (a) el gating de sesión es client-side (`useRequireAuth` redirige
 * en un `useEffect`), así que Googlebot recibe un 200 con un esqueleto vacío; y
 * (b) rutas sin valor de búsqueda (retorno de pago, tokens, formularios de auth).
 *
 * ⚠️ Ojo con el prefijo: en robots.txt una regla matchea por **prefijo de path**,
 * así que `/tarot` también bloquearía `/tarotistas/1` y `/ritual` bloquearía
 * `/rituales` — ambas públicas. Por eso esas dos van como `/x/` (subrutas) + `/x$`
 * (la ruta exacta), nunca como `/x` a secas.
 */
const DISALLOWED_PATHS = [
  '/admin/',
  '/admin$',
  '/perfil/',
  '/perfil$',
  '/historial/',
  '/historial$',
  '/mis-servicios$',
  '/sesiones$',
  '/rituales/historial',
  '/carta-del-dia/historial',
  '/carta-astral/resultado',
  '/servicios/reservar/',
  '/premium/activacion',
  '/compartida/',
  '/tarot/',
  '/tarot$',
  '/ritual/',
  '/ritual$',
  '/login',
  '/registro',
  '/recuperar-password',
  '/restablecer-password',
];

export function buildRobots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  // Staging, previews y local: nada se rastrea ni se indexa
  if (!isIndexingAllowed()) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: DISALLOWED_PATHS }],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
