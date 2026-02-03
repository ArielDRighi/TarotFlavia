'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  RitualHeader,
  RitualMaterials,
  RitualStepsList,
  RitualTips,
  RitualCompletedModal,
  RitualsSkeleton,
} from '@/components/features/rituals';
import { useRitual, useCompleteRitual } from '@/hooks/api/useRituals';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/utils/useToast';
import { ROUTES } from '@/lib/constants/routes';

export function RitualDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();

  const { isAuthenticated } = useAuthStore();
  const { data: ritual, isLoading, error } = useRitual(slug);
  const { mutate: completeRitual, isPending } = useCompleteRitual();

  const [showCompletedModal, setShowCompletedModal] = useState(false);

  const handleComplete = (notes?: string, rating?: number) => {
    if (!ritual) return;

    if (!isAuthenticated) {
      toast.info('Inicia sesión', {
        description: 'Debes iniciar sesión para guardar tu progreso',
      });
      setShowCompletedModal(false);
      return;
    }

    completeRitual(
      {
        ritualId: ritual.id,
        data: { notes, rating },
      },
      {
        onSuccess: () => {
          toast.success('¡Ritual completado!', {
            description: 'Se ha guardado en tu historial',
          });
          setShowCompletedModal(false);
        },
        onError: () => {
          toast.error('Error', {
            description: 'No se pudo guardar el ritual',
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <RitualsSkeleton variant="detail" />
      </div>
    );
  }

  if (error || !ritual) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl">Ritual no encontrado</h1>
        <Button asChild>
          <Link href={ROUTES.RITUALES}>Ver todos los rituales</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navegación */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href={ROUTES.RITUALES}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Rituales
        </Link>
      </Button>

      {/* Header con imagen */}
      <RitualHeader ritual={ritual} />

      {/* Botón de marcar completado */}
      <div className="my-8 text-center">
        <Button
          size="lg"
          onClick={() => setShowCompletedModal(true)}
          disabled={isPending}
          className="gap-2"
        >
          <CheckCircle className="h-5 w-5" />
          Marcar como Completado
        </Button>
        {!isAuthenticated && (
          <p className="text-muted-foreground mt-2 text-sm">
            Inicia sesión para guardar tu progreso
          </p>
        )}
      </div>

      {/* Contenido */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          {/* Propósito */}
          {ritual.purpose && (
            <div>
              <h2 className="mb-2 font-serif text-xl">Propósito</h2>
              <p className="text-muted-foreground">{ritual.purpose}</p>
            </div>
          )}

          {/* Mejor momento */}
          {ritual.bestTimeOfDay && (
            <div>
              <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                Mejor momento para realizar
              </h3>
              <p>{ritual.bestTimeOfDay}</p>
            </div>
          )}

          {/* Preparación */}
          {ritual.preparation && (
            <div>
              <h2 className="mb-2 font-serif text-xl">Preparación</h2>
              <p className="text-muted-foreground">{ritual.preparation}</p>
            </div>
          )}

          {/* Pasos */}
          <RitualStepsList steps={ritual.steps} />

          {/* Cierre */}
          {ritual.closing && (
            <div>
              <h2 className="mb-2 font-serif text-xl">Cierre del Ritual</h2>
              <p className="text-muted-foreground">{ritual.closing}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RitualMaterials materials={ritual.materials} />

          {ritual.tips && ritual.tips.length > 0 && <RitualTips tips={ritual.tips} />}
        </div>
      </div>

      {/* Modal de completado */}
      <RitualCompletedModal
        ritual={ritual}
        isOpen={showCompletedModal}
        onClose={() => setShowCompletedModal(false)}
        onComplete={handleComplete}
      />
    </div>
  );
}
