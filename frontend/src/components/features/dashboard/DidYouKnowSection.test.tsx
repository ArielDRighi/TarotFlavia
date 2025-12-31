import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DidYouKnowSection } from './DidYouKnowSection';

describe('DidYouKnowSection', () => {
  beforeEach(() => {
    // Reset Math.random() for consistent testing
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display section title', () => {
    render(<DidYouKnowSection />);

    expect(screen.getByText('¿Sabías que...?')).toBeInTheDocument();
  });

  it('should display a tarot fact', () => {
    render(<DidYouKnowSection />);

    // Should contain some text (the fact)
    const factElement = screen.getByTestId('tarot-fact');
    expect(factElement).toBeInTheDocument();
    expect(factElement.textContent).toBeTruthy();
  });

  it('should display different facts on different renders', () => {
    // First render with random = 0.1
    const { unmount } = render(<DidYouKnowSection />);
    const firstFact = screen.getByTestId('tarot-fact').textContent;
    unmount();

    // Second render with random = 0.9
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    render(<DidYouKnowSection />);
    const secondFact = screen.getByTestId('tarot-fact').textContent;

    // Facts should be different
    expect(firstFact).not.toBe(secondFact);
  });

  it('should have decorative icon', () => {
    render(<DidYouKnowSection />);

    // Check for Lightbulb icon (lucide-react)
    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it('should have appropriate styling', () => {
    render(<DidYouKnowSection />);

    const sectionTitle = screen.getByText('¿Sabías que...?');
    expect(sectionTitle).toHaveClass('font-serif');
  });

  it('should render as a card component', () => {
    const { container } = render(<DidYouKnowSection />);

    // Should use Card component (check for card-related classes)
    const cardElement = container.querySelector('[class*="border"]');
    expect(cardElement).toBeInTheDocument();
  });
});
