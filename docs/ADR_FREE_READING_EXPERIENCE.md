# ADR: Mejora de la Experiencia de Lectura para Usuarios Free

**Estado**: Propuesto
**Fecha**: 2026-04-11
**Autor**: Equipo Auguria

## Contexto

### Problema

Actualmente, los usuarios FREE reciben como resultado de sus lecturas (tanto tiradas como carta del día) los campos `meaningUpright` / `meaningReversed` directamente desde la entidad `TarotCard`. Estos textos son **técnicos e interpretativos a nivel de prompt** — están diseñados para alimentar el sistema de IA, no para ser leídos por el usuario final.

**Ejemplo actual** (El Loco, derecha):
> "Nuevos comienzos, aventuras personales, oportunidades, desafíos, inocencia, espíritu libre, espontaneidad."

Este texto es una lista de keywords expandida, no una experiencia de lectura. El usuario free no obtiene valor emocional ni orientativo de su lectura.

### Flujos actuales

| Flujo | Comportamiento PREMIUM | Comportamiento FREE |
|-------|----------------------|---------------------|
| **Navegación** | `/ritual` → Categoría (6) → Pregunta → Tirada → Lectura IA | `/ritual` → **SKIP todo** → directo a Tirada → `meaningUpright` crudo |
| **Carta del día** | Interpretación generada por IA | `interpretation: null`, muestra `cardMeaning` crudo |
| **Historial** | Interpretación IA guardada | Fallback a `meaningUpright/Reversed` |

> **Nota sobre URLs:** Las rutas actuales usan `/ritual/**` pero esto es incorrecto — existe una actividad llamada "Rituales" en `/rituales`. Todo lo relacionado a tirada de cartas debe migrar a `/tarot/**`. Este ADR documenta las URLs correctas (`/tarot`). El rename de rutas es un cambio previo o paralelo a esta feature.

**Código clave del skip actual (FREE):**
- `RitualPageContent.tsx` L34-38: Si `!canUseCustomQuestions` → `router.replace('/ritual/tirada')` — salta categoría y preguntas
- `ReadingExperience.tsx` L377: Envía `useAI: canUseAI` (false para FREE)
- `create-reading.use-case.ts` L107: `if (useAI === true)` — solo PREMIUM genera interpretación

### Restricciones existentes del plan FREE

- **Spreads**: solo tiradas de 1 carta y 3 cartas (controlado por `requiredPlan` en `TarotSpread` — ya funciona)
- **Preguntas**: no tiene acceso a selección de preguntas (ya funciona)
- **IA**: no genera interpretación con IA (ya funciona)

### Categorías existentes en `reading_category`

| ID | Nombre | Slug | Icono |
|----|--------|------|-------|
| 1 | Amor y Relaciones | `amor` | ❤️ |
| 2 | Trabajo y Carrera | `trabajo` | 💼 |
| 3 | Dinero y Finanzas | `dinero` | 💰 |
| 4 | Salud y Bienestar | `salud` | 🌿 |
| 5 | Espiritual y Crecimiento | `espiritual` | ✨ |
| 6 | General | `general` | 🔮 |

Las 3 categorías para FREE (amor, salud, dinero) se alinean con las áreas del horóscopo diario (`love`, `wellness`, `money` en `daily-horoscope.entity.ts`).

## Decisión

### Principio: FREE = versión recortada de PREMIUM

El flujo FREE no es un flujo diferente sino una **versión reducida del premium**:

| Aspecto | FREE | PREMIUM |
|---------|------|---------|
| **Mazo** | 22 Arcanos Mayores | 78 cartas completas |
| **Spreads** | 1 y 3 cartas (ya funciona) | Todos |
| **Categorías** | 3 (amor, salud, dinero) | 6 |
| **Preguntas** | No | Predefinidas + custom |
| **Interpretación tirada** | Pre-escrita por categoría | IA personalizada |
| **Carta del día** | Pre-escrita con tono de energía diaria | IA personalizada |

### Nuevo: Mazo restringido a Arcanos Mayores para FREE

Los usuarios FREE solo pueden usar los 22 Arcanos Mayores tanto en tiradas como en carta del día. El mazo completo de 78 cartas es exclusivo del plan PREMIUM. Esto se alinea con la práctica habitual de otras plataformas de tarot (ej: Los Arcanos).

**Impacto en código:**
- `selectRandomCard()` en `daily-reading.service.ts`: filtrar por `category: 'arcanos_mayores'` para FREE
- Validación de `cardIds` en `create-reading.use-case.ts`: verificar que FREE solo envíe arcanos mayores
- Frontend: mostrar solo arcanos mayores en el deck de selección para FREE

