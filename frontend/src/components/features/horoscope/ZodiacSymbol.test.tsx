import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ZodiacSymbol, TEXT_PRESENTATION_SELECTOR } from './ZodiacSymbol';

describe('ZodiacSymbol', () => {
  it('should render the zodiac glyph', () => {
    render(<ZodiacSymbol symbol="♈" label="Aries" />);

    expect(screen.getByLabelText('Aries')).toHaveTextContent('♈');
  });

  it('should append the text presentation variation selector (U+FE0E)', () => {
    render(<ZodiacSymbol symbol="♈" label="Aries" />);

    const span = screen.getByLabelText('Aries');
    expect(span.textContent).toBe(`♈${TEXT_PRESENTATION_SELECTOR}`);
  });

  it('should apply the lila/primary color class', () => {
    render(<ZodiacSymbol symbol="♉" label="Tauro" />);

    expect(screen.getByLabelText('Tauro')).toHaveClass('text-primary');
  });

  it('should apply the zodiac-symbol utility class (font-variant-emoji: text)', () => {
    render(<ZodiacSymbol symbol="♊" label="Géminis" />);

    expect(screen.getByLabelText('Géminis')).toHaveClass('zodiac-symbol');
  });

  it('should have role="img"', () => {
    render(<ZodiacSymbol symbol="♋" label="Cáncer" />);

    expect(screen.getByRole('img', { name: 'Cáncer' })).toBeInTheDocument();
  });

  it('should merge additional className', () => {
    render(<ZodiacSymbol symbol="♌" label="Leo" className="text-6xl" />);

    const span = screen.getByLabelText('Leo');
    expect(span).toHaveClass('text-6xl');
    expect(span).toHaveClass('text-primary');
  });
});
