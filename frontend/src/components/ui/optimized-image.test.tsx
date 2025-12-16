import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OptimizedImage } from './optimized-image';

describe('OptimizedImage', () => {
  it('should render with required props', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test image" width={100} height={100} />);

    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
  });

  it('should apply priority attribute for above-the-fold images', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test image" width={100} height={100} priority />);

    const img = screen.getByAltText('Test image');
    // Next.js Image with priority disables lazy loading
    expect(img).not.toHaveAttribute('loading', 'lazy');
  });

  it('should use lazy loading by default', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test image" width={100} height={100} />);

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('should accept custom className', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
        className="custom-class"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img.parentElement).toHaveClass('custom-class');
  });

  it('should handle placeholder blur data URL', () => {
    const blurDataURL = 'data:image/jpeg;base64,test';
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
        placeholder="blur"
        blurDataURL={blurDataURL}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
  });
});
