import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { TarotistaProfilePage } from '@/components/features/marketplace/TarotistaProfilePage';
import { generateTarotistaMetadata } from '@/lib/metadata/seo';
import { resolveRouteResource } from '@/lib/metadata/route-data';
import { apiClient } from '@/lib/api/axios-config';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { parseNumericRouteId } from '@/lib/utils/route-params';
import type { TarotistaDetail } from '@/types/tarotista.types';

/**
 * Perfil público de un tarotista.
 *
 * Route: /tarotistas/[id]
 *
 * Es una ruta **indexable** (ver `DISALLOWED_PATHS` en `lib/metadata/robots.ts`:
 * lo que se bloquea es `/tarotistas/*​/reservar`, no el perfil), así que un id
 * inexistente tiene que responder 404 y no un 200 con el esqueleto — el
 * soft-404 que cerró T-SEO-006.
 */

interface TarotistaPerfilPageProps {
  params: Promise<{ id: string }>;
}

/**
 * `generateMetadata` y la página resuelven el MISMO tarotista; `cache()` evita
 * el doble request. Se usa `apiClient` y no `getTarotistaById` porque ese
 * helper convierte el error de axios en un `Error` genérico y `notFound()`
 * necesita distinguir el 404 de la API de una caída.
 */
const getTarotista = cache((id: number) =>
  resolveRouteResource(async () => {
    const response = await apiClient.get<TarotistaDetail>(API_ENDPOINTS.TAROTISTAS.BY_ID(id));
    return response.data;
  })
);

/** Resuelve el segmento a un id numérico válido o corta con 404. */
async function resolveId(params: TarotistaPerfilPageProps['params']): Promise<number> {
  const { id } = await params;
  const numericId = parseNumericRouteId(id);

  // `/tarotistas/abc` no llega siquiera a la API: sin esto el request salía con
  // `NaN` en la URL y la ruta respondía 200 igual.
  if (numericId === null) {
    notFound();
  }

  return numericId;
}

export async function generateMetadata({ params }: TarotistaPerfilPageProps): Promise<Metadata> {
  const id = await resolveId(params);
  const tarotista = await getTarotista(id);

  return generateTarotistaMetadata(
    {
      nombre: tarotista.nombrePublico,
      especialidades: tarotista.especialidades,
      descripcion: tarotista.bio || undefined,
    },
    id
  );
}

export default async function TarotistaPerfilPage({ params }: TarotistaPerfilPageProps) {
  const id = await resolveId(params);

  // El perfil se resuelve también acá para que un id inexistente corte el render
  // aunque la metadata venga cacheada.
  await getTarotista(id);

  return <TarotistaProfilePage id={id} />;
}
