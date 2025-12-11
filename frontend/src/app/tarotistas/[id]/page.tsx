import { TarotistaProfilePage } from '@/components/features/marketplace/TarotistaProfilePage';

interface TarotistaPerfilPageProps {
  params: {
    id: string;
  };
}

export default function TarotistaPerfilPage({ params }: TarotistaPerfilPageProps) {
  const id = Number(params.id);

  return <TarotistaProfilePage id={id} />;
}
