import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nueva Contraseña | Auguria',
  description: 'Elegí una contraseña nueva para tu cuenta de Auguria',
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
