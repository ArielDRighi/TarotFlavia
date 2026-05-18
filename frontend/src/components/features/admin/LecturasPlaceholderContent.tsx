import { BookOpen, Clock } from 'lucide-react';

export function LecturasPlaceholderContent() {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center"
      data-testid="lecturas-placeholder"
    >
      <div className="bg-muted mb-6 flex size-20 items-center justify-center rounded-full">
        <BookOpen className="text-muted-foreground size-10" />
      </div>

      <h1 className="mb-2 font-serif text-3xl font-bold">Lecturas</h1>

      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-amber-600">
        <Clock className="size-4" />
        <span>En construcción</span>
      </div>

      <p className="text-muted-foreground max-w-md" data-testid="lecturas-placeholder-description">
        El módulo de gestión de lecturas está en desarrollo. Próximamente podrás visualizar, filtrar
        y administrar todas las lecturas de tarot realizadas en la plataforma.
      </p>
    </div>
  );
}
