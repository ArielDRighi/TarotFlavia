import Image from 'next/image';

export function WhatIsTarotSection() {
  return (
    <section className="bg-bg-main px-4 py-16 md:py-24">
      <div className="container mx-auto">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-14 text-center">
            <h2 className="text-text-primary font-serif text-4xl font-light md:text-5xl lg:text-6xl">
              ¿Qué es el Tarot?
            </h2>
            <div className="bg-secondary mx-auto mt-4 h-px w-24 opacity-60" />
          </div>

          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Image */}
            <div
              data-testid="tarot-cards-illustration"
              className="relative aspect-square overflow-hidden rounded-2xl shadow-xl"
              style={{
                border: '1px solid rgba(214, 158, 46, 0.2)',
              }}
            >
              <Image
                src="/images/tarot-cards.webp"
                alt="Cartas de tarot con diseños místicos"
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <p className="text-text-primary font-sans text-lg leading-relaxed">
                El tarot es un sistema de cartas milenario utilizado como herramienta de
                autoconocimiento, reflexión y guía espiritual. Compuesto por{' '}
                <strong className="text-primary font-semibold">78 cartas</strong> divididas en dos
                grupos principales.
              </p>

              <div
                className="overflow-hidden rounded-xl"
                style={{ border: '1px solid rgba(128, 90, 213, 0.15)' }}
              >
                <div className="p-5" style={{ background: 'rgba(128, 90, 213, 0.04)' }}>
                  <h3 className="text-primary mb-2 font-serif text-xl font-semibold">
                    Arcanos Mayores — 22 cartas
                  </h3>
                  <p className="text-text-muted font-sans text-sm leading-relaxed">
                    Representan los grandes arquetipos y experiencias fundamentales de la vida
                    humana. Desde El Loco hasta El Mundo, narran el viaje del alma.
                  </p>
                </div>
                <div className="h-px w-full" style={{ background: 'rgba(128, 90, 213, 0.1)' }} />
                <div className="p-5" style={{ background: 'rgba(214, 158, 46, 0.03)' }}>
                  <h3
                    className="mb-2 font-serif text-xl font-semibold"
                    style={{ color: '#b7791f' }}
                  >
                    Arcanos Menores — 56 cartas
                  </h3>
                  <p className="text-text-muted font-sans text-sm leading-relaxed">
                    Divididos en cuatro palos (Copas, Bastos, Espadas y Oros), reflejan las
                    situaciones cotidianas y los aspectos específicos de nuestra vida.
                  </p>
                </div>
              </div>

              <p className="text-text-muted font-sans text-base leading-relaxed">
                En Auguria, combinamos la sabiduría tradicional del tarot con tecnología moderna
                para ofrecerte interpretaciones profundas y personalizadas que te ayuden en tu
                camino de autoconocimiento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