### Dos tipos de contenido pre-escrito

Se necesitan **dos contextos** de interpretación con tonos distintos:

| Contexto | Tono | Categorías | Registros |
|----------|------|------------|-----------|
| **Tirada convencional** | Interpretativo, atemporal | 1 por categoría elegida | 22 × 3 × 2 = **132** |
| **Carta del día** | Energía del día, presente, menciona los 3 temas brevemente | Texto único (no se divide por categoría) | 22 × 2 = **44** |
| | | **Total** | **176 textos** |

**Ejemplo para El Loco (derecha):**

**Tirada — Amor y Relaciones:**
> "El Loco te invita a abrirte a nuevas conexiones sin miedo. Deja ir las expectativas y permite que el amor te sorprenda con caminos inesperados."

**Tirada — Salud y Bienestar:**
> "Es momento de soltar cargas y darte permiso para ser libre. Tu bienestar pasa por escuchar tu espíritu aventurero y no reprimir tu espontaneidad."

**Tirada — Dinero y Finanzas:**
> "Nuevas oportunidades están por llegar, pero requieren un salto de fe. Confía en tu capacidad de adaptarte y atrévete a explorar caminos no convencionales."

**Carta del día (texto único, los 3 temas):**
> "Hoy la energía del Loco te acompaña. En el amor, es un día para animarte a dar ese primer paso sin miedo al rechazo. Tu bienestar pide soltar el control y fluir con lo inesperado. En lo económico, una oportunidad sorpresa podría aparecer si te atreves a salir de lo habitual."

### Flujos propuestos

```
PREMIUM (sin cambios):
/tarot → Categoría (6) → Pregunta (predefinida/custom) → Tirada → Spread → Lectura IA

FREE (nuevo):
/tarot → Categoría (3: amor, salud, dinero) → Tirada → Spread → Interpretación pre-escrita

Carta del día FREE/Anónimo:
/carta-del-dia → Carta (solo Arcanos Mayores) → Texto pre-escrito tono diario
```

## Diseño de datos

### Tabla `card_free_interpretation` (tiradas convencionales)

```sql
CREATE TABLE card_free_interpretation (
  id            SERIAL PRIMARY KEY,
  card_id       INT NOT NULL REFERENCES tarot_card(id),
  category_id   INT NOT NULL REFERENCES reading_category(id),
  orientation   VARCHAR(10) NOT NULL,  -- 'upright' | 'reversed'
  content       TEXT NOT NULL,         -- Texto amigable (2-3 oraciones)
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),

  UNIQUE(card_id, category_id, orientation)
);
-- 22 Arcanos Mayores × 3 categorías × 2 orientaciones = 132 registros
```

**Entidad TypeORM:**

```typescript
@Entity('card_free_interpretation')
@Unique(['cardId', 'categoryId', 'orientation'])
export class CardFreeInterpretation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cardId: number;

  @ManyToOne(() => TarotCard)
  @JoinColumn({ name: 'card_id' })
  card: TarotCard;

  @Column()
  categoryId: number;

  @ManyToOne(() => ReadingCategory)
  @JoinColumn({ name: 'category_id' })
  category: ReadingCategory;

  @Column({ type: 'varchar', length: 10 })
  orientation: 'upright' | 'reversed';

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Campos en `TarotCard` (carta del día)

Para carta del día, como es un solo texto por carta+orientación (sin dividir por categoría), se agregan 2 campos a `TarotCard`:

```typescript
@Column('text', { nullable: true })
dailyFreeUpright: string;

@Column('text', { nullable: true })
dailyFreeReversed: string;
```

**Razones:**
- Son solo 2 campos, no engordan significativamente la entidad
- Relación 1:1 con la carta (no hay dimensión de categoría)
- Evita una tabla separada para solo 44 registros
- `nullable: true` permite migración incremental sin romper datos existentes

### Opción descartada: Todo en `TarotCard`

Poner también las interpretaciones de tirada como campos en `TarotCard` (6+ campos) mezclaría datos enciclopédicos con presentación y haría el seed inmanejable. La tabla separada para tiradas es la opción correcta porque tiene la dimensión adicional de categoría.

## Flujo detallado

### 1. Navegación — Categoría recortada para FREE

**Cambio en `RitualPageContent.tsx` (futuro `TarotPageContent`):**

```typescript
// ACTUAL
if (!canUseCustomQuestions && canCreateTarotReading) {
  router.replace('/ritual/tirada'); // SKIP total
}
return <CategorySelector />; // Solo PREMIUM

