import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminLayout from './layout';

describe('AdminLayout', () => {
  it('should render children', () => {
    render(
      <AdminLayout>
        <div data-testid="child-content">Child Content</div>
      </AdminLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should render admin indicator banner', () => {
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    expect(screen.getByText(/panel de administración/i)).toBeInTheDocument();
  });

  it('should have admin banner with correct styling', () => {
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    const banner = screen.getByText(/panel de administración/i);
    expect(banner).toHaveClass('bg-primary/10');
    expect(banner).toHaveClass('text-primary');
    expect(banner).toHaveClass('text-center');
    expect(banner).toHaveClass('font-medium');
  });

  it('should not add redundant wrapper (uses fragment)', () => {
    const { container } = render(
      <AdminLayout>
        <div data-testid="child">Content</div>
      </AdminLayout>
    );

    // El primer hijo debe ser el banner, no un wrapper div
    const firstChild = container.firstChild as HTMLElement;
    expect(firstChild.tagName).toBe('DIV');
    expect(firstChild).toHaveClass('bg-primary/10');
  });
});
