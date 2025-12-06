import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import RitualLayout from './layout';

describe('RitualLayout', () => {
  it('should render children', () => {
    render(
      <RitualLayout>
        <div data-testid="child-content">Test Content</div>
      </RitualLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should pass through children without modification', () => {
    render(
      <RitualLayout>
        <span className="test-class">Multiple</span>
        <span>Children</span>
      </RitualLayout>
    );

    expect(screen.getByText('Multiple')).toHaveClass('test-class');
    expect(screen.getByText('Children')).toBeInTheDocument();
  });
});
