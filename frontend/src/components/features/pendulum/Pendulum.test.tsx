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

  it('should apply custom className when provided', () => {
    render(<Pendulum movement="idle" className="custom-class" />);

    const container = screen.getByTestId('pendulum');
    expect(container).toHaveClass('custom-class');
  });
});
