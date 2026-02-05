'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pendulum,
  PendulumDisclaimer,
  PendulumLimitBanner,
  PendulumResponseDisplay,
  PendulumBlockedContent,
} from '@/components/features/pendulum';
import { usePendulumQuery, usePendulumCapabilities } from '@/hooks/api/usePendulum';
import { useAuthStore } from '@/stores/authStore';
import type { PendulumMovement, PendulumQueryResponse } from '@/types/pendulum.types';

export default function PenduloPage() {
  const { user } = useAuthStore();
  const capabilities = usePendulumCapabilities();
  const { mutateAsync: queryPendulum, isPending } = usePendulumQuery();

  // Estado para mostrar el disclaimer ANTES de cada consulta
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [question, setQuestion] = useState('');
  const [movement, setMovement] = useState<PendulumMovement | 'idle' | 'searching'>('idle');
  const [response, setResponse] = useState<PendulumQueryResponse | null>(null);
  const [blockedContent, setBlockedContent] = useState<{ open: boolean; category: string }>({
    open: false,
    category: '',
  });

  const isPremium = user?.plan === 'premium';
  const canUse = capabilities?.canUse ?? true;

  // Cuando el usuario hace clic en "Consultar", mostramos el disclaimer
  const handleConsultClick = () => {
    if (!canUse) return;
    setShowDisclaimer(true);
  };

  // Cuando el usuario acepta el disclaimer, ejecutamos la consulta
  const handleDisclaimerAccept = async () => {
    setShowDisclaimer(false);
    await executeQuery();
  };

  // Cuando el usuario cancela el disclaimer
  const handleDisclaimerCancel = () => {
    setShowDisclaimer(false);
  };

  // Ejecutar la consulta al péndulo
  const executeQuery = async () => {
    setResponse(null);
    setMovement('searching');

    try {
      const result = await queryPendulum({ question: isPremium ? question : undefined });

      // Mostrar animación de respuesta
      setTimeout(() => {
        setMovement(result.movement);
        setTimeout(() => {
          setResponse(result);
        }, 2000);
      }, 3000);
    } catch (error: unknown) {
      setMovement('idle');

      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'code' in error.response.data &&
        error.response.data.code === 'BLOCKED_CONTENT' &&
        'category' in error.response.data
      ) {
        const data = error.response.data as { code: string; category: string };
        setBlockedContent({
          open: true,
          category: data.category,
        });
      }
    }
  };

  const handleReset = () => {
    setResponse(null);
    setQuestion('');
    setMovement('idle');
  };

  return (
    <>
      {/* Modal de disclaimer - aparece CADA VEZ antes de consultar */}
      <PendulumDisclaimer
        open={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onCancel={handleDisclaimerCancel}
      />

      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-serif text-4xl">Péndulo Digital</h1>
          <p className="text-muted-foreground">Formula tu pregunta y deja que el péndulo te guíe</p>
        </div>

        {/* Límites */}
        <PendulumLimitBanner />

        {/* Área del péndulo */}
        <Card className="mb-6 p-6">
          {/* Péndulo animado */}
          <Pendulum movement={movement} isGlowing={!!response} />

          {/* Respuesta */}
          {response && <PendulumResponseDisplay response={response} className="mt-6" />}
        </Card>

        {/* Controles */}
        {!response ? (
          <Card className="p-6">
            {/* Input de pregunta (solo Premium) */}
            {isPremium && (
              <div className="mb-4">
                <Input
                  placeholder="Escribe tu pregunta (opcional)..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={isPending || !canUse}
                />
              </div>
            )}

            {!isPremium && (
              <p className="text-muted-foreground mb-4 text-center text-sm">
                Formula tu pregunta mentalmente antes de consultar
              </p>
            )}

            <Button
              onClick={handleConsultClick}
              disabled={isPending || !canUse}
              className="w-full"
              size="lg"
            >
              {isPending ? 'Consultando...' : 'Consultar al Péndulo'}
            </Button>
          </Card>
        ) : (
          <Button onClick={handleReset} variant="outline" className="w-full">
            Nueva consulta
          </Button>
        )}
      </div>

      {/* Modal de contenido bloqueado */}
      <PendulumBlockedContent
        open={blockedContent.open}
        category={blockedContent.category}
        onClose={() => setBlockedContent({ open: false, category: '' })}
      />
    </>
  );
}
