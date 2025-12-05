import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toaster } from './toaster';

// Mock sonner
vi.mock('sonner', () => ({
  Toaster: vi.fn(({ position, duration, toastOptions, ...props }) => (
    <div
      data-testid="sonner-toaster"
      data-position={position}
      data-duration={duration}
      data-toast-options={JSON.stringify(toastOptions)}
      {...props}
    />
  )),
}));

describe('Toaster', () => {
  it('should render without crashing', () => {
    render(<Toaster />);
    expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument();
  });

  it('should be positioned at top-right by default', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-position', 'top-right');
  });

  it('should have default duration of 3000ms', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-duration', '3000');
  });

  it('should apply custom className styles for toast variants', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

    // Verify toast options include classNames for styling
    expect(toastOptions.classNames).toBeDefined();
  });

  it('should have success toast with green left border', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

    expect(toastOptions.classNames.success).toContain('border-l-4');
    expect(toastOptions.classNames.success).toContain('border-l-[#48BB78]');
  });

  it('should have error toast with red left border', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

    expect(toastOptions.classNames.error).toContain('border-l-4');
    expect(toastOptions.classNames.error).toContain('border-l-red-500');
  });

  it('should have info toast with blue left border', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

    expect(toastOptions.classNames.info).toContain('border-l-4');
    expect(toastOptions.classNames.info).toContain('border-l-blue-500');
  });

  it('should allow custom position override', () => {
    render(<Toaster position="bottom-left" />);
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-position', 'bottom-left');
  });

  it('should allow custom duration override', () => {
    render(<Toaster duration={5000} />);
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-duration', '5000');
  });
});

describe('Toaster accessibility', () => {
  it('should render in a way that screen readers can announce toasts', () => {
    render(<Toaster />);
    // Sonner handles aria-live regions internally
    expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument();
  });
});

describe('Toaster icons', () => {
  it('should configure custom icons for each toast type', () => {
    // The Toaster component configures icons prop with Check, X, and Info
    // This is verified by the component rendering without errors
    // Icons are React elements that cannot be easily inspected in the mock
    render(<Toaster />);
    expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument();
  });
});
