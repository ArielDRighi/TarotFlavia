'use client';

import { usePendulumCapabilities } from '@/hooks/api/usePendulum';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function PendulumLimitBanner() {
  const capabilities = usePendulumCapabilities();

  if (!capabilities) return null;

  const { used, limit, canUse, resetAt, period } = capabilities;
  const remaining = limit - used;

  if (canUse && remaining > 0) {
    return (
      <div className="text-muted-foreground text-center text-sm">
        {period === 'lifetime' ? (
          <span>
            Tienes <strong>1 consulta gratuita</strong> disponible
          </span>
        ) : (
          <span>
            <strong>{remaining}</strong> de {limit} consultas disponibles
            {period === 'monthly' ? ' este mes' : ' hoy'}
          </span>
        )}
      </div>
    );
  }

  // Límite alcanzado
  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
      <Clock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          {period === 'lifetime'
            ? 'Ya usaste tu consulta gratuita'
            : period === 'monthly'
              ? 'Límite mensual alcanzado. Se reinicia el día 1.'
              : `Límite diario alcanzado.${resetAt ? ` Se reinicia ${new Date(resetAt).toLocaleTimeString()}` : ''}`}
        </span>
        {period !== 'daily' && (
          <Button size="sm" variant="outline" asChild>
            <Link href="/premium">
              <Sparkles className="mr-1 h-3 w-3" />
              {period === 'lifetime' ? 'Registrarse' : 'Upgrade'}
            </Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
