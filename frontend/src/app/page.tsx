import Image from 'next/image';

export default function Home() {
  return (
    <div className="bg-bg-main flex min-h-screen items-center justify-center font-sans">
      <main className="bg-surface flex min-h-screen w-full max-w-3xl flex-col items-center justify-between px-16 py-32 sm:items-start">
        <Image src="/next.svg" alt="Next.js logo" width={100} height={20} priority />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="text-text-primary max-w-xs font-serif text-3xl leading-10 font-semibold tracking-tight">
            Bienvenido a TarotFlavia
          </h1>
          <p className="text-text-muted max-w-md text-lg leading-8">
            Marketplace de tarotistas profesionales. Conecta con guías espirituales y descubre tu
            camino.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="bg-primary text-surface hover:bg-primary/90 flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 transition-colors md:w-[158px]"
            href="#"
          >
            Comenzar
          </a>
          <a
            className="border-secondary text-secondary hover:bg-secondary/10 flex h-12 w-full items-center justify-center rounded-full border px-5 transition-colors md:w-[158px]"
            href="#"
          >
            Explorar
          </a>
        </div>
      </main>
    </div>
  );
}
