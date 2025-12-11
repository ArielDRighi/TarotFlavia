import { TarotistaProfilePage } from '@/components/features/marketplace/TarotistaProfilePage';

interface TarotistaPerfilPageProps {
  params: {
    id: string;
  };
}

export default function TarotistaPerfilPage({ params }: TarotistaPerfilPageProps) {
  const id = parseInt(params.id, 10);

  return <TarotistaProfilePage id={id} />;
}
