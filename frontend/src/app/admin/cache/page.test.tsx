/**
 * Tests for Cache Management Page
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CachePage from './page';

// Mock del componente CacheManagementContent
vi.mock('@/components/features/admin/CacheManagementContent', () => ({
  CacheManagementContent: () => <div data-testid="cache-management-content">Content</div>,
}));

describe('CachePage', () => {
  it('should render page title', () => {
    // Act
    render(<CachePage />);

    // Assert
    expect(screen.getByText('Gestión de Caché')).toBeInTheDocument();
  });

  it('should render page description', () => {
    // Act
    render(<CachePage />);

    // Assert
    expect(
      screen.getByText(/Monitoreo de estadísticas de caché y control de invalidación manual/i)
    ).toBeInTheDocument();
  });

  it('should render CacheManagementContent component', () => {
    // Act
    render(<CachePage />);

    // Assert
    expect(screen.getByTestId('cache-management-content')).toBeInTheDocument();
  });
});
