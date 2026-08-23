/**
 * JsonLd
 *
 * Inserta un bloque de datos estructurados en el documento (T-SEO-011).
 *
 * Sin `'use client'` a propósito: Googlebot lee el JSON-LD del HTML servido, así
 * que el bloque tiene que estar en el render del servidor y no aparecer recién
 * después de hidratar.
 *
 * `dangerouslySetInnerHTML` es la forma en la que React documenta este caso: un
 * `<script>{...}</script>` con hijos de texto queda escapado como HTML y el
 * parser de Google recibe entidades en vez de JSON. El contenido no es entrada
 * de usuario —sale de nuestros builders— y aun así se neutraliza el cierre de
 * etiqueta, que es lo único que podría romper el documento.
 *
 * @example
 * ```tsx
 * <JsonLd id="organization-jsonld" data={buildOrganizationJsonLd()} />
 * ```
 */

/** Un objeto serializable a JSON. Los builders devuelven interfaces concretas. */
export type JsonLdData = Record<string, unknown>;

export interface JsonLdProps {
  /** Datos estructurados a emitir. */
  data: JsonLdData;
  /** `id` del `<script>`, útil cuando la página emite más de un bloque. */
  id?: string;
}

/**
 * Escapa el `<` de un `</script>` embebido. Sin esto, un valor que contenga esa
 * secuencia cerraría la etiqueta antes de tiempo y partiría el documento en dos.
 */
function serialize(data: JsonLdData): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
