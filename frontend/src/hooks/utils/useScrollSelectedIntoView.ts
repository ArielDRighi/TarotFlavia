'use client';

import * as React from 'react';

/**
 * Centra la tarjeta seleccionada dentro de un carrusel horizontal.
 *
 * ⚠️ NO usar `scrollIntoView()` acá. Por spec desplaza **todas** las cajas
 * scrolleables ancestras, incluida la del documento: como el `body` de la app
 * tiene un desborde horizontal preexistente (ver T-PROD-002), la página entera
 * cargaba corrida hacia la derecha (hasta 64px en tablet). Escribir `scrollLeft`
 * sobre el contenedor solo mueve el contenedor.
 *
 * Compartido por ZodiacSignSelector y ChineseAnimalSelector: el fix vive en un
 * solo lugar y no puede quedar arreglado en un horóscopo y roto en el otro.
 *
 * @param containerRef Contenedor scrolleable (el carrusel).
 * @param selectedIndex Índice de la tarjeta seleccionada, o -1 si no hay ninguna.
 * @param enabled Solo tiene sentido en la variante carousel; en grid entran todas.
 */
export function useScrollSelectedIntoView(
  containerRef: React.RefObject<HTMLDivElement | null>,
  selectedIndex: number,
  enabled: boolean
): void {
  React.useEffect(() => {
    if (!enabled || selectedIndex < 0) return;

    const container = containerRef.current;
    const card = container?.children[selectedIndex];
    if (!container || !(card instanceof HTMLElement)) return;

    // Distancia de la tarjeta al borde izquierdo del contenedor, en el sistema
    // de coordenadas actual del scroll (por eso se suma al scrollLeft vigente).
    const offsetFromLeft =
      card.getBoundingClientRect().left - container.getBoundingClientRect().left;
    const centeringOffset = (container.clientWidth - card.clientWidth) / 2;

    container.scrollLeft += offsetFromLeft - centeringOffset;
  }, [containerRef, selectedIndex, enabled]);
}
