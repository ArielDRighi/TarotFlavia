import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { RevealWidget } from './RevealWidget';

// El estado del reveal (data-revealed) lo gobierna el IntersectionObserver, que en
// el entorno de test es un no-op; aquí verificamos el CONTRATO estructural del
// wrapper (marcador de reveal, retardo escalonado y hover de marca), no la
// animación en sí (cubierta por Reveal.test.tsx).
describe('RevealWidget', () => {
  it('renders its children', () => {
    render(
      <RevealWidget index={0}>
        <span>Widget</span>
      </RevealWidget>
    );

    expect(screen.getByText('Widget')).toBeInTheDocument();
  });

  it('wraps the widget in a Reveal container for the staggered fade-up entrance', () => {
    render(
      <RevealWidget index={0}>
        <span data-testid="widget">Widget</span>
      </RevealWidget>
    );

    const reveal = screen.getByTestId('widget').closest('[data-reveal]');
    expect(reveal).not.toBeNull();
  });

  it('derives the staggered delay from the index', () => {
    render(
      <RevealWidget index={3}>
        <span data-testid="widget">Widget</span>
      </RevealWidget>
    );

    const reveal = screen.getByTestId('widget').closest('[data-reveal]') as HTMLElement;
    // 3 × 70ms (STAGGER_STEP_MS de Reveal)
    expect(reveal.style.getPropertyValue('--reveal-delay')).toBe('210ms');
  });

  it('applies the brand hover micro-interaction (lift + gold glow) on an inner element', () => {
    render(
      <RevealWidget index={0}>
        <span data-testid="widget">Widget</span>
      </RevealWidget>
    );

    const reveal = screen.getByTestId('widget').closest('[data-reveal]') as HTMLElement;
    const hoverEl = reveal.firstElementChild as HTMLElement;

    expect(hoverEl.className).toContain('hover:-translate-y-1');
    expect(hoverEl.className).toContain('hover:shadow-[0_18px_40px_-12px_rgba(214,158,46,0.45)]');
  });
});
