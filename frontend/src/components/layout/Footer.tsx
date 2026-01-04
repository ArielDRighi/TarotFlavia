import Link from 'next/link';

/**
 * Footer component
 * Simple footer with legal links and copyright
 */
export function Footer() {
  return (
    <footer
      className="bg-surface text-muted-foreground border-t py-6 text-center"
      role="contentinfo"
    >
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
      <p className="text-sm">© 2025 Auguria</p>
    </footer>
  );
}
