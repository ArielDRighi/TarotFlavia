# TASK: Rediseño Landing Page — Auguria

> **Para el agente:** Leer este documento completo antes de escribir una sola línea de código.
> **Branch a crear:** `feature/home-landing-redesign`
> **PR destino:** `develop`
> **Archivos de test existentes:** No tocar ni romper tests existentes de los componentes home.

---

## Contexto

La landing page actual (`LandingPage.tsx`) tiene 7 secciones ya estructuradas pero con problemas graves de diseño:

- Fondo crema (`#f9f7f2`) con texto suave (`#718096`) = ilegible
- Uso de clases `dark:` en un proyecto que es **light-mode only** (definido en `globals.css`)
- Imágenes rotas (rutas que no existen)
- Cero personalidad visual ni atmósfera mística
- Colores hardcodeados (`text-gray-900`, `bg-purple-100`) en vez de los design tokens del sistema

**Objetivo:** Transformar el landing en algo espectacular y coherente con la identidad de Auguria, usando exclusivamente los design tokens existentes más los nuevos que se agregan en este task.

---

## Design System — Referencia

### Tokens existentes (en `globals.css`)

```
--color-bg-main: #f9f7f2       (Crema Papiro — fondo principal)
--color-surface: #ffffff        (Blanco — cards)
--color-text-primary: #2d3748   (Gris Grafito — texto principal)
--color-text-muted: #718096     (Gris Suave — texto secundario)
--color-primary: #805ad5        (Lavanda Místico — botones, links)
--color-secondary: #d69e2e      (Dorado Mate — bordes, iconos especiales)
--color-accent-success: #48bb78 (Verde — confirmaciones)
--shadow-soft: 0 4px 20px -2px rgba(128, 90, 213, 0.1)
```

### Tipografías disponibles

- **Headings:** `font-serif` = `Cormorant Garamond` (ya cargada en `layout.tsx`)
- **Body:** `font-sans` = `Lato` (ya cargada en `layout.tsx`)

### Paleta de colores del logo (referencia visual)

- Texto "Auguria": `#1e1e3a` (azul navy oscuro)
- Luna/ilustración: gradiente lavanda → dorado
- "tu plan divino": `#9b72d0` (lavanda medio)

---

## Paso 1 — Crear feature branch

```bash
cd D:/Personal/tarot
git checkout develop
git pull origin develop
git checkout -b feature/home-landing-redesign
```

---

## Paso 2 — Agregar tokens de diseño en `globals.css`

**Archivo:** `frontend/src/app/globals.css`

Dentro del bloque `@theme { ... }`, agregar después de `--color-accent-success`:

```css
/* Hero & Dark Sections */
--color-bg-hero: #1a0a2e; /* Noche Profunda — hero background */
--color-bg-hero-mid: #2d1b69; /* Índigo Oscuro — hero gradient mid */
--color-bg-section-dark: #1e1145; /* Sección oscura alternativa */
--color-text-on-dark: #f9f7f2; /* Texto sobre fondos oscuros */
--color-text-on-dark-muted: rgba(249, 247, 242, 0.72); /* Texto suave sobre oscuros */
--color-secondary-glow: rgba(214, 158, 46, 0.25); /* Glow dorado para efectos */
```

También agregar estas animaciones al final del archivo (antes del cierre):

```css
/* ===========================================
   Landing Page Animations
   =========================================== */

@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-12px) rotate(1deg);
  }
  66% {
    transform: translateY(-6px) rotate(-1deg);
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes shimmer-gold {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.animate-float-slow {
  animation: float-slow 6s ease-in-out infinite;
}
.animate-twinkle {
  animation: twinkle 3s ease-in-out infinite;
}
.animate-shimmer-gold {
  background: linear-gradient(90deg, #d69e2e 0%, #f6d860 40%, #d69e2e 60%, #b7791f 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer-gold 3s linear infinite;
}
```

---

## Paso 3 — Rediseñar `HeroSection.tsx`

**Archivo:** `frontend/src/components/features/home/HeroSection.tsx`

**Objetivo:** Hero full-screen, fondo oscuro-místico con gradiente, tipografía enorme, sin imágenes (placeholder para imagen que el usuario proveerá), dos CTAs.

