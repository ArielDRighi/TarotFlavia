'use client';

import { useEffect, useRef } from 'react';
import { useAdsEnabled } from '@/hooks/utils/useAdsEnabled';
import { cn } from '@/lib/utils';

interface AdSlotProps {
  /**
   * Identificador del bloque de anuncio creado en el panel de AdSense.
   * Es un dato de Google (string), no un ID de entidad de la app.
   */
  slotId: string;
  /** Formato del anuncio; `auto` deja que AdSense elija el tamaño responsive */
  format?: string;
  /** ¿El anuncio puede ocupar todo el ancho del contenedor? */
  responsive?: boolean;
  /** Clases del contenedor (márgenes, ancho máximo, etc.) */
  className?: string;
}

/**
 * Slot de anuncio de Google AdSense.
 *
 * Renderiza el `<ins class="adsbygoogle">` que el loader rellena, y encola la
 * petición al montar. El gating (`useAdsEnabled`) garantiza que un Premium
 * jamás vea un anuncio — ni un flash antes de hidratar.
 *
 * La colocación en páginas concretas es parte de T-PROD-009.
 */
export function AdSlot({ slotId, format = 'auto', responsive = true, className }: AdSlotProps) {
  const { isEnabled, clientId } = useAdsEnabled();
  const hasRequestedAd = useRef(false);

  useEffect(() => {
    if (!isEnabled || hasRequestedAd.current) {
      return;
    }

    hasRequestedAd.current = true;

    try {
      // El loader crea la cola; si todavía no llegó, la creamos nosotros y él
      // la consume al cargar.
      window.adsbygoogle = window.adsbygoogle ?? [];
      window.adsbygoogle.push({});
    } catch {
      // Un fallo del loader (bloqueador de anuncios, red caída) no debe romper
      // la página: simplemente no se muestra el anuncio.
      hasRequestedAd.current = false;
    }
  }, [isEnabled]);

  if (!isEnabled || !clientId) {
    return null;
  }

  return (
    <ins
      data-testid="ad-slot"
      className={cn('adsbygoogle', className)}
      style={{ display: 'block' }}
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}
