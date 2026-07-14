/**
 * Control de indexación por entorno.
 *
 * La indexación se deriva del **host** de `NEXT_PUBLIC_APP_URL` en vez de un flag
 * propio: así es *fail-closed*. Solo el dominio productivo se indexa; staging,
 * los previews de Railway y el desarrollo local quedan fuera **sin necesidad de
 * acordarse de setear nada**. Un flag que hay que recordar apagar es exactamente
 * la clase de error que dejó a staging indexable.
 */

/** Hosts que sí pueden ser indexados. Única fuente de verdad. */
export const PRODUCTION_HOSTS = ['auguriatarot.com', 'www.auguriatarot.com'] as const;

export function isIndexingAllowed(): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) return false;

  try {
    const host = new URL(appUrl).host.toLowerCase();
    return (PRODUCTION_HOSTS as readonly string[]).includes(host);
  } catch {
    // URL malformada: no indexar (fail-closed) en vez de romper el build
    return false;
  }
}
