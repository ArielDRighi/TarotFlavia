'use client';

// 1. React & Next.js
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
// 5. Components (ui → features)
import { TarotistasExplorer } from './TarotistasExplorer';
// 6. Utils & types
import type { PaginatedTarotistas } from '@/types';

/**
 * ExplorarContent
 *
 * Parte cliente de `/explorar`. Existe desde T-SEO-003: la ruta era un client
 * component entero por este `useRouter`, así que el crawler recibía 20 palabras.
 * Ahora la ruta es un server component que resuelve la primera página del
 * listado y este componente solo aporta la navegación al perfil.
 */
export interface ExplorarContentProps {
  /** Primera página del listado, resuelta en el servidor. */
  initialTarotistas?: PaginatedTarotistas;
}

export function ExplorarContent({ initialTarotistas }: ExplorarContentProps) {
  const router = useRouter();

  const handleViewProfile = useCallback(
    (id: number) => {
      router.push(`/tarotistas/${id}`);
    },
    [router]
  );

  return (
    <div className="bg-bg-main min-h-screen p-8" data-testid="explorar-content">
      <TarotistasExplorer onViewProfile={handleViewProfile} initialTarotistas={initialTarotistas} />
    </div>
  );
}
