import { ImageResponse } from 'next/og';
import { OG_IMAGE_ALT, OG_IMAGE_SIZE } from '@/lib/metadata/og-image';

export const alt = OG_IMAGE_ALT;
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

/**
 * Imagen de preview social (1200×630) generada en build por next/og.
 *
 * Reemplaza al `public/og-image.png` que los metadata referenciaban pero que
 * nunca existió: cada link compartido en WhatsApp mostraba la preview rota.
 * Al generarse desde código, no puede volver a desincronizarse del metadata.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // Noche Profunda → Índigo Oscuro (design tokens del hero)
        backgroundImage: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 100%)',
        color: '#f9f7f2',
      }}
    >
      <div
        style={{
          fontSize: 130,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          // Dorado Mate
          color: '#d69e2e',
        }}
      >
        Auguria
      </div>
      <div style={{ fontSize: 48, marginTop: 16, color: '#f9f7f2' }}>Tu guía espiritual</div>
      <div
        style={{
          fontSize: 28,
          marginTop: 40,
          color: 'rgba(249, 247, 242, 0.72)',
        }}
      >
        Tarot · Horóscopo · Carta Astral · Rituales
      </div>
    </div>,
    { ...size }
  );
}
