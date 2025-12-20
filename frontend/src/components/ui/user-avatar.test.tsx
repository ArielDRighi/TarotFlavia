import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserAvatar } from './user-avatar';

describe('UserAvatar', () => {
  it('should render avatar component', () => {
    render(<UserAvatar src="/test-avatar.jpg" alt="John Doe" />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toBeInTheDocument();
  });

  it('should show initials fallback when no src provided', () => {
    render(<UserAvatar alt="John Doe" initials="JD" />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should apply size classes correctly', () => {
    const { rerender } = render(<UserAvatar src="/test.jpg" alt="User" size="sm" />);
    let avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveClass('size-8');

    rerender(<UserAvatar src="/test.jpg" alt="User" size="md" />);
    avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveClass('size-12');

    rerender(<UserAvatar src="/test.jpg" alt="User" size="lg" />);
    avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveClass('size-16');
  });

  it('should accept custom className', () => {
    render(<UserAvatar src="/test.jpg" alt="User" className="custom-avatar" />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveClass('custom-avatar');
  });
});
