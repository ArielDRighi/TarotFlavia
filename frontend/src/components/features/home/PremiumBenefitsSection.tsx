import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { Sparkles, Layers, MessageSquare, BarChart3, ShieldOff, Crown } from 'lucide-react';

const benefits = [
  {
    icon: Sparkles,
    title: 'Interpretaciones profundas y personalizadas',
    description: 'Análisis detallados adaptados a tu situación personal y las cartas que elegiste.',
  },
  {
    icon: Layers,
    title: 'Todas las tiradas disponibles',
    description: 'Acceso a tiradas complejas: Cruz Celta, Herradura, Año completo y más.',
  },
  {
    icon: MessageSquare,
    title: 'Preguntas personalizadas',
    description: 'Formula tus propias consultas. El tarot responde exactamente lo que necesitás.',
  },
  {
    icon: BarChart3,
    title: 'Historial y estadísticas',
    description: 'Revisá tus lecturas pasadas y descubrí patrones en tu camino espiritual.',
  },
  {
    icon: ShieldOff,
    title: 'Experiencia sin publicidad',
    description: 'Lecturas en paz, sin interrupciones. Totalmente enfocada en vos.',
  },
  {
    icon: Crown,
    title: 'Acceso prioritario',
    description: 'Primero en recibir nuevas funcionalidades y contenidos exclusivos.',
  },
];

export function PremiumBenefitsSection() {
  return (
    <section
      className="px-4 py-16 md:py-24"
      style={{
        background: 'linear-gradient(160deg, #1e1145 0%, #2d1b69 50%, #1a0a2e 100%)',
      }}
    >
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <Crown className="h-5 w-5" style={{ color: '#d69e2e' }} />
            <span
              className="font-sans text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: '#d69e2e' }}
            >
              Plan Premium
            </span>
            <Crown className="h-5 w-5" style={{ color: '#d69e2e' }} />
          </div>
          <h2
            className="font-serif text-4xl font-light md:text-5xl lg:text-6xl"
            style={{ color: '#f9f7f2' }}
          >
            ¿Por qué elegir Premium?
          </h2>
          <div
            className="mx-auto mt-4 h-px w-24"
            style={{ background: 'rgba(214, 158, 46, 0.5)' }}
          />
          <p
            className="mx-auto mt-6 max-w-xl font-sans text-lg"
            style={{ color: 'rgba(249, 247, 242, 0.7)' }}
          >
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
                  background: 'rgba(249, 247, 242, 0.04)',
                  border: '1px solid rgba(214, 158, 46, 0.15)',
                }}
              >
                <div
                  className="mb-4 inline-flex rounded-lg p-2.5"
                  style={{ background: 'rgba(214, 158, 46, 0.12)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: '#d69e2e' }} />
                </div>
                <h3 className="mb-2 font-serif text-lg font-semibold" style={{ color: '#f9f7f2' }}>
                  {benefit.title}
                </h3>
                <p
                  className="font-sans text-sm leading-relaxed"
                  style={{ color: 'rgba(249, 247, 242, 0.6)' }}
                >
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Price & CTA */}
        <div className="text-center">
          <div className="mb-2 flex items-baseline justify-center gap-1">
            <span className="font-serif text-5xl font-bold" style={{ color: '#d69e2e' }}>
              $7.000
            </span>
            <span className="font-sans text-lg" style={{ color: 'rgba(249, 247, 242, 0.55)' }}>
              / mes
            </span>
          </div>
          <p className="mb-8 font-sans text-sm" style={{ color: 'rgba(249, 247, 242, 0.4)' }}>
            Cancelá cuando quieras. Sin compromisos.
          </p>
          <Button
            asChild
            size="lg"
            className="min-w-[220px] border-0 px-8 font-semibold shadow-xl transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #d69e2e 0%, #f6d860 50%, #b7791f 100%)',
              color: '#1a0a2e',
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
