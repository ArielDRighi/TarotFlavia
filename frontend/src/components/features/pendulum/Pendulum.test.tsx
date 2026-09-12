import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Pendulum } from './Pendulum';

describe('Pendulum', () => {
  it('should render pendulum structure', () => {
    render(<Pendulum movement="idle" />);

    // El componente debe tener una estructura básica
    const container = screen.getByTestId('pendulum');
    expect(container).toBeInTheDocument();
  });

  it('should apply idle animation class when movement is idle', () => {
    render(<Pendulum movement="idle" />);

    const animatedElement = screen.getByTestId('pendulum-animated');
    expect(animatedElement).toHaveClass('animate-pendulum-idle');
  });

  it('should apply searching animation class when movement is searching', () => {
    render(<Pendulum movement="searching" />);

    const animatedElement = screen.getByTestId('pendulum-animated');
    expect(animatedElement).toHaveClass('animate-pendulum-search');
  });

  it('should apply vertical animation class when movement is vertical', () => {
    render(<Pendulum movement="vertical" />);

    const animatedElement = screen.getByTestId('pendulum-animated');
    expect(animatedElement).toHaveClass('animate-pendulum-vertical');
  });

  it('should apply horizontal animation class when movement is horizontal', () => {
    render(<Pendulum movement="horizontal" />);

    const animatedElement = screen.getByTestId('pendulum-animated');
    expect(animatedElement).toHaveClass('animate-pendulum-horizontal');
  });

  it('should apply circular animation class when movement is circular', () => {
    render(<Pendulum movement="circular" />);

    const animatedElement = screen.getByTestId('pendulum-animated');
    expect(animatedElement).toHaveClass('animate-pendulum-circular');
  });

  it('should apply glow effect when isGlowing is true', () => {
    render(<Pendulum movement="idle" isGlowing={true} />);

    const crystal = screen.getByTestId('pendulum-crystal');
    expect(crystal).toHaveClass('animate-pulse');
  });

  it('should not apply glow effect when isGlowing is false', () => {
    render(<Pendulum movement="idle" isGlowing={false} />);

    const crystal = screen.getByTestId('pendulum-crystal');
    expect(crystal).not.toHaveClass('animate-pulse');
  });

  describe('crystal contrast (T-SEO-021)', () => {
    it('should render the crystal facet with a saturated amethyst gradient', () => {
      render(<Pendulum movement="idle" />);

      const facet = screen.getByTestId('pendulum-crystal-facet');
      expect(facet).toHaveClass('from-violet-400', 'via-purple-600', 'to-purple-900');
      expect(facet).not.toHaveClass('from-white/90', 'via-purple-100/80', 'to-purple-200/70');
      expect(facet).toHaveStyle({
        clipPath: 'polygon(20% 0%, 80% 0%, 100% 30%, 50% 100%, 0% 30%)',
      });
    });

    it('should cast the shadow from the wrapper so the clip-path does not cut it', () => {
      render(<Pendulum movement="idle" />);

      const crystal = screen.getByTestId('pendulum-crystal');
      const facet = screen.getByTestId('pendulum-crystal-facet');
      expect(crystal.className).toMatch(/drop-shadow/);
      expect(facet.className).not.toMatch(/shadow/);
      expect(crystal).toContainElement(facet);
    });

    it('should render a metal cap between the chain and the crystal', () => {
      render(<Pendulum movement="idle" />);

      expect(screen.getByTestId('pendulum-crystal-cap')).toBeInTheDocument();
    });

    it('should render a halo behind the crystal only when glowing', () => {
      const { rerender } = render(<Pendulum movement="idle" isGlowing={false} />);
      expect(screen.queryByTestId('pendulum-crystal-halo')).not.toBeInTheDocument();

      rerender(<Pendulum movement="vertical" isGlowing={true} />);
      const halo = screen.getByTestId('pendulum-crystal-halo');
      expect(halo).toBeInTheDocument();
      expect(halo).toHaveClass('blur-md');
      expect(halo).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('should apply custom className when provided', () => {
    render(<Pendulum movement="idle" className="custom-class" />);

    const container = screen.getByTestId('pendulum');
    expect(container).toHaveClass('custom-class');
  });
});
