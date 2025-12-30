import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UpgradeBanner from './UpgradeBanner';

// Mock del botón
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    className: string;
  }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

describe('UpgradeBanner', () => {
  it('debe renderizar el banner con el mensaje correcto', () => {
    render(<UpgradeBanner onUpgradeClick={vi.fn()} />);

    expect(
      screen.getByText(/desbloquea interpretaciones personalizadas con ia/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/upgrade a premium/i)).toBeInTheDocument();
  });

  it('debe renderizar el icono de diamante', () => {
    const { container } = render(<UpgradeBanner onUpgradeClick={vi.fn()} />);

    // Buscar el SVG del icono Gem (diamante)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('debe tener estilos de gradiente púrpura-rosa', () => {
    const { container } = render(<UpgradeBanner onUpgradeClick={vi.fn()} />);

    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toMatch(/from-purple-500/);
    expect(banner.className).toMatch(/to-pink-500/);
  });

  it('debe llamar onUpgradeClick al hacer clic en el botón', () => {
    const mockClick = vi.fn();
    render(<UpgradeBanner onUpgradeClick={mockClick} />);

    const button = screen.getByRole('button', { name: /upgrade a premium/i });
    button.click();

    expect(mockClick).toHaveBeenCalledOnce();
  });

  it('debe tener el estilo de borde redondeado', () => {
    const { container } = render(<UpgradeBanner onUpgradeClick={vi.fn()} />);

    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toMatch(/rounded-lg/);
  });

  it('debe tener padding y espaciado correcto', () => {
    const { container } = render(<UpgradeBanner onUpgradeClick={vi.fn()} />);

    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toMatch(/p-6/);
  });
});