// NUEVO
if (!canUseCustomQuestions && canCreateTarotReading) {
  // FREE: misma CategorySelector pero filtrada a 3 categorías
  return <CategorySelector freeModeCategories={['amor', 'salud', 'dinero']} />;
}
return <CategorySelector />; // PREMIUM: las 6 categorías
```

**Navegación después de elegir categoría:**

| Plan | Flujo |
|------|-------|
| PREMIUM | `/tarot` → categoría → `/tarot/preguntas?categoryId=X` → pregunta → `/tarot/tirada?...` |
| FREE | `/tarot` → categoría → `/tarot/tirada?categoryId=X` **(salta preguntas)** |

```
FREE:                                PREMIUM (sin cambios):
┌────────────────────────────┐      ┌────────────────────────────────────┐
│  ¿Sobre qué quieres        │      │  ¿Qué inquieta tu alma hoy?       │
│  consultar?                 │      │                                    │
│                             │      │  ❤️ Amor    💼 Trabajo   💰 Dinero │
│  ❤️ Amor  🌿 Salud  💰 Dinero│      │  🌿 Salud   ✨ Espiritual 🔮 General│
│                             │      │                                    │
│  ✨ ¿Más opciones?          │      └────────────────────────────────────┘
│  Actualiza a Premium        │
└────────────────────────────┘
```

### 2. Backend — Lectura FREE con categoría

**Cambio en `create-reading.use-case.ts`:**

```typescript
// ACTUAL (L107-175)
if (createReadingDto.useAI === true) {
  // PREMIUM: genera interpretación con IA
}
return reading; // FREE: sin interpretación

// NUEVO
if (createReadingDto.useAI === true) {
  // PREMIUM: genera interpretación con IA — SIN CAMBIOS
} else if (createReadingDto.categoryId) {
  // FREE: buscar interpretaciones pre-escritas para la categoría elegida
  const freeInterpretations = await this.cardFreeInterpretationService
    .findByCardsAndCategory(
      cards.map(c => c.id),
      createReadingDto.cardPositions.map(p => p.isReversed),
      createReadingDto.categoryId,
    );
  reading.freeInterpretations = freeInterpretations;
}
return reading;
```

**Validación de mazo (FREE solo Arcanos Mayores):**

```typescript
// En ReadingValidatorService o en el use case
if (!useAI) {
  const invalidCards = cards.filter(c => c.category !== 'arcanos_mayores');
  if (invalidCards.length > 0) {
    throw new ForbiddenException(
      'El plan FREE solo permite cartas de Arcanos Mayores'
    );
  }
}
```

### 3. Frontend — Resultado de lectura FREE

**Cambio en `InterpretationSection` (`ReadingExperience.tsx` L164-229):**

```
Antes (FREE):                         Después (FREE, categoría=amor):
┌─────────────────────────┐           ┌──────────────────────────────┐
│ Significado de las Cartas│           │ ❤️ Tu Lectura de Amor        │
│                         │           │                              │
│ El Loco (Derecha)       │           │ El Loco (Derecha)            │
│ Pasado                  │           │ Pasado                       │
│ "Nuevos comienzos,      │           │ "El Loco te invita a abrirte │
│  aventuras personales,  │           │  a nuevas conexiones sin     │
│  oportunidades..."      │           │  miedo. Deja ir las          │
│       ↑                 │           │  expectativas y permite que  │
│ Texto técnico/prompt    │           │  el amor te sorprenda."      │
│                         │           │                              │
└─────────────────────────┘           │ ┌────────────────────────┐   │
                                      │ │ ✨ Upgrade a Premium    │   │
                                      │ │ para interpretación     │   │
                                      │ │ personalizada con IA    │   │
                                      │ └────────────────────────┘   │
                                      └──────────────────────────────┘
```

### 4. Carta del día — FREE y anónimos

Usa `dailyFreeUpright` / `dailyFreeReversed` de `TarotCard`. Un solo texto que menciona brevemente los 3 temas con tono de energía diaria.

**Cambio en `daily-reading.service.ts`:**
- `selectRandomCard()`: filtrar por `category: 'arcanos_mayores'` cuando el usuario es FREE/anónimo
- Retornar `card.dailyFreeUpright` o `card.dailyFreeReversed` como interpretación

```
Carta del Día (FREE/Anónimo):
┌──────────────────────────────────────┐
│ 🌟 Tu Carta del Día                  │
│ El Loco (Derecha)                    │
│                                      │
│ "Hoy la energía del Loco te         │
│ acompaña. En el amor, es un día     │
│ para animarte a dar ese primer paso  │
│ sin miedo al rechazo. Tu bienestar  │
│ pide soltar el control y fluir con  │
│ lo inesperado. En lo económico, una │
│ oportunidad sorpresa podría aparecer│
│ si te atreves a salir de lo         │
│ habitual."                           │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ✨ Con Premium, Flavia te da una │ │
│ │ lectura personalizada con IA     │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

