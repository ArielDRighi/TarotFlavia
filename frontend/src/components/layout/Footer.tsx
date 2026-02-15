import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';

/**
 * Footer component
 * Footer with services navigation, legal links and copyright
 */
export function Footer() {
  return (
    <footer className="bg-surface text-muted-foreground border-t py-8" role="contentinfo">
      <div className="container mx-auto px-4">
        {/* Services section */}
        <nav className="mb-6" aria-label="Servicios">
          <h3 className="mb-4 text-center text-sm font-semibold">Nuestros Servicios</h3>
          <ul className="flex flex-wrap items-center justify-center gap-4 text-sm md:gap-6">
            <li>
              <Link href={ROUTES.CARTA_DEL_DIA} className="hover:text-primary transition-colors">
                Carta del Día
              </Link>
            </li>
            <li>
              <Link href={ROUTES.HOROSCOPO} className="hover:text-primary transition-colors">
                Horóscopo
              </Link>
            </li>
            <li>
              <Link href={ROUTES.HOROSCOPO_CHINO} className="hover:text-primary transition-colors">
                Horóscopo Chino
              </Link>
            </li>
            <li>
              <Link href={ROUTES.NUMEROLOGIA} className="hover:text-primary transition-colors">
                Numerología
              </Link>
            </li>
            <li>
              <Link href={ROUTES.RITUALES} className="hover:text-primary transition-colors">
                Rituales
              </Link>
            </li>
            <li>
              <Link href={ROUTES.PENDULO} className="hover:text-primary transition-colors">
                Péndulo
              </Link>
            </li>
            <li>
              <Link href={ROUTES.CARTA_ASTRAL} className="hover:text-primary transition-colors">
                Carta Astral
              </Link>
            </li>
          </ul>
        </nav>

        {/* Legal links */}
        <nav className="mb-4" aria-label="Enlaces legales">
          <ul className="flex items-center justify-center gap-6 text-sm">
            <li>
              <Link href="/terminos" className="hover:text-primary transition-colors">
                Términos
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="hover:text-primary transition-colors">
                Privacidad
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-primary transition-colors">
                Contacto
              </Link>
            </li>
          </ul>
        </nav>

        {/* Copyright */}
        <p className="text-center text-sm">© 2025 Auguria</p>
      </div>
    </footer>
  );
}
