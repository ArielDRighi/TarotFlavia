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

  it('should have admin wrapper with min-h-screen', () => {
    const { container } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('bg-bg-main');
  });

  it('should have admin indicator', () => {
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    expect(screen.getByText(/panel de administración/i)).toBeInTheDocument();
  });
});
