'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider
 *
 * Dispara la validación de sesión (`checkAuth`) una vez que Zustand hidrató
 * desde `localStorage`, y **renderiza el contenido siempre**.
 *
 * ## Por qué no bloquea (T-PROD-022)
 *
 * Hasta acá devolvía una pantalla de "Verificando sesión..." EN LUGAR de
 * `children`. Como este provider vive en el layout raíz y en el servidor
 * `_hasHydrated` es **siempre `false`** (no existe `localStorage`), el resultado
 * era que **todo render SSR del sitio entero era ese splash**. Medido en
 * producción con el user-agent de Googlebot:
 *
 *     /                            → "Auguria Verificando sesión..."  (3 palabras)
 *     /enciclopedia/tarot/the-fool → "Auguria Verificando sesión..."  (3 palabras)
 *
 * Le costó al sitio el rechazo de AdSense por "contenido de poco valor" —
 * literalmente no había contenido que evaluar— y era la mitad que faltaba del
 * "Duplicada: Google eligió otra canónica" de T-PROD-020: los `<title>` quedaron
 * únicos, pero los cuerpos seguían siendo todos idénticos.
 *
 * ## Dónde vive ahora la protección contra el FOUC
 *
 * En cada componente que la necesita, que es donde corresponde:
 * - `HomePageContent` muestra su propio skeleton mientras `isLoading`, para no
 *   parpadear la landing antes del dashboard.
 * - Las rutas privadas usan `useRequireAuth`, que redirige por su cuenta.
 * - `useAdsEnabled` exige `_hasHydrated` antes de habilitar anuncios, así que un
 *   Premium sigue sin ver ni un flash de publicidad (T-PROD-008).
 *
 * ⚠️ NO volver a devolver un splash desde acá: apaga el sitio para los buscadores.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    // Only check auth after Zustand has hydrated from localStorage
    if (hasHydrated) {
      checkAuth();
    }
  }, [checkAuth, hasHydrated]);

  return <>{children}</>;
}
