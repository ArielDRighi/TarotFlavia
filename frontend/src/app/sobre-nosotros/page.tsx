import type { Metadata } from 'next';

import { AboutContent } from '@/components/features/about';
import { JsonLd } from '@/components/common/JsonLd';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';
import { buildAboutPageJsonLd, buildOrganizationJsonLd } from '@/lib/metadata/structured-data';

/**
 * Sobre Nosotros
 *
 * Route: /sobre-nosotros
 *
 * Página de señales de autoría del sitio (T-SEO-011). Es estática y server
 * component: nada de lo que muestra depende de la API ni de la sesión, así que
 * el crawler recibe el contenido completo —y el JSON-LD— en el HTML inicial.
 *
 * Emite dos bloques de datos estructurados: el `Organization` del sitio (esta es
 * su fuente canónica) y el `AboutPage` de esta URL, que lo referencia por `@id`.
 *
 * ⚠️ NO va en `DISALLOWED_PATHS` de `robots.ts`: es de las páginas que más
 * queremos que se indexen.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.sobreNosotros;

export default function SobreNosotrosPage() {
  return (
    <>
      <JsonLd id="organization-jsonld" data={{ ...buildOrganizationJsonLd() }} />
      <JsonLd id="about-page-jsonld" data={{ ...buildAboutPageJsonLd() }} />
      <AboutContent />
    </>
  );
}
