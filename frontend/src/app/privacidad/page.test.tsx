import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrivacidadPage from './page';

describe('PrivacidadPage', () => {
  it('should render without errors', () => {
    render(<PrivacidadPage />);
    expect(screen.getByText('Política de Privacidad')).toBeInTheDocument();
  });

  it('should display the main heading', () => {
    render(<PrivacidadPage />);
    const heading = screen.getByRole('heading', { name: 'Política de Privacidad', level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('font-serif');
  });

  it('should display last updated date', () => {
    render(<PrivacidadPage />);
    expect(screen.getByText('Última actualización: Febrero 2026')).toBeInTheDocument();
  });

  it('should render all 11 sections with their headings', () => {
    render(<PrivacidadPage />);

    expect(
      screen.getByRole('heading', { name: '1. Información que Recopilamos', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '2. Cómo Utilizamos tu Información', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '3. Base Legal para el Procesamiento', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '4. Compartir Información', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '5. Seguridad de Datos', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '6. Cookies y Tecnologías Similares', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '7. Tus Derechos', level: 2 })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '8. Retención de Datos', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '9. Privacidad de Menores', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '10. Cambios a esta Política', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '11. Contacto', level: 2 })).toBeInTheDocument();
  });

  it('should display the placeholder disclaimer', () => {
    render(<PrivacidadPage />);
    expect(screen.getByText(/Este es un contenido placeholder/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /El contenido legal real debe ser revisado y aprobado por profesionales legales/i
      )
    ).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    const { container } = render(<PrivacidadPage />);
    const mainContainer = container.querySelector('.bg-bg-main');
    expect(mainContainer).toBeInTheDocument();
  });

  it('should mention GDPR compliance', () => {
    render(<PrivacidadPage />);
    expect(screen.getByText(/Cumplir con el GDPR/i)).toBeInTheDocument();
  });

  it('should display information about cookies', () => {
    render(<PrivacidadPage />);
    expect(screen.getByText(/Utilizamos cookies y tecnologías similares/i)).toBeInTheDocument();
  });

  it('should list user rights', () => {
    render(<PrivacidadPage />);
    expect(screen.getByText(/Acceder a tus datos personales/i)).toBeInTheDocument();
    expect(screen.getByText(/Solicitar la eliminación de tus datos/i)).toBeInTheDocument();
  });

  it('should have disclaimer in yellow background', () => {
    const { container } = render(<PrivacidadPage />);
    const disclaimer = container.querySelector('.bg-yellow-50');
    expect(disclaimer).toBeInTheDocument();
  });

  it('should mention data security measures', () => {
    render(<PrivacidadPage />);
    expect(
      screen.getByText(/Implementamos medidas de seguridad técnicas y organizativas/i)
    ).toBeInTheDocument();
  });
});
