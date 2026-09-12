// 5. Components
import { GuideBlock, GuideHeader, GuideLinks } from '@/components/common/EditorialGuide';
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
      <GuideHeader title={title} lead={lead} />

      <div className="space-y-8">
        {sections.map((section) => (
          <GuideBlock
            key={section.heading}
            heading={section.heading}
            paragraphs={section.paragraphs}
          />
        ))}
      </div>

      <GuideLinks links={links} />
    </section>
  );
}