**Reemplazar completamente el archivo con:**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { Sparkles, Star } from "lucide-react";

// Decorative star positions — purely visual, no logic
const decorativeStars = [
  { top: "12%", left: "8%", size: 3, delay: "0s", duration: "2.8s" },
  { top: "20%", left: "88%", size: 4, delay: "0.5s", duration: "3.2s" },
  { top: "35%", left: "5%", size: 2, delay: "1s", duration: "2.5s" },
  { top: "65%", left: "92%", size: 3, delay: "0.3s", duration: "3.5s" },
  { top: "78%", left: "15%", size: 4, delay: "0.8s", duration: "2.9s" },
  { top: "45%", left: "95%", size: 2, delay: "1.5s", duration: "3.1s" },
  { top: "88%", left: "78%", size: 3, delay: "0.2s", duration: "2.7s" },
  { top: "10%", left: "55%", size: 2, delay: "1.2s", duration: "3.3s" },
];

export function HeroSection() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20"
      style={{
        background: "linear-gradient(160deg, #1a0a2e 0%, #2d1b69 45%, #1a0a2e 100%)",
      }}
    >
      {/* Background image — usuario proveerá /images/hero-bg.webp */}
      {/* Cuando el usuario provea la imagen, descomentar:
      <Image
        src="/images/hero-bg.webp"
        alt=""
        fill
        className="object-cover opacity-20 mix-blend-luminosity"
        priority
        aria-hidden="true"
      />
      */}

      {/* Overlay gradient para asegurar legibilidad */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(128, 90, 213, 0.3) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(214, 158, 46, 0.15) 0%, transparent 50%)",
        }}
        aria-hidden="true"
      />

      {/* Decorative stars */}
      {decorativeStars.map((star, i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full bg-amber-200"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Decorative crescent moon (CSS only, no image) */}
      <div
        className="absolute right-[10%] top-[8%] z-0 opacity-30"
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          boxShadow: "inset -30px -10px 0 0 #d69e2e",
          filter: "blur(1px)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-amber-300">Tu guía espiritual</span>
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
        </div>

        {/* Main headline */}
        <h1 className="mb-6 font-serif leading-tight" style={{ color: "#f9f7f2" }}>
          <span className="block text-5xl font-light md:text-6xl lg:text-7xl xl:text-8xl">Descubre tu destino</span>
          <span className="animate-shimmer-gold mt-1 block text-4xl font-semibold md:text-5xl lg:text-6xl xl:text-7xl">
            a través del Tarot
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mb-10 max-w-2xl font-sans text-lg leading-relaxed md:text-xl"
          style={{ color: "rgba(249, 247, 242, 0.75)" }}
        >
          Lecturas personalizadas que iluminan tu camino. Desde la carta del día hasta interpretaciones profundas con
          IA, encuentra las respuestas que buscas.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="min-w-[200px] border-0 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-amber-500/25"
            style={{
              background: "linear-gradient(135deg, #d69e2e 0%, #f6d860 50%, #b7791f 100%)",
              color: "#1a0a2e",
            }}
          >
            <Link href={ROUTES.CARTA_DEL_DIA}>
              <Star className="mr-2 h-4 w-4 fill-current" />
              Carta del día gratis
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-[200px] border-2 font-medium transition-all duration-300 hover:scale-105"
            style={{
              borderColor: "rgba(249, 247, 242, 0.4)",
              color: "#f9f7f2",
              background: "rgba(249, 247, 242, 0.05)",
            }}
          >
            <Link href={ROUTES.REGISTER}>Crear cuenta gratis</Link>
          </Button>
        </div>

        {/* Social proof / trust */}
        <p className="mt-8 text-sm" style={{ color: "rgba(249, 247, 242, 0.45)" }}>
          Sin tarjeta de crédito &nbsp;·&nbsp; Sin compromiso &nbsp;·&nbsp; Acceso inmediato
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <div
          className="flex h-10 w-6 items-start justify-center rounded-full border-2 pt-1.5"
          style={{ borderColor: "rgba(249, 247, 242, 0.3)" }}
          aria-hidden="true"
        >
          <div className="h-2 w-1 rounded-full" style={{ background: "rgba(249, 247, 242, 0.5)" }} />
        </div>
      </div>
    </section>
  );
}
```

---

## Paso 4 — Rediseñar `HowItWorks.tsx`

**Archivo:** `frontend/src/components/features/home/HowItWorks.tsx`

**Objetivo:** Sección limpia sobre crema papiro. Números grandes en dorado, íconos coherentes, sin clases `dark:`.

**Reemplazar completamente con:**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { HelpCircle, Layers, Sparkles } from "lucide-react";

interface Step {
  number: string;
  icon: typeof HelpCircle;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "1",
    icon: HelpCircle,
    title: "Elige tu pregunta",
    description: "Selecciona una categoría y elige la pregunta que refleja lo que tu corazón necesita explorar.",
  },
  {
    number: "2",
    icon: Layers,
    title: "Selecciona tus cartas",
    description: "Elige el tipo de tirada según tu plan y deja que la intuición guíe tu mano al elegir cada carta.",
  },
  {
    number: "3",
    icon: Sparkles,
    title: "Recibe tu lectura",
    description: "Obtén una interpretación personalizada que conecta las cartas con tu situación particular.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-bg-main px-4 py-16 md:py-24">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="font-serif text-4xl font-light text-text-primary md:text-5xl lg:text-6xl">¿Cómo funciona?</h2>
          <div className="mx-auto mt-4 h-px w-24 bg-secondary opacity-60" />
          <p className="mx-auto mt-6 max-w-xl font-sans text-lg text-text-muted">
            Tu lectura de tarot en 3 simples pasos
          </p>
        </div>

        {/* Steps */}
        <div className="relative mb-16 grid gap-8 md:grid-cols-3">
          {/* Connector line (desktop only) */}
          <div
            className="absolute left-[16.66%] right-[16.66%] top-8 hidden h-px md:block"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(214, 158, 46, 0.4), rgba(214, 158, 46, 0.4), transparent)",
            }}
            aria-hidden="true"
          />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Number badge */}
                <div
                  className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-lg"
                  style={{
                    borderColor: "#d69e2e",
                    background: "linear-gradient(135deg, #1a0a2e 0%, #2d1b69 100%)",
                    boxShadow: "0 0 20px rgba(214, 158, 46, 0.2)",
                  }}
                >
                  <span className="font-serif text-2xl font-bold" style={{ color: "#d69e2e" }}>
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className="mb-4 rounded-xl p-3" style={{ background: "rgba(128, 90, 213, 0.08)" }}>
                  <Icon className="h-7 w-7 text-primary" />
                </div>

                {/* Text */}
                <h3 className="mb-2 font-serif text-xl font-semibold text-text-primary">{step.title}</h3>
                <p className="max-w-xs font-sans text-sm leading-relaxed text-text-muted">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-primary px-8 font-medium text-white shadow-md transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-lg"
          >
            <Link href={ROUTES.REGISTER}>Comienza tu viaje</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

---

## Paso 5 — Rediseñar `PlanComparison.tsx`

**Archivo:** `frontend/src/components/features/home/PlanComparison.tsx`

**Objetivo:** Cards con bordes elegantes, plan Recomendado con fondo oscuro y badge dorado, sin clases `dark:`, usando design tokens.

**Reemplazar completamente con:**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { Check, X, Star } from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: PlanFeature[];
  cta: { text: string; href: string };
  recommended?: boolean;
}

const plans: Plan[] = [
  {
    name: "Visitante",
    price: "Sin registro",
    description: "Prueba el tarot sin compromiso",
    features: [
      { text: "Carta del día (1 vez al día)", included: true },
      { text: "Horóscopos (occidental y chino)", included: true },
      { text: "Numerología", included: true },
      { text: "Rituales (acceso básico)", included: true },
      { text: "Enciclopedia mística", included: true },
      { text: "1 consulta de péndulo", included: true },
      { text: "1 carta astral", included: true },
      { text: "Lecturas de tarot", included: false },
      { text: "Interpretación con IA", included: false },
    ],
    cta: { text: "Probar carta del día", href: ROUTES.CARTA_DEL_DIA },
  },
  {
    name: "Free",
    price: "Gratis",
    description: "Empieza tu viaje espiritual",
    features: [
      { text: "Carta del día", included: true },
      { text: "1 lectura de tarot / día (1–3 cartas)", included: true },
      { text: "Horóscopos con widget personalizado", included: true },
      { text: "Numerología con widget personalizado", included: true },
      { text: "Rituales (ventajas adicionales)", included: true },
      { text: "Enciclopedia mística", included: true },
      { text: "Carta astral ilimitada", included: true },
      { text: "1 consulta péndulo / día", included: true },
      { text: "Compartir lecturas", included: true },
      { text: "Interpretación con IA", included: false },
    ],
    cta: { text: "Registrarse gratis", href: ROUTES.REGISTER },
  },
  {
    name: "Premium",
    price: "$9.99",
    priceNote: "por mes",
    description: "Desbloquea todo el potencial",
    features: [
      { text: "Carta del día", included: true },
      { text: "3 lecturas de tarot / día — todas las tiradas", included: true },
      { text: "Interpretación personalizada con IA", included: true },
      { text: "Preguntas personalizadas", included: true },
      { text: "Carta astral ilimitada + IA", included: true },
      { text: "Horóscopos y numerología con widget", included: true },
      { text: "Rituales (acceso completo)", included: true },
      { text: "Enciclopedia mística", included: true },
      { text: "3 consultas péndulo / día", included: true },
      { text: "Compartir lecturas e historial completo", included: true },
    ],
    cta: { text: "Comenzar Premium", href: ROUTES.PREMIUM },
    recommended: true,
  },
];

export function PlanComparison() {
  return (
    <section className="px-4 py-16 md:py-24" style={{ background: "#f2eef9" }}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-14 text-center">
          <h2 className="font-serif text-4xl font-light text-text-primary md:text-5xl lg:text-6xl">
            ¿Qué plan se adapta a ti?
          </h2>
          <div className="mx-auto mt-4 h-px w-24 bg-secondary opacity-60" />
          <p className="mx-auto mt-6 max-w-xl font-sans text-lg text-text-muted">
            Desde pruebas sin registro hasta acceso completo con interpretaciones personalizadas
          </p>
        </div>

        {/* Cards */}
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 md:items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative flex flex-col overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-xl"
              style={
                plan.recommended
                  ? {
                      background: "linear-gradient(160deg, #2d1b69 0%, #1a0a2e 100%)",
                      border: "1px solid rgba(214, 158, 46, 0.4)",
                      boxShadow: "0 0 40px rgba(128, 90, 213, 0.2)",
                    }
                  : {
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                    }
              }
            >
              {/* Recommended badge */}
              {plan.recommended && (
                <div
                  className="flex items-center justify-center gap-1.5 py-2 text-center text-xs font-semibold uppercase tracking-widest"
                  style={{ background: "#d69e2e", color: "#1a0a2e" }}
                >
                  <Star className="h-3 w-3 fill-current" />
                  Recomendado
                  <Star className="h-3 w-3 fill-current" />
                </div>
              )}

              <div className="flex flex-1 flex-col p-6">
                {/* Plan name & price */}
                <div className="mb-6 text-center">
                  <h3
                    className="mb-3 font-serif text-2xl font-semibold"
                    style={{ color: plan.recommended ? "#f9f7f2" : "#2d3748" }}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className="font-serif text-4xl font-bold"
                      style={{ color: plan.recommended ? "#d69e2e" : "#805ad5" }}
                    >
                      {plan.price}
                    </span>
                    {plan.priceNote && (
                      <span
                        className="font-sans text-sm"
                        style={{ color: plan.recommended ? "rgba(249,247,242,0.6)" : "#718096" }}
                      >
                        {plan.priceNote}
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-2 font-sans text-sm"
                    style={{ color: plan.recommended ? "rgba(249,247,242,0.65)" : "#718096" }}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Divider */}
                <div
                  className="mb-6 h-px w-full"
                  style={{
                    background: plan.recommended ? "rgba(214, 158, 46, 0.2)" : "rgba(128, 90, 213, 0.12)",
                  }}
                />

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2.5">
                      {feature.included ? (
                        <Check
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: plan.recommended ? "#d69e2e" : "#48bb78" }}
                        />
                      ) : (
                        <X className="h-4 w-4 flex-shrink-0" style={{ color: "rgba(113, 128, 150, 0.5)" }} />
                      )}
                      <span
                        className="font-sans text-sm"
                        style={{
                          color: feature.included
                            ? plan.recommended
                              ? "#f9f7f2"
                              : "#2d3748"
                            : "rgba(113, 128, 150, 0.6)",
                          textDecoration: feature.included ? "none" : "line-through",
                        }}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  size="lg"
                  className="w-full font-medium transition-all hover:scale-105"
                  style={
                    plan.recommended
                      ? {
                          background: "linear-gradient(135deg, #d69e2e, #f6d860)",
                          color: "#1a0a2e",
                          border: "none",
                        }
                      : {}
                  }
                  variant={plan.recommended ? "default" : "outline"}
                >
                  <Link href={plan.cta.href}>{plan.cta.text}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Paso 6 — Rediseñar `PremiumBenefitsSection.tsx`

**Archivo:** `frontend/src/components/features/home/PremiumBenefitsSection.tsx`

**Objetivo:** Sección oscura (azul índigo) para crear contraste visual en el ritmo de la página. Íconos en dorado, sin clases `dark:`.

**Reemplazar completamente con:**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { Sparkles, Layers, MessageSquare, BarChart3, ShieldOff, Crown } from "lucide-react";

const benefits = [
  {
    icon: Sparkles,
    title: "Interpretaciones profundas con IA",
    description: "Análisis detallados adaptados a tu situación personal y las cartas que elegiste.",
  },
  {
    icon: Layers,
    title: "Todas las tiradas disponibles",
    description: "Acceso a tiradas complejas: Cruz Celta, Herradura, Año completo y más.",
  },
  {
    icon: MessageSquare,
    title: "Preguntas personalizadas",
    description: "Formula tus propias consultas. El tarot responde exactamente lo que necesitás.",
  },
  {
    icon: BarChart3,
    title: "Historial y estadísticas",
    description: "Revisá tus lecturas pasadas y descubrí patrones en tu camino espiritual.",
  },
  {
    icon: ShieldOff,
    title: "Experiencia sin publicidad",
    description: "Lecturas en paz, sin interrupciones. Totalmente enfocada en vos.",
  },
  {
    icon: Crown,
    title: "Acceso prioritario",
    description: "Primero en recibir nuevas funcionalidades y contenidos exclusivos.",
  },
];

export function PremiumBenefitsSection() {
  return (
    <section
      className="px-4 py-16 md:py-24"
      style={{
        background: "linear-gradient(160deg, #1e1145 0%, #2d1b69 50%, #1a0a2e 100%)",
      }}
    >
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <Crown className="h-5 w-5" style={{ color: "#d69e2e" }} />
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#d69e2e" }}>
              Plan Premium
            </span>
            <Crown className="h-5 w-5" style={{ color: "#d69e2e" }} />
          </div>
          <h2 className="font-serif text-4xl font-light md:text-5xl lg:text-6xl" style={{ color: "#f9f7f2" }}>
            ¿Por qué elegir Premium?
          </h2>
          <div className="mx-auto mt-4 h-px w-24" style={{ background: "rgba(214, 158, 46, 0.5)" }} />
          <p className="mx-auto mt-6 max-w-xl font-sans text-lg" style={{ color: "rgba(249, 247, 242, 0.7)" }}>
            Desbloquea todo el potencial del tarot con funcionalidades avanzadas
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mb-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                data-testid="benefit-item"
                className="group rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: "rgba(249, 247, 242, 0.04)",
                  border: "1px solid rgba(214, 158, 46, 0.15)",
                }}
              >
                <div className="mb-4 inline-flex rounded-lg p-2.5" style={{ background: "rgba(214, 158, 46, 0.12)" }}>
                  <Icon className="h-5 w-5" style={{ color: "#d69e2e" }} />
                </div>
                <h3 className="mb-2 font-serif text-lg font-semibold" style={{ color: "#f9f7f2" }}>
                  {benefit.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed" style={{ color: "rgba(249, 247, 242, 0.6)" }}>
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Price & CTA */}
        <div className="text-center">
          <div className="mb-2 flex items-baseline justify-center gap-1">
            <span className="font-serif text-5xl font-bold" style={{ color: "#d69e2e" }}>
              $9.99
            </span>
            <span className="font-sans text-lg" style={{ color: "rgba(249, 247, 242, 0.55)" }}>
              / mes
            </span>
          </div>
          <p className="mb-8 font-sans text-sm" style={{ color: "rgba(249, 247, 242, 0.4)" }}>
            Cancelá cuando quieras. Sin compromisos.
          </p>
          <Button
            asChild
            size="lg"
            className="min-w-[220px] border-0 px-8 font-semibold shadow-xl transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #d69e2e 0%, #f6d860 50%, #b7791f 100%)",
              color: "#1a0a2e",
            }}
          >
            <Link href={ROUTES.REGISTER}>
              <Crown className="mr-2 h-4 w-4" />
              Actualizar a Premium
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

---

## Paso 7 — Rediseñar `TryWithoutRegisterSection.tsx`

**Archivo:** `frontend/src/components/features/home/TryWithoutRegisterSection.tsx`

**Objetivo:** Eliminar clases `dark:`, usar design tokens, mejorar visual sin alterar la lógica (ya está correcta).

Solo modificar las clases de estilo, NO cambiar la lógica de `checkDailyCardConsumed` ni el `useState`.

**Cambios específicos (usar Edit, no reescribir):**

1. Reemplazar la clase de la `<section>`:

   ```
   ANTES: className="container mx-auto px-4 py-12 md:py-16"
   DESPUÉS: className="bg-bg-main px-4 py-16 md:py-24"
   ```

2. Reemplazar la clase del `<Card>`:

   ```
   ANTES: className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-pink-950/20"
   DESPUÉS: className="container mx-auto overflow-hidden border-0 shadow-lg"
   ```

   Y agregar `style={{ background: 'linear-gradient(135deg, #f2eef9 0%, #fdf6e7 100%)' }}` al Card.

3. Reemplazar el `<CardContent>`:

   ```
   ANTES: className="flex flex-col items-center p-8 text-center md:p-12"
   DESPUÉS: className="flex flex-col items-center p-10 text-center md:p-16"
   ```

4. Reemplazar el div del ícono:

   ```
   ANTES: className="mb-6 rounded-full bg-purple-100 p-4 dark:bg-purple-900/30"
   DESPUÉS: className="mb-6 rounded-full p-4" style={{ background: 'rgba(128, 90, 213, 0.1)' }}
   ```

5. Los íconos `Clock` y `Sparkles`: cambiar `className="h-8 w-8 text-purple-600 dark:text-purple-400"` a `className="h-8 w-8 text-primary"`.

6. El `<h2>`: cambiar `className="mb-4 font-serif text-3xl font-bold text-gray-900 md:text-4xl dark:text-white"` a `className="mb-4 font-serif text-3xl font-light text-text-primary md:text-4xl"`.

7. El `<p>` de descripción: cambiar `className="mb-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300"` a `className="mb-8 max-w-2xl font-sans text-lg text-text-muted"`.

8. Los botones: cambiar `className="bg-purple-600 hover:bg-purple-700"` a `className="bg-primary hover:bg-primary/90"`.

---

## Paso 8 — Rediseñar `WhatIsTarotSection.tsx`

**Archivo:** `frontend/src/components/features/home/WhatIsTarotSection.tsx`

**Objetivo:** Resolver el problema de legibilidad (fondo gris claro + texto gris claro), usar design tokens, agregar placeholder para imagen que el usuario proveerá.

**Reemplazar completamente con:**

```tsx
import Image from "next/image";

export function WhatIsTarotSection() {
  return (
    <section className="bg-bg-main px-4 py-16 md:py-24">
      <div className="container mx-auto">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-14 text-center">
            <h2 className="font-serif text-4xl font-light text-text-primary md:text-5xl lg:text-6xl">
              ¿Qué es el Tarot?
            </h2>
            <div className="mx-auto mt-4 h-px w-24 bg-secondary opacity-60" />
          </div>

          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Image — usuario proveerá /images/tarot-spread.webp */}
            <div
              data-testid="tarot-cards-illustration"
              className="relative aspect-square overflow-hidden rounded-2xl shadow-xl"
              style={{
                background: "linear-gradient(135deg, #2d1b69 0%, #1a0a2e 100%)",
                border: "1px solid rgba(214, 158, 46, 0.2)",
              }}
            >
              {/* Placeholder visual hasta que el usuario provea la imagen */}
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="font-serif text-8xl font-light" style={{ color: "rgba(214, 158, 46, 0.4)" }}>
                  🃏
                </div>
                <p className="font-sans text-sm" style={{ color: "rgba(249, 247, 242, 0.3)" }}>
                  Imagen de tarot aquí
                </p>
              </div>
              {/* Cuando el usuario provea la imagen, reemplazar el div de arriba con:
              <Image
                src="/images/tarot-spread.webp"
                alt="Distribución de cartas de tarot"
                fill
                className="object-cover"
              />
              */}
            </div>

            {/* Content */}
            <div className="space-y-6">
              <p className="font-sans text-lg leading-relaxed text-text-primary">
                El tarot es un sistema de cartas milenario utilizado como herramienta de autoconocimiento, reflexión y
                guía espiritual. Compuesto por <strong className="font-semibold text-primary">78 cartas</strong>{" "}
                divididas en dos grupos principales.
              </p>

              <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(128, 90, 213, 0.15)" }}>
                <div className="p-5" style={{ background: "rgba(128, 90, 213, 0.04)" }}>
                  <h3 className="mb-2 font-serif text-xl font-semibold text-primary">Arcanos Mayores — 22 cartas</h3>
                  <p className="font-sans text-sm leading-relaxed text-text-muted">
                    Representan los grandes arquetipos y experiencias fundamentales de la vida humana. Desde El Loco
                    hasta El Mundo, narran el viaje del alma.
                  </p>
                </div>
                <div className="h-px w-full" style={{ background: "rgba(128, 90, 213, 0.1)" }} />
                <div className="p-5" style={{ background: "rgba(214, 158, 46, 0.03)" }}>
                  <h3 className="mb-2 font-serif text-xl font-semibold" style={{ color: "#b7791f" }}>
                    Arcanos Menores — 56 cartas
                  </h3>
                  <p className="font-sans text-sm leading-relaxed text-text-muted">
                    Divididos en cuatro palos (Copas, Bastos, Espadas y Oros), reflejan las situaciones cotidianas y los
                    aspectos específicos de nuestra vida.
                  </p>
                </div>
              </div>

              <p className="font-sans text-base leading-relaxed text-text-muted">
                En Auguria, combinamos la sabiduría tradicional del tarot con inteligencia artificial para ofrecerte
                interpretaciones profundas y personalizadas que te ayuden en tu camino de autoconocimiento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Paso 9 — Verificar `LandingPage.tsx`

**Archivo:** `frontend/src/components/features/home/LandingPage.tsx`

No necesita cambios en la lógica. Solo verificar que el `<main>` tenga `className="min-h-screen"` (ya lo tiene).

El orden de secciones queda:

1. `HeroSection` — oscuro (hero full-screen)
2. `BirthChartPromo` — (existente, no tocar)
3. `TryWithoutRegisterSection` — claro (gradiente crema/lavanda)
4. `PlanComparison` — lila muy suave
5. `HowItWorks` — crema papiro
6. `PremiumBenefitsSection` — oscuro (índigo/navy)
7. `WhatIsTarotSection` — crema papiro

Este ritmo claro/oscuro/claro/oscuro crea variedad visual y nunca es monótono.

---

## Paso 10 — Verificar que no hay clases `dark:` residuales

Ejecutar en `frontend/src/components/features/home/`:

```bash
grep -r "dark:" .
```

Si aparece algún resultado, eliminar todas las clases `dark:` encontradas. El proyecto es light-mode only.

---

## Paso 11 — Imágenes (placeholders activos)

El código ya tiene comentarios marcando dónde va cada imagen cuando el usuario las provea. Las rutas esperadas son:

| Imagen          | Ruta en `/public`           | Prompt para Gemini                                                                                                                                                                                                          |
| --------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero background | `/images/hero-bg.webp`      | `"Mystical dark purple and deep navy cosmic background, soft golden bokeh light particles floating, crescent moon glow in upper right, ethereal stars scattered, no text, no people, 1920x1080, photorealistic, cinematic"` |
| Spread de tarot | `/images/tarot-spread.webp` | `"Beautiful tarot cards fan spread on dark velvet surface, warm golden candlelight from below, 5 cards face up showing mystical illustrations, bokeh background, no text visible, square format 800x800, photorealistic"`   |

Cuando el usuario provea las imágenes, buscar los comentarios `/* Cuando el usuario provea la imagen */` en `HeroSection.tsx` y `WhatIsTarotSection.tsx` y seguir las instrucciones inline.

---

## Paso 12 — Ciclo de calidad

```bash
cd frontend
npm run format
npm run lint:fix
npm run type-check
npm run test:run
npm run build
node scripts/validate-architecture.js
```

Todos deben pasar sin errores antes del commit.

---

## Paso 13 — Commit y PR

```bash
git add frontend/src/app/globals.css \
        frontend/src/components/features/home/HeroSection.tsx \
        frontend/src/components/features/home/HowItWorks.tsx \
        frontend/src/components/features/home/PlanComparison.tsx \
        frontend/src/components/features/home/PremiumBenefitsSection.tsx \
        frontend/src/components/features/home/TryWithoutRegisterSection.tsx \
        frontend/src/components/features/home/WhatIsTarotSection.tsx

git commit -m "feat: redesign landing page with mystical dark/light visual rhythm

- HeroSection: full-screen dark gradient hero with gold shimmer text and decorative stars
- HowItWorks: clean crema background, gold numbered steps, brand tokens
- PlanComparison: recommended plan with dark card and gold CTA
- PremiumBenefitsSection: full dark indigo section with gold icons
- TryWithoutRegisterSection: remove dark: classes, use design tokens
- WhatIsTarotSection: fix light-on-light readability, image placeholder
- globals.css: add hero/dark section color tokens and landing animations
- Remove all dark: classes (project is light-mode only)"

gh pr create \
  --base develop \
  --title "feat: landing page redesign — mystical dark/light rhythm" \
  --body "## Qué hace este PR

Rediseño completo de la landing page para usuarios no autenticados.

## Cambios

- **HeroSection**: Full-screen hero oscuro con gradiente índigo/navy, texto gigante en Cormorant Garamond, efecto shimmer dorado en el subtítulo, estrellas decorativas CSS, scroll indicator
- **PlanComparison**: Card del plan Premium con fondo oscuro y badge dorado
- **PremiumBenefitsSection**: Sección completa en oscuro con íconos dorados
- **HowItWorks**: Pasos numerados con círculos dorado-sobre-oscuro, conector visual desktop
- **WhatIsTarotSection**: Corregida legibilidad (fix claro sobre claro), placeholder para imagen
- **TryWithoutRegisterSection**: Eliminadas clases \`dark:\`, design tokens consistentes
- **globals.css**: 6 nuevos tokens de color para hero/secciones oscuras + 3 animaciones nuevas

## Testing

- [ ] Visual revisado en mobile (375px)
- [ ] Visual revisado en desktop (1440px)
- [ ] Tests existentes pasan
- [ ] Build sin errores
- [ ] Sin clases \`dark:\` residuales"
```

---

## Notas finales para el agente

- **NO** modificar `LandingPage.tsx` (solo verificar)
- **NO** modificar ningún componente fuera de `features/home/` ni `globals.css`
- **NO** alterar la lógica de negocio de `TryWithoutRegisterSection` (solo estilos)
- **NO** romper tests existentes
- **SÍ** agregar `data-testid` attributes cuando ya existían (no removerlos)
- Si `BirthChartPromo` tiene problemas visuales propios, **ignorarlo** — está fuera del scope
- Si algún import de ruta como `ROUTES.PREMIUM` no existe, verificar en `frontend/src/lib/constants/routes.ts` y usar el correcto
