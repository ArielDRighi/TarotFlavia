import type { Metadata } from 'next';
import { TarotistaProfilePage } from '@/components/features/marketplace/TarotistaProfilePage';
import { generateTarotistaMetadata } from '@/lib/metadata/seo';
import { apiClient } from '@/lib/api/axios-config';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface TarotistaPerfilPageProps {
  params: {
    id: string;
  };
}

/**
 * Generate dynamic metadata for tarotista profile page
 */
export async function generateMetadata({ params }: TarotistaPerfilPageProps): Promise<Metadata> {
  const id = Number(params.id);

  try {
    // Fetch tarotista data from API
    const response = await apiClient.get(API_ENDPOINTS.TAROTISTAS.BY_ID(id));
    const tarotista = response.data;

    // Generate metadata with tarotista information
    return generateTarotistaMetadata(
      {
        nombre: tarotista.nombre || 'Tarotista',
        especialidades: tarotista.especialidades || [],
        descripcion: tarotista.bio,
      },
      id
    );
  } catch {
    // Fallback metadata if API call fails
    return {
      title: 'Perfil de Tarotista',
      description: 'Consulta con un tarotista profesional',
    };
  }
}

export default function TarotistaPerfilPage({ params }: TarotistaPerfilPageProps) {
  const id = Number(params.id);

  return <TarotistaProfilePage id={id} />;
}
