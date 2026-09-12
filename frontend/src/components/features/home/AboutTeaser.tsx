// 5. Components
import { HomeSectionHeader } from './HomeSectionHeader';
// 6. Utils & types
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';

/**
 * "Quiénes somos" en la portada (T-SEO-014).
 *
 * Tres líneas y el enlace a `/sobre-nosotros`. Sin foto ni nombre: T-SEO-017
 * resolvió, por decisión de negocio (12-sep-2026), que el sitio se sigue
 * presentando como equipo. Poner acá una ilustración o una foto de stock sería
 * peor que no poner nada.
 */
export function AboutTeaser() {
  const copy = HOME_EDITORIAL.about;

  return (
    <section data-testid="home-about" className="bg-bg-main px-4 py-14 md:py-20">
      <div className="container mx-auto max-w-3xl">
        <HomeSectionHeader copy={copy} />
        <p className="text-text-primary font-sans leading-relaxed">{copy.body}</p>
      </div>
    </section>
  );
}
