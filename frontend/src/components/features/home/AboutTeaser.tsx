// 1. React & Next.js
import Image from 'next/image';
// 5. Components
import { HomeSectionHeader } from './HomeSectionHeader';
// 6. Utils & types
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';

/**
 * "Quiénes somos" en la portada (T-SEO-014).
 *
 * Tres líneas y el enlace a `/sobre-nosotros`. Sin foto ni nombre: T-SEO-017
 * resolvió, por decisión de negocio (12-sep-2026), que el sitio se sigue
 * presentando como equipo. Poner acá una foto de stock sería peor que no poner
 * nada.
 *
 * T-SEO-022: la ilustración lateral es `hub-guias.webp` (el libro abierto del
 * hub de la enciclopedia), decorativa. Es una ilustración de marca, no una
 * persona: la decisión de T-SEO-017 sigue vigente.
 */
export function AboutTeaser() {
  const copy = HOME_EDITORIAL.about;

  return (
    <section data-testid="home-about" className="bg-bg-main px-4 py-14 md:py-20">
      <div className="container mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[1fr_minmax(0,320px)] md:gap-14">
        <div>
          <HomeSectionHeader copy={copy} />
          <p className="text-text-primary font-sans leading-relaxed">{copy.body}</p>
        </div>

        {/* Alto reservado por el aspect-ratio: la imagen diferida no mueve el texto */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
          <Image
            data-testid="home-about-illustration"
            src="/images/enciclopedia/hub-guias.webp"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
