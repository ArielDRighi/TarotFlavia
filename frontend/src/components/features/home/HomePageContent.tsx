'use client';

import { UserDashboard } from '@/components/features/dashboard';
import { useAuthStore } from '@/stores/authStore';
import { LandingPage } from './LandingPage';

/**
 * Home Page with Dual Logic
 * TASK-017: Implement dual HomePage (LandingPage + UserDashboard)
 *
 * Vive fuera de `app/` desde T-PROD-020: la ruta `/` pasó a ser un server
 * component para poder exportar `homeMetadata`. Mientras fue client, la home
 * servía el `<title>` genérico "Auguria" — el mismo que el resto del sitio.
 *
 * Behavior:
 * - LandingPage por defecto (incluido el render del servidor)
 * - UserDashboard en cuanto hay sesión validada
 *
 * ## Por qué ya no hay skeleton de carga (T-PROD-022)
 *
 * TASK-017 devolvía un skeleton mientras `isLoading`. Pero `isLoading` arranca en
 * `true` en el store, así que ese skeleton **era el render del servidor**: `/` le
 * servía a Googlebot 4 palabras de contenido propio. La home es la URL más
 * importante del sitio y era una pantalla de carga.
 *
 * El costo asumido es un parpadeo de la landing antes del dashboard para un
 * usuario ya logueado. Es preferible a no tener home indexable: el skeleton
 * ahorraba ese flash a costa de vaciar la página para todos los buscadores.
 */
export function HomePageContent() {
  const { user, isAuthenticated } = useAuthStore();

  // Show UserDashboard for authenticated users (all plans)
  if (isAuthenticated && user) {
    return <UserDashboard />;
  }

  // La landing es el default, incluido el render del servidor. Antes se devolvía
  // un skeleton mientras `isLoading` —que arranca en `true`—, así que `/` le
  // servía a Googlebot 4 palabras de contenido propio: la home, la URL más
  // importante del sitio, era una pantalla de carga (T-PROD-022).
  return <LandingPage />;
}
