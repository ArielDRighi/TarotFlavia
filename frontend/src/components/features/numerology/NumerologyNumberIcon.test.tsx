import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { NumerologyNumberIcon } from './NumerologyNumberIcon';

describe('NumerologyNumberIcon', () => {
  it('renderiza el asset del arquetipo en medallón, decorativo', () => {
    render(<NumerologyNumberIcon number={7} data-testid="icono" />);

    const wrapper = screen.getByTestId('icono');
    expect(wrapper).toHaveClass('brand-icon-medallion-light');
    const img = wrapper.querySelector('img');
    expect(decodeURIComponent(img?.getAttribute('src') ?? '')).toContain(
      '/images/icons/numerology/7.webp'
    );
    expect(img).toHaveAttribute('aria-hidden', 'true');
  });

  it('cae a un icono de lucide cuando el número no tiene arquetipo', () => {
    render(<NumerologyNumberIcon number={42} data-testid="icono" />);

    expect(screen.getByTestId('icono').tagName.toLowerCase()).toBe('svg');
    expect(screen.getByTestId('icono')).toHaveAttribute('aria-hidden', 'true');
  });

  it('usa el calendario como fallback para ciclos', () => {
    const { container } = render(<NumerologyNumberIcon number={0} fallback="cycle" />);

    expect(container.querySelector('svg.lucide-calendar-days')).not.toBeNull();
  });
});
