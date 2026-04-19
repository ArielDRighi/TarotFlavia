import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { Sparkles, Star } from 'lucide-react';

// Decorative star positions — purely visual, no logic
const decorativeStars = [
  { top: '12%', left: '8%', size: 3, delay: '0s', duration: '2.8s' },
  { top: '20%', left: '88%', size: 4, delay: '0.5s', duration: '3.2s' },
  { top: '35%', left: '5%', size: 2, delay: '1s', duration: '2.5s' },
  { top: '65%', left: '92%', size: 3, delay: '0.3s', duration: '3.5s' },
  { top: '78%', left: '15%', size: 4, delay: '0.8s', duration: '2.9s' },
  { top: '45%', left: '95%', size: 2, delay: '1.5s', duration: '3.1s' },
  { top: '88%', left: '78%', size: 3, delay: '0.2s', duration: '2.7s' },
  { top: '10%', left: '55%', size: 2, delay: '1.2s', duration: '3.3s' },
];

export function HeroSection() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20"
      style={{
        background: 'linear-gradient(160deg, #1a0a2e 0%, #2d1b69 45%, #1a0a2e 100%)',
      }}
    >
      {/* Overlay gradient para asegurar legibilidad */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(128, 90, 213, 0.3) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(214, 158, 46, 0.15) 0%, transparent 50%)',
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
        className="absolute top-[8%] right-[10%] z-0 opacity-30"
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          boxShadow: 'inset -30px -10px 0 0 #d69e2e',
          filter: 'blur(1px)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-xs font-medium tracking-[0.15em] text-amber-300 uppercase">
            Tu guía espiritual
          </span>
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
        </div>

        {/* Main headline */}
        <h1 className="mb-6 font-serif leading-tight" style={{ color: '#f9f7f2' }}>
          <span className="block text-5xl font-light md:text-6xl lg:text-7xl xl:text-8xl">
            Descubre tu destino
          </span>
          <span className="animate-shimmer-gold mt-1 block text-4xl font-semibold md:text-5xl lg:text-6xl xl:text-7xl">
            a través del Tarot
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mb-10 max-w-2xl font-sans text-lg leading-relaxed md:text-xl"
          style={{ color: 'rgba(249, 247, 242, 0.75)' }}
        >
          Lecturas personalizadas que iluminan tu camino. Desde la carta del día hasta
          interpretaciones profundas con IA, encuentra las respuestas que buscas.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="min-w-[200px] border-0 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-amber-500/25"
            style={{
              background: 'linear-gradient(135deg, #d69e2e 0%, #f6d860 50%, #b7791f 100%)',
              color: '#1a0a2e',
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
              borderColor: 'rgba(249, 247, 242, 0.4)',
              color: '#f9f7f2',
              background: 'rgba(249, 247, 242, 0.05)',
            }}
          >
            <Link href={ROUTES.REGISTER}>Crear cuenta gratis</Link>
          </Button>
        </div>

        {/* Social proof / trust */}
        <p className="mt-8 text-sm" style={{ color: 'rgba(249, 247, 242, 0.45)' }}>
          Sin tarjeta de crédito &nbsp;·&nbsp; Sin compromiso &nbsp;·&nbsp; Acceso inmediato
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <div
          className="flex h-10 w-6 items-start justify-center rounded-full border-2 pt-1.5"
          style={{ borderColor: 'rgba(249, 247, 242, 0.3)' }}
          aria-hidden="true"
        >
          <div
            className="h-2 w-1 rounded-full"
            style={{ background: 'rgba(249, 247, 242, 0.5)' }}
          />
        </div>
      </div>
    </section>
  );
}
