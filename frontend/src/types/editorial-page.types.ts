/**
 * Tipos compartidos por las páginas editoriales estáticas del sitio
 * (`/sobre-nosotros`, `/politica-editorial`): texto en datos tipados que un
 * componente sin `'use client'` maqueta como `h1` → `h2` + párrafos.
 */

/** Una sección temática (se renderiza como `h2` + párrafos). */
export interface EditorialSection {
  /** Encabezado de la sección. */
  heading: string;
  /** Párrafos del cuerpo, en orden. */
  paragraphs: string[];
}

/** Enlace interno al pie de la página. */
export interface EditorialLink {
  /** Texto del enlace. */
  label: string;
  /** Ruta interna (siempre empieza con `/`). */
  href: string;
}
