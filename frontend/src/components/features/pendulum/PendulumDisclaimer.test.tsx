import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PendulumDisclaimer } from './PendulumDisclaimer';

describe('PendulumDisclaimer', () => {
  it('should not render when open is false', () => {
    render(<PendulumDisclaimer open={false} onAccept={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('should render when open is true', () => {
    render(<PendulumDisclaimer open={true} onAccept={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('should display disclaimer title', () => {
    render(<PendulumDisclaimer open={true} onAccept={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText(/aviso importante/i)).toBeInTheDocument();
  });

  it('should display entertainment warning', () => {
    render(<PendulumDisclaimer open={true} onAccept={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('entretenimiento')).toBeInTheDocument();
  });

  it('should display all disclaimer points', () => {
    render(<PendulumDisclaimer open={true} onAccept={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText(/no sustituye el consejo de profesionales/i)).toBeInTheDocument();
    expect(screen.getByText(/respuestas son generadas aleatoriamente/i)).toBeInTheDocument();
    expect(
      screen.getByText(/no debe usarse para tomar decisiones importantes/i)
    ).toBeInTheDocument();
  });

  it('should call onAccept when accept button is clicked', async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();

    render(<PendulumDisclaimer open={true} onAccept={onAccept} onCancel={vi.fn()} />);

    const acceptButton = screen.getByRole('button', { name: /entiendo y acepto/i });
    await user.click(acceptButton);

    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<PendulumDisclaimer open={true} onAccept={vi.fn()} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
