/**
 * Tests for Chinese Horoscope Admin Page
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChineseHoroscopeAdminPage from './page';

vi.mock('@/components/features/admin/ChineseHoroscopeAdminPanel', () => ({
  ChineseHoroscopeAdminPanel: () => <div data-testid="chinese-horoscope-admin-panel">Panel</div>,
}));

describe('ChineseHoroscopeAdminPage', () => {
  it('should render page title', () => {
    render(<ChineseHoroscopeAdminPage />);
    expect(screen.getByText('Horóscopo Chino — Admin')).toBeInTheDocument();
  });

  it('should render page description', () => {
    render(<ChineseHoroscopeAdminPage />);
    expect(screen.getByText(/Estado de generación de horóscopos chinos/i)).toBeInTheDocument();
  });

  it('should render ChineseHoroscopeAdminPanel component', () => {
    render(<ChineseHoroscopeAdminPage />);
    expect(screen.getByTestId('chinese-horoscope-admin-panel')).toBeInTheDocument();
  });
});
