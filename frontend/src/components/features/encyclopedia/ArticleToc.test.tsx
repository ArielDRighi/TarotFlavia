import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ArticleToc } from './ArticleToc';
import type { ArticleHeading } from '@/lib/utils/text';

// ─── Controllable IntersectionObserver ──────────────────────────────────────────
// The global setup mocks IntersectionObserver as a no-op. Here we replace it with
// a controllable stub that records each instance + its callback, so we can drive
// the scroll-spy behaviour deterministically.

interface ObserverInstance {
  callback: IntersectionObserverCallback;
  elements: Element[];
}

let observers: ObserverInstance[] = [];

class ControllableIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observers.push(this);
  }

  observe(el: Element) {
    this.elements.push(el);
  }

  unobserve(el: Element) {
    this.elements = this.elements.filter((e) => e !== el);
  }

  disconnect() {
    this.elements = [];
  }
}

/** Fires the latest observer's callback with the given visibility entries. */
function fireIntersection(entries: Array<{ id: string; isIntersecting: boolean; top: number }>) {
  const observer = observers[observers.length - 1];
  const observerEntries = entries.map(({ id, isIntersecting, top }) => ({
    target: document.getElementById(id) as Element,
    isIntersecting,
    boundingClientRect: { top } as DOMRectReadOnly,
  })) as unknown as IntersectionObserverEntry[];
  act(() => {
    observer.callback(observerEntries, observer as unknown as IntersectionObserver);
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

const HEADINGS: ArticleHeading[] = [
  { id: 'seccion-1', number: 1, label: '¿Qué es el Tarot?' },
  { id: 'seccion-2', number: 2, label: 'Los Arcanos Mayores' },
  { id: 'seccion-3', number: 3, label: 'Las Tiradas' },
];

/** Renders the TOC alongside matching heading anchors so the observer can attach. */
function renderWithAnchors(headings: ArticleHeading[] = HEADINGS) {
  return render(
    <>
      {headings.map((h) => (
        <h2 key={h.id} id={h.id}>
          {h.label}
        </h2>
      ))}
      <ArticleToc headings={headings} />
    </>
  );
}

/** The desktop variant of the TOC (always-visible sidebar list). */
function desktopToc() {
  return within(screen.getByTestId('article-toc-desktop'));
}

describe('ArticleToc', () => {
  const originalObserver = window.IntersectionObserver;

  beforeEach(() => {
    observers = [];
    // The global setup defines IntersectionObserver as `writable` (no-op), so we
    // assign our controllable stub directly and restore it afterwards.
    window.IntersectionObserver =
      ControllableIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    window.IntersectionObserver = originalObserver;
  });

  describe('Rendering', () => {
    it('should render the TOC nav with an accessible label', () => {
      renderWithAnchors();

      const toc = screen.getByTestId('article-toc');
      expect(toc).toBeInTheDocument();
      expect(toc.tagName).toBe('NAV');
      expect(toc).toHaveAttribute('aria-label', 'En esta guía');
    });

    it('should render one link per heading pointing to its anchor', () => {
      renderWithAnchors();

      const links = desktopToc().getAllByRole('link');
      expect(links).toHaveLength(3);
      expect(links[0]).toHaveAttribute('href', '#seccion-1');
      expect(links[1]).toHaveAttribute('href', '#seccion-2');
      expect(links[2]).toHaveAttribute('href', '#seccion-3');
    });

    it('should render each heading label', () => {
      renderWithAnchors();

      expect(desktopToc().getByRole('link', { name: /¿Qué es el Tarot\?/ })).toBeInTheDocument();
      expect(desktopToc().getByRole('link', { name: /Los Arcanos Mayores/ })).toBeInTheDocument();
      expect(desktopToc().getByRole('link', { name: /Las Tiradas/ })).toBeInTheDocument();
    });

    it('should render a collapsible variant for mobile', () => {
      renderWithAnchors();

      const mobile = screen.getByTestId('article-toc-mobile');
      expect(mobile.tagName).toBe('DETAILS');
      expect(within(mobile).getByText('En esta guía')).toBeInTheDocument();
    });

    it('should render nothing when there are no headings', () => {
      const { container } = render(<ArticleToc headings={[]} />);

      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByTestId('article-toc')).not.toBeInTheDocument();
    });
  });

  describe('Active section (scroll-spy)', () => {
    it('should mark the first section active initially', () => {
      renderWithAnchors();

      expect(desktopToc().getByRole('link', { name: /¿Qué es el Tarot\?/ })).toHaveAttribute(
        'aria-current',
        'location'
      );
    });

    it('should highlight the section that intersects the viewport', () => {
      renderWithAnchors();

      fireIntersection([{ id: 'seccion-2', isIntersecting: true, top: 40 }]);

      expect(desktopToc().getByRole('link', { name: /Los Arcanos Mayores/ })).toHaveAttribute(
        'aria-current',
        'location'
      );
      expect(desktopToc().getByRole('link', { name: /¿Qué es el Tarot\?/ })).not.toHaveAttribute(
        'aria-current'
      );
    });

    it('should pick the topmost section when several intersect at once', () => {
      renderWithAnchors();

      fireIntersection([
        { id: 'seccion-3', isIntersecting: true, top: 220 },
        { id: 'seccion-2', isIntersecting: true, top: 60 },
      ]);

      expect(desktopToc().getByRole('link', { name: /Los Arcanos Mayores/ })).toHaveAttribute(
        'aria-current',
        'location'
      );
    });

    it('should keep the last active section when none intersect', () => {
      renderWithAnchors();

      fireIntersection([{ id: 'seccion-2', isIntersecting: true, top: 40 }]);
      fireIntersection([{ id: 'seccion-2', isIntersecting: false, top: -10 }]);

      expect(desktopToc().getByRole('link', { name: /Los Arcanos Mayores/ })).toHaveAttribute(
        'aria-current',
        'location'
      );
    });

    it('should reset the active section to the first when the headings change', () => {
      const { rerender } = renderWithAnchors();

      // Scroll-spy moves the active section away from the first…
      fireIntersection([{ id: 'seccion-2', isIntersecting: true, top: 40 }]);
      expect(desktopToc().getByRole('link', { name: /Los Arcanos Mayores/ })).toHaveAttribute(
        'aria-current',
        'location'
      );

      // …then navigating to another guide (same component instance, new headings)
      // resets the highlight to the new article's first section.
      const otherHeadings: ArticleHeading[] = [
        { id: 'seccion-1', number: 1, label: 'Introducción a los Rituales' },
        { id: 'seccion-2', number: 2, label: 'Herramientas' },
      ];
      rerender(
        <>
          {otherHeadings.map((h) => (
            <h2 key={h.id} id={h.id}>
              {h.label}
            </h2>
          ))}
          <ArticleToc headings={otherHeadings} />
        </>
      );

      expect(
        desktopToc().getByRole('link', { name: /Introducción a los Rituales/ })
      ).toHaveAttribute('aria-current', 'location');
    });

    it('should mark a section active when its link is clicked', async () => {
      const user = userEvent.setup();
      renderWithAnchors();

      await user.click(desktopToc().getByRole('link', { name: /Las Tiradas/ }));

      expect(desktopToc().getByRole('link', { name: /Las Tiradas/ })).toHaveAttribute(
        'aria-current',
        'location'
      );
    });
  });

  describe('Accesibilidad (foco visible / teclado)', () => {
    it('should give every TOC link a visible keyboard focus ring', () => {
      renderWithAnchors();

      const links = desktopToc().getAllByRole('link');
      expect(links).toHaveLength(3);
      links.forEach((link) => {
        expect(link.className).toMatch(/focus-visible:ring/);
      });
    });

    it('should give the mobile collapsible summary a visible focus ring', () => {
      renderWithAnchors();

      const mobile = screen.getByTestId('article-toc-mobile');
      const summary = mobile.querySelector('summary');
      expect(summary).not.toBeNull();
      expect(summary?.className).toMatch(/focus-visible:ring/);
    });

    it('should keep TOC links reachable by keyboard (native anchors)', async () => {
      const user = userEvent.setup();
      renderWithAnchors();

      const secondLink = desktopToc().getByRole('link', { name: /Los Arcanos Mayores/ });
      secondLink.focus();
      expect(secondLink).toHaveFocus();

      // Activar con teclado (Enter) marca esa sección como activa.
      await user.keyboard('{Enter}');
      expect(secondLink).toHaveAttribute('aria-current', 'location');
    });
  });
});
