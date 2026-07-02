import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Reveal } from './Reveal';

// ─── IntersectionObserver mock ──────────────────────────────────────────────

type IOCallback = (entries: IntersectionObserverEntry[]) => void;

const observers: Array<{ callback: IOCallback; elements: Set<Element> }> = [];

class ControllableIntersectionObserver {
  private record: { callback: IOCallback; elements: Set<Element> };

  constructor(callback: IOCallback) {
    this.record = { callback, elements: new Set() };
    observers.push(this.record);
  }

  observe(element: Element) {
    this.record.elements.add(element);
  }

  unobserve(element: Element) {
    this.record.elements.delete(element);
  }

  disconnect() {
    this.record.elements.clear();
  }
}

/** Fires an intersecting entry for the last observer registered. */
function triggerIntersection(isIntersecting: boolean) {
  const record = observers[observers.length - 1];
  const target = Array.from(record.elements)[0];
  act(() => {
    record.callback([{ isIntersecting, target } as IntersectionObserverEntry]);
  });
}

function setReducedMotion(matches: boolean) {
  // Value-only redefinition: allowed because the global is writable (the test
  // setup leaves it non-configurable, so `vi.stubGlobal` would throw here).
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => ({
      matches,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    })),
  });
}

function setIntersectionObserver(value: unknown) {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value,
  });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Reveal', () => {
  beforeEach(() => {
    observers.length = 0;
    setReducedMotion(false);
    setIntersectionObserver(ControllableIntersectionObserver);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders its children', () => {
    render(
      <Reveal>
        <span>Contenido</span>
      </Reveal>
    );

    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('starts hidden until it enters the viewport', () => {
    render(
      <Reveal data-testid="reveal">
        <span>Contenido</span>
      </Reveal>
    );

    expect(screen.getByTestId('reveal')).toHaveAttribute('data-revealed', 'false');
  });

  it('reveals when it intersects the viewport', () => {
    render(
      <Reveal data-testid="reveal">
        <span>Contenido</span>
      </Reveal>
    );

    triggerIntersection(true);

    expect(screen.getByTestId('reveal')).toHaveAttribute('data-revealed', 'true');
  });

  it('does not reveal while it stays out of the viewport', () => {
    render(
      <Reveal data-testid="reveal">
        <span>Contenido</span>
      </Reveal>
    );

    triggerIntersection(false);

    expect(screen.getByTestId('reveal')).toHaveAttribute('data-revealed', 'false');
  });

  it('reveals immediately when the user prefers reduced motion', () => {
    setReducedMotion(true);

    render(
      <Reveal data-testid="reveal">
        <span>Contenido</span>
      </Reveal>
    );

    expect(screen.getByTestId('reveal')).toHaveAttribute('data-revealed', 'true');
  });

  it('reveals on the next frame when IntersectionObserver is unavailable', async () => {
    setIntersectionObserver(undefined);

    render(
      <Reveal data-testid="reveal">
        <span>Contenido</span>
      </Reveal>
    );

    await waitFor(() =>
      expect(screen.getByTestId('reveal')).toHaveAttribute('data-revealed', 'true')
    );
  });

  it('applies a staggered delay derived from the index', () => {
    render(
      <Reveal data-testid="reveal" index={3}>
        <span>Contenido</span>
      </Reveal>
    );

    expect(screen.getByTestId('reveal').style.getPropertyValue('--reveal-delay')).toBe('210ms');
  });

  it('caps the staggered delay so late items still animate promptly', () => {
    render(
      <Reveal data-testid="reveal" index={50}>
        <span>Contenido</span>
      </Reveal>
    );

    expect(screen.getByTestId('reveal').style.getPropertyValue('--reveal-delay')).toBe('560ms');
  });

  it('forwards custom className alongside the reveal marker', () => {
    render(
      <Reveal data-testid="reveal" className="h-full">
        <span>Contenido</span>
      </Reveal>
    );

    const el = screen.getByTestId('reveal');
    expect(el).toHaveClass('h-full');
    expect(el).toHaveAttribute('data-reveal');
  });
});
