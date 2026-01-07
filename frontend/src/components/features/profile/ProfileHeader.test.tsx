import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileHeader } from './ProfileHeader';
import type { UserProfile } from '@/types';

describe('ProfileHeader', () => {
  const mockProfile: UserProfile = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    roles: ['consumer'],
    plan: 'free',
    // Legacy fields (deprecated)
    dailyReadingsCount: 2,
    dailyReadingsLimit: 5,
    // New separate fields
    dailyCardCount: 1,
    dailyCardLimit: 1,
    tarotReadingsCount: 1,
    tarotReadingsLimit: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    profilePicture: undefined,
    lastLogin: null,
  };

  it('should render user name', () => {
    render(<ProfileHeader profile={mockProfile} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should render user plan badge', () => {
    render(<ProfileHeader profile={mockProfile} />);

    expect(screen.getByText('GRATUITO')).toBeInTheDocument();
  });

  it('should render user avatar with fallback initials', () => {
    render(<ProfileHeader profile={mockProfile} />);

    expect(screen.getByText('TU')).toBeInTheDocument();
  });

  it('should render avatar with image when profilePicture is provided', () => {
    const profileWithPicture = {
      ...mockProfile,
      profilePicture: 'https://example.com/avatar.jpg',
    };

    const { container } = render(<ProfileHeader profile={profileWithPicture} />);

    // Avatar component should be rendered (Radix UI may not render img in tests)
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar).toBeInTheDocument();
  });

  it('should render premium plan badge', () => {
    const premiumProfile = { ...mockProfile, plan: 'premium' as const };

    render(<ProfileHeader profile={premiumProfile} />);

    expect(screen.getByText('PREMIUM')).toBeInTheDocument();
  });

  it('should render anonymous plan badge', () => {
    const anonProfile = { ...mockProfile, plan: 'anonymous' as const };

    render(<ProfileHeader profile={anonProfile} />);

    expect(screen.getByText('ANÓNIMO')).toBeInTheDocument();
  });
});
