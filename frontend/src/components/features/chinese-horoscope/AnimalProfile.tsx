/**
 * AnimalProfile Component
 *
 * Ficha estática de un animal del zodiaco chino: el **contenido indexable** de
 * `/horoscopo-chino/[animal]` (T-SEO-002).
 *
 * Sin `'use client'` a propósito. Todo lo que renderiza sale de constantes
 * locales (`CHINESE_ZODIAC_PROFILES`, `CHINESE_ZODIAC_INFO`), así que se resuelve
 * en el servidor sin API, sin sesión y sin query string. La predicción del año,
 * que sí depende de esas tres cosas, vive en `AnimalHoroscopePanel`.
 */

import Link from 'next/link';
import { Calculator } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getChineseZodiacProfile } from '@/lib/constants/chinese-zodiac-profiles.data';
import { ROUTES } from '@/lib/constants/routes';
import { CHINESE_ZODIAC_INFO, getAnimalBirthYears } from '@/lib/utils/chinese-zodiac';
import type { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

import { ChineseAnimalSymbol } from './ChineseAnimalSymbol';

export interface AnimalProfileProps {
  /** Animal del zodiaco chino cuya ficha se renderiza. */
  animal: ChineseZodiacAnimal;
}

/**
 * Lista de animales enlazados a su propia ficha.
 * El enlazado interno es parte del objetivo SEO: las 12 URLs se referencian entre sí.
 */
function AnimalLinks({ animals }: { animals: ChineseZodiacAnimal[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {animals.map((partner) => {
        const { nameEs } = CHINESE_ZODIAC_INFO[partner];

        return (
          <li key={partner}>
            <Link
              href={ROUTES.HOROSCOPO_CHINO_ANIMAL(partner)}
              className="hover:border-primary hover:text-primary flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors"
            >
              <ChineseAnimalSymbol animal={partner} label={nameEs} className="text-base" />
              {nameEs}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Lista de etiquetas cortas (fortalezas, desafíos, años). */
function BadgeList({ items, variant }: { items: string[]; variant?: 'secondary' | 'outline' }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item}>
          <Badge variant={variant ?? 'secondary'}>{item}</Badge>
        </li>
      ))}
    </ul>
  );
}

/**
 * AnimalProfile Component
 *
 * @example
 * ```tsx
 * <AnimalProfile animal={ChineseZodiacAnimal.DRAGON} />
 * ```
 */
export function AnimalProfile({ animal }: AnimalProfileProps) {
  const info = CHINESE_ZODIAC_INFO[animal];
  const profile = getChineseZodiacProfile(animal);
  const birthYears = getAnimalBirthYears(animal);

  return (
    <article className="space-y-6" data-testid="animal-profile">
      <header className="text-center">
        <ChineseAnimalSymbol animal={animal} label={info.nameEs} className="text-6xl" />
        <h1 className="mt-2 font-serif text-3xl">{info.nameEs}</h1>
        <p className="text-muted-foreground mt-2 text-lg">{profile.tagline}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">Elemento fijo: {info.element}</Badge>
          <Badge variant="outline">Zodiaco chino</Badge>
        </div>
      </header>

      <Card className="space-y-4 p-6">
        {profile.intro.map((paragraph, index) => (
          <p key={index} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </Card>

      <section>
        <h2 className="mb-3 font-serif text-2xl">Personalidad del signo {info.nameEs}</h2>
        <ul className="space-y-3">
          {profile.personality.map((trait) => (
            <li key={trait.term} className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{trait.term}:</strong> {trait.description}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3 p-4">
          <h3 className="font-serif text-lg">Fortalezas</h3>
          <BadgeList items={profile.strengths} />
        </Card>
        <Card className="space-y-3 p-4">
          <h3 className="font-serif text-lg">Desafíos</h3>
          <BadgeList items={profile.challenges} variant="outline" />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-2 p-6">
          <h2 className="font-serif text-xl">Amor y vínculos</h2>
          <p className="text-muted-foreground leading-relaxed">{profile.love}</p>
        </Card>
        <Card className="space-y-2 p-6">
          <h2 className="font-serif text-xl">Trabajo y dinero</h2>
          <p className="text-muted-foreground leading-relaxed">{profile.career}</p>
        </Card>
      </div>

      <section>
        {/* "tradicional" en el título: más abajo, la predicción del año trae su
            propio bloque de afinidades con datos distintos. */}
        <h2 className="mb-3 font-serif text-2xl">Compatibilidad tradicional de {info.nameEs}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3 p-4">
            <h3 className="font-serif text-lg">Mejores afinidades</h3>
            <AnimalLinks animals={profile.compatibility.best} />
          </Card>
          <Card className="space-y-3 p-4">
            <h3 className="font-serif text-lg">Relación más desafiante</h3>
            <AnimalLinks animals={profile.compatibility.challenging} />
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl">Años del signo {info.nameEs}</h2>
        <Card className="space-y-4 p-4">
          <BadgeList items={birthYears.map(String)} variant="outline" />
          <p className="text-muted-foreground text-sm">
            El año chino no arranca el 1 de enero: empieza con el Año Nuevo Chino, que cae entre el
            21 de enero y el 20 de febrero. Si naciste en esa franja, tu animal es el del año
            anterior.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.HOROSCOPO_CHINO}>
              <Calculator className="mr-2 h-4 w-4" />
              Calcular mi animal con mi fecha de nacimiento
            </Link>
          </Button>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl">Suerte tradicional del signo {info.nameEs}</h2>
        <Card className="p-4">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground text-sm">Números</dt>
              <dd className="font-medium">{profile.luck.numbers.join(', ')}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Colores</dt>
              <dd className="font-medium">{profile.luck.colors.join(', ')}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Dirección favorable</dt>
              <dd className="font-medium">{profile.luck.direction}</dd>
            </div>
          </dl>
        </Card>
      </section>
    </article>
  );
}
