import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import TarotLayout from './layout';

describe('TarotLayout', () => {
  it('should render children', () => {
    render(
      <TarotLayout>
        <div data-testid="child-content">Test Content</div>
      </TarotLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should pass through children without modification', () => {
    render(
      <TarotLayout>
        <span className="test-class">Multiple</span>
        <span>Children</span>
      </TarotLayout>
    );

    expect(screen.getByText('Multiple')).toHaveClass('test-class');
    expect(screen.getByText('Children')).toBeInTheDocument();
  });
});
