/**
 * ZodiacSignProfile Component
 *
 * Ficha estática de un signo: el **contenido indexable** de `/horoscopo/[sign]`
 * (T-SEO-004). Antes de esta ficha las 12 URLs servían 31 palabras propias.
 *
 * Sin `'use client'` a propósito. Todo lo que renderiza sale de constantes
 * locales (`ZODIAC_SIGN_PROFILES`, `ZODIAC_SIGNS_INFO`) y de helpers derivados
 * del signo, así que se resuelve en el servidor sin API, sin sesión y sin día
 * local. El horóscopo de hoy —que sí depende de las tres cosas— vive en
 * `HoroscopeSignPanel`.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Compass, TriangleAlert } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getZodiacSignProfile } from '@/lib/constants/zodiac-sign-profiles.data';
import { ROUTES } from '@/lib/constants/routes';
import {
  getHarmonicSigns,
  getOppositeSign,
  getZodiacDateRange,
  getZodiacEncyclopediaSlug,
  getZodiacModality,
  ZODIAC_ELEMENT_LABELS,
  ZODIAC_SIGNS_INFO,
} from '@/lib/utils/zodiac';
import type { ZodiacSign } from '@/types/horoscope.types';

import { ZodiacSymbol } from './ZodiacSymbol';

export interface ZodiacSignProfileProps {
  /** Signo cuya ficha se renderiza. */
  sign: ZodiacSign;
  /**
   * Contenido que se intercala después de la introducción.
   *
   * Lo usa la ruta para meter el horóscopo del día —que es cliente— arriba de
   * todo el material estático, sin que la ficha tenga que saber qué es.
   */
  children?: ReactNode;
}

/** Enlace a la ficha de otro signo. Es el enlazado interno entre las 12 URLs. */
function SignLink({ sign, testId }: { sign: ZodiacSign; testId: string }) {
  const { nameEs, symbol } = ZODIAC_SIGNS_INFO[sign];

  return (
    <Link
      href={ROUTES.HOROSCOPO_SIGN(sign)}
      data-testid={testId}
      className="hover:border-primary hover:text-primary flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors"
    >
      <ZodiacSymbol symbol={symbol} label={nameEs} className="text-base" />
      {nameEs}
    </Link>
  );
}

/** Una de las tres áreas de la lectura diaria. */
function DailyAreaCard({ title, children }: { title: string; children: string }) {
  return (
    <Card className="space-y-2 p-4">
      <h3 className="font-serif text-lg">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    </Card>
  );
}

/**
 * ZodiacSignProfile Component
 *
 * @example
 * ```tsx
 * <ZodiacSignProfile sign={ZodiacSign.ARIES} />
 * ```
 */
export function ZodiacSignProfile({ sign, children }: ZodiacSignProfileProps) {
  const { nameEs, symbol, element } = ZODIAC_SIGNS_INFO[sign];
  const profile = getZodiacSignProfile(sign);
  const harmonicSigns = getHarmonicSigns(sign);
  const oppositeSign = getOppositeSign(sign);
  const oppositeName = ZODIAC_SIGNS_INFO[oppositeSign].nameEs;

  return (
    <article className="space-y-6" data-testid="zodiac-sign-profile">
      <header className="text-center">
        <ZodiacSymbol symbol={symbol} label={nameEs} className="text-6xl" />
        <h1 className="mt-2 font-serif text-3xl">Horóscopo de {nameEs}</h1>
        <p className="text-muted-foreground mt-2 text-lg">{profile.tagline}</p>
        {/* Los datos del signo van solo acá, y cada etiqueta se explica sola:
            repetirlos abajo en una lista de definiciones duplicaba el texto en
            la misma URL —y en el lector de pantalla— sin agregar nada. */}
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">{getZodiacDateRange(sign)}</Badge>
          <Badge variant="outline">Elemento {ZODIAC_ELEMENT_LABELS[element]}</Badge>
          <Badge variant="outline">Modalidad {getZodiacModality(sign)}</Badge>
          <Badge variant="outline">Regente: {profile.rulingPlanet}</Badge>
        </div>
      </header>

      <Card className="space-y-4 p-6">
        {profile.intro.map((paragraph, index) => (
          <p key={index} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </Card>

      {children}

      <section>
        <h2 className="mb-3 font-serif text-2xl">
          Qué mirar en el horóscopo de {nameEs} de cada día
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <DailyAreaCard title="Amor">{profile.dailyAreas.love}</DailyAreaCard>
          <DailyAreaCard title="Bienestar">{profile.dailyAreas.wellness}</DailyAreaCard>
          <DailyAreaCard title="Dinero">{profile.dailyAreas.money}</DailyAreaCard>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl">El ritmo del día de {nameEs}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-2 p-4">
            <h3 className="flex items-center gap-2 font-serif text-lg">
              <Clock className="text-primary h-5 w-5" aria-hidden="true" />
              Su mejor franja
            </h3>
            <p className="text-muted-foreground leading-relaxed">{profile.bestMoment}</p>
          </Card>
          <Card className="space-y-2 p-4">
            <h3 className="flex items-center gap-2 font-serif text-lg">
              <TriangleAlert className="text-primary h-5 w-5" aria-hidden="true" />A qué prestar
              atención
            </h3>
            <p className="text-muted-foreground leading-relaxed">{profile.watchOut}</p>
          </Card>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {profile.dailyKeywords.map((keyword) => (
            <li key={keyword}>
              <Badge variant="secondary">{keyword}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl">Con qué signos sintoniza {nameEs}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3 p-4">
            <p className="text-muted-foreground leading-relaxed">{profile.harmonyNote}</p>
            <ul className="flex flex-wrap gap-2">
              {harmonicSigns.map((partner) => (
                <li key={partner}>
                  <SignLink sign={partner} testId={`harmonic-sign-${partner}`} />
                </li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-3 p-4">
            <h3 className="font-serif text-lg">Su eje opuesto: {oppositeName}</h3>
            <p className="text-muted-foreground leading-relaxed">{profile.oppositeNote}</p>
            <SignLink sign={oppositeSign} testId="opposite-sign-link" />
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl">Seguir leyendo sobre {nameEs}</h2>
        <Card className="space-y-4 p-4">
          {/* El artículo de la enciclopedia desarrolla el perfil astrológico
              completo; esta ficha cuenta cómo el signo transita el día. El
              enlace es lo que las distingue como páginas complementarias. */}
          <p className="text-muted-foreground text-sm">
            Esta ficha cuenta cómo {nameEs} vive el día a día y qué leer en su horóscopo de hoy. El
            perfil astrológico completo —carácter, fortalezas, desafíos, mitología y su carta del
            tarot— está en la enciclopedia.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link
                href={ROUTES.ENCICLOPEDIA_SIGNO(getZodiacEncyclopediaSlug(sign))}
                data-testid="encyclopedia-article-link"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Perfil completo de {nameEs} en la enciclopedia
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={ROUTES.HOROSCOPO} data-testid="horoscope-hub-link">
                <Compass className="mr-2 h-4 w-4" />
                Ver los 12 signos
              </Link>
            </Button>
          </div>
        </Card>
      </section>
    </article>
  );
}
