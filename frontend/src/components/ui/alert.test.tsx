import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert, AlertDescription, AlertTitle } from './alert';

describe('Alert', () => {
  it('should render with role="alert"', () => {
    render(<Alert>Contenido</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render default variant', () => {
    render(<Alert>Mensaje</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('data-slot', 'alert');
  });

  it('should render destructive variant', () => {
    render(<Alert variant="destructive">Error</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('text-destructive');
  });

  it('should render warning variant', () => {
    render(<Alert variant="warning">Advertencia</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('text-amber');
  });

  it('should render success variant', () => {
    render(<Alert variant="success">Éxito</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('text-emerald');
  });

  it('should render info variant', () => {
    render(<Alert variant="info">Información</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('text-blue');
  });

  it('should render AlertTitle correctly', () => {
    render(
      <Alert>
        <AlertTitle>Título de alerta</AlertTitle>
      </Alert>
    );
    expect(screen.getByText('Título de alerta')).toBeInTheDocument();
  });

  it('should render AlertDescription correctly', () => {
    render(
      <Alert>
        <AlertDescription>Descripción de alerta</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Descripción de alerta')).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    render(<Alert className="custom-class">Contenido</Alert>);
    expect(screen.getByRole('alert').className).toContain('custom-class');
  });
});
