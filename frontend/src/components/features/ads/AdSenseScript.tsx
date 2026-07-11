'use client';

import Script from 'next/script';
import { useAdsEnabled } from '@/hooks/utils/useAdsEnabled';

/** URL del loader oficial de AdSense */
const ADSENSE_LOADER_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

/**
 * Carga condicional del loader oficial de Google AdSense.
 *
 * Se monta una única vez en el layout raíz, dentro del `AuthProvider` (necesita
 * el plan ya hidratado). Para un usuario Premium el script NI SIQUIERA se
 * descarga: no hay `<script>` en el DOM, así que la pestaña Network queda limpia.
 *
 * Sin `NEXT_PUBLIC_ADSENSE_CLIENT` no deja ningún rastro de AdSense (kill-switch
 * para dev/staging).
 */
export function AdSenseScript() {
  const { isEnabled, clientId } = useAdsEnabled();

  if (!isEnabled || !clientId) {
    return null;
  }

  return (
    <Script
      id="adsense-loader"
      src={`${ADSENSE_LOADER_URL}?client=${clientId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
