/**
 * useReducedMotion Hook
 *
 * Detecta la preferencia del sistema operativo `prefers-reduced-motion`. Devuelve
 * `true` cuando el usuario pidió reducir el movimiento, para que los componentes
 * puedan desactivar animaciones no esenciales (reveal escalonado, etc.).
 *
 * Implementado con `useSyncExternalStore` para suscribirse al `matchMedia` sin
 * `setState` dentro de un efecto. SSR-safe: el snapshot de servidor es `false` y
 * se sincroniza con el valor real tras la hidratación en el cliente.
 */

import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function hasMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

function subscribe(onChange: () => void): () => void {
  if (!hasMatchMedia()) {
    return () => {};
  }
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  if (!hasMatchMedia()) {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
