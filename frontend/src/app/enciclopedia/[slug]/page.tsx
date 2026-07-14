import { permanentRedirect } from 'next/navigation';

import { ROUTES } from '@/lib/constants/routes';

/**
 * Ruta legacy de la ficha de carta.
 *
 * Servía exactamente el mismo contenido que `/enciclopedia/tarot/[slug]` en otra
 * URL — contenido duplicado ante Google — y ningún enlace del sitio la usa (el hub
 * y las cartas relacionadas apuntan a la de `tarot/`). Redirige a la canónica en
 * vez de declararla con un `<link rel="canonical">`: así la URL vieja deja de
 * servir contenido, y los links externos que ya existan siguen funcionando.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CardDetailRedirectPage({ params }: PageProps) {
  const { slug } = await params;

  permanentRedirect(ROUTES.ENCICLOPEDIA_TAROT_CARD(slug));
}
