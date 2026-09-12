// 1. React & Next.js
import Link from 'next/link';
// 6. Utils & types
import { CHINESE_HOROSCOPE_GUIDE } from '@/lib/constants/chinese-horoscope-guide.data';

/**
 * Nota de uso de `/horoscopo-chino` (T-SEO-015). Va debajo del selector de
 * animales (`ChineseHoroscopeHub`, cliente). Sin `'use client'`: es el texto
 * que tiene que llegar al crawler. Contenido en
 * `chinese-horoscope-guide.data.ts`, con guardarraíl de palabras.
 */
export function ChineseHoroscopeGuide() {
  const { title, lead, sections, links } = CHINESE_HOROSCOPE_GUIDE;

  return (
    <section
      data-testid="chinese-horoscope-guide"
      className="container mx-auto max-w-3xl px-4 pb-12"
    >
      <h2 className="text-text-primary mb-3 font-serif text-3xl font-light md:text-4xl">{title}</h2>
      <div className="bg-secondary mb-5 h-px w-16 opacity-60" aria-hidden="true" />
      <p className="text-text-muted mb-8 font-sans leading-relaxed">{lead}</p>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.heading}>
            <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
              {section.heading}
            </h3>
            <div className="space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-text-primary font-sans leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <nav
        aria-label="Seguir leyendo"
        className="border-border mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-secondary text-sm font-medium underline-offset-4 hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}
