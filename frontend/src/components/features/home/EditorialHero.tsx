// 1. React & Next.js
import Image from 'next/image';
// 6. Utils & types
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';

/**
 * Hero de publicación de la portada (T-SEO-014).
 *
 * Reemplaza al `HeroSection` de landing ("Descubre tu destino" + "Crear cuenta
 * gratis" + "Sin tarjeta de crédito"), que era lo primero que veía el revisor
 * de AdSense y lo que clasificaba al sitio como app comercial. Acá va el `h1`
 * único de la home —qué es el sitio— y una bajada de dos líneas. El CTA de
 * registro vive en el header, no acá.
 *
 * Conserva el fondo del hero anterior para no perder la identidad visual, pero
 * a media altura: la portada tiene que mostrar el horóscopo de hoy sin scroll.
 */
export function EditorialHero() {
  const { title, lead } = HOME_EDITORIAL.hero;

  return (
    <section
      data-testid="home-hero"
      className="relative overflow-hidden px-4 py-16 md:py-24"
      style={{ background: 'var(--color-bg-hero)' }}
    >
      <Image
        src="/images/hero-bg.webp"
        alt=""
        fill
        className="object-cover opacity-70"
        priority
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, rgba(26, 10, 46, 0.7) 0%, rgba(45, 27, 105, 0.55) 45%, rgba(26, 10, 46, 0.75) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <p className="mb-5 text-xs font-medium tracking-[0.2em] text-amber-300 uppercase">
          Publicación de tarot y astrología
        </p>
        <h1
          className="font-serif text-3xl leading-tight font-light md:text-5xl"
          style={{ color: '#f9f7f2' }}
        >
          {title}
        </h1>
        <p
          className="mx-auto mt-6 max-w-2xl font-sans text-base leading-relaxed md:text-lg"
          style={{ color: 'rgba(249, 247, 242, 0.8)' }}
        >
          {lead}
        </p>
      </div>
    </section>
  );
}
