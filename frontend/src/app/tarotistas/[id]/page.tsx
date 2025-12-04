interface TarotistaPerfilPageProps {
  params: {
    id: string;
  };
}

export default function TarotistaPerfilPage({ params }: TarotistaPerfilPageProps) {
  // params.id will be used for data fetching when implemented
  void params;

  return (
    <div className="bg-bg-main min-h-screen p-8">
      <h1 className="font-serif text-3xl">Perfil Tarotista</h1>
    </div>
  );
}