## Generación del contenido

**Total: 176 textos** a generar como tarea batch offline:

| Set | Cálculo | Registros |
|-----|---------|-----------|
| Tiradas (tabla `card_free_interpretation`) | 22 cartas × 3 categorías × 2 orientaciones | 132 |
| Carta del día (campos en `TarotCard`) | 22 cartas × 2 orientaciones | 44 |
| **Total** | | **176** |

**Proceso:**
1. Script que toma cada Arcano Mayor (`meaningUpright/Reversed` + `description` + `keywords`)
2. Genera con IA (Llama/GPT) textos amigables de 2-3 oraciones
3. Revisión humana del output
4. Tiradas: se guarda como seed en `card-free-interpretations.data.ts`
5. Carta del día: se agrega al seed existente `tarot-cards.data.ts` o migración de datos

**Tono por contexto:**

| Contexto | Tono | Ejemplo clave |
|----------|------|---------------|
| Tirada — Amor | Relaciones, vínculos, autoestima | "te invita a abrirte a nuevas conexiones..." |
| Tirada — Salud | Equilibrio, autocuidado, energía | "es momento de soltar cargas..." |
| Tirada — Dinero | Oportunidades, crecimiento, recursos | "nuevas oportunidades requieren un salto de fe..." |
| Carta del día | Energía de hoy, presente, los 3 temas breves | "hoy la energía de [carta] te acompaña. En el amor... bienestar... económico..." |

## Impacto en la experiencia PREMIUM

**Ninguno.** El flujo premium no cambia:
- Sigue usando las 78 cartas completas
- Sigue seleccionando entre las 6 categorías
- Sigue eligiendo pregunta (predefinida o custom)
- Sigue generando interpretación con IA via prompt builder
- Los `meaningUpright/Reversed` originales siguen alimentando el prompt
- Los campos `dailyFreeUpright/Reversed` se ignoran para PREMIUM (la IA genera su propia interpretación)

## Tareas de implementación

### Prerequisito
0. **Rename rutas**: Migrar `/ritual/**` → `/tarot/**` (categorías, preguntas, tirada, lectura)

### Backend — Datos
1. **Migración**: Crear tabla `card_free_interpretation` con FK a `tarot_card` y `reading_category`
2. **Migración**: Agregar campos `daily_free_upright` y `daily_free_reversed` a `tarot_card`
3. **Entidad**: `CardFreeInterpretation` (tabla tiradas)
4. **Entidad**: Agregar `dailyFreeUpright` y `dailyFreeReversed` a `TarotCard`
5. **Seed**: Generar 176 textos (batch con IA + revisión humana)

### Backend — Lógica
6. **Service**: `CardFreeInterpretationService` con `findByCardsAndCategory(cardIds, orientations, categoryId)`
7. **Use case**: Modificar `create-reading.use-case.ts` — adjuntar interpretación free por categoría
8. **Validación**: FREE solo puede usar cartas con `category: 'arcanos_mayores'`
9. **Daily reading**: Modificar `daily-reading.service.ts`:
   - `selectRandomCard()` filtra por arcanos mayores para FREE/anónimo
   - Retorna `dailyFreeUpright/Reversed` como interpretación
10. **DTO**: Agregar `freeInterpretations` al response de lectura

### Frontend
11. **CategorySelector**: Agregar prop `freeModeCategories` para filtrar por slugs
12. **Routing**: Modificar `RitualPageContent` — FREE muestra categorías filtradas en vez de skip
13. **Routing**: FREE navega de categoría directo a `/tarot/tirada?categoryId=X` (sin preguntas)
14. **Deck**: Mostrar solo arcanos mayores en selección de cartas para FREE
15. **Resultado lecturas**: Modificar `InterpretationSection` — mostrar texto pre-escrito de la categoría
16. **Carta del día**: Modificar `DailyCardExperience.tsx` — mostrar `dailyFreeUpright/Reversed`
17. **Upgrade CTA**: Agregar banner de upgrade en resultados FREE
18. **Tests**: Unit tests para todos los componentes y servicios modificados
