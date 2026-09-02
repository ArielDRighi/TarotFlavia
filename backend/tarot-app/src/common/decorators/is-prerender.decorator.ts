import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Header que el build del frontend manda para avisar que la request es un
 * prerender y no la visita de una persona.
 *
 * Vive acá y no suelto en cada controller para que el nombre exista en un solo
 * lugar: si cambia, cambia una vez. El equivalente del lado del frontend está
 * en `lib/api/prerender.ts`.
 */
export const PRERENDER_HEADER = 'x-prerender';

/**
 * La lógica del decorador, exportada aparte para poder testearla.
 *
 * `createParamDecorator` no deja llegar a la función que envuelve, así que un
 * spec sobre el decorador sólo puede afirmar que es una función — que es lo que
 * hace el de `CurrentUser` y no verifica nada. Con el resolver afuera, el
 * comportamiento se prueba de verdad.
 *
 * Express normaliza los nombres de header a minúsculas, así que `X-Prerender`,
 * `x-prerender` y `X-PRERENDER` entran todos por la misma clave.
 *
 * Lo que decide es la **presencia** del header, no su valor: un
 * `X-Prerender: 0` cuenta como prerender igual que un `1`. Es deliberado —el
 * frontend manda siempre `'1'` y no hay ningún caso de uso para apagarlo con un
 * valor— pero conviene saberlo antes de sorprenderse. Sólo el header ausente o
 * vacío cuenta la vista.
 */
export function resolveIsPrerender(ctx: ExecutionContext): boolean {
  const request = ctx.switchToHttp().getRequest<Request>();
  return Boolean(request.headers[PRERENDER_HEADER]);
}

/**
 * `true` cuando la request viene del export estático del frontend.
 *
 * Sirve para no contar como vista lo que no es una vista. El `npm run build`
 * del frontend prerenderiza las 78 fichas y los 48 artículos pegándole a esta
 * API, así que cada deploy inflaba `view_count` con ~126 visitas que nunca
 * existieron (T-DEPLOY-002).
 *
 * ⚠️ **Es una pista, no una credencial.** Cualquiera puede mandar el header y
 * dejar de ser contado. Para un contador de vistas eso es aceptable: no hay
 * nada que ganar falsificándolo y no gatea ningún acceso. **No usar este
 * decorador para nada que tenga consecuencias.**
 *
 * @example
 * @Get(':slug')
 * async getCard(@Param('slug') slug: string, @IsPrerender() isPrerender: boolean) {
 *   return this.service.findBySlug(slug, { countView: !isPrerender });
 * }
 */
export const IsPrerender = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): boolean => resolveIsPrerender(ctx),
);
