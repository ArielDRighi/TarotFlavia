'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader } from '@/components/ui/card';
import { PlanBadge } from '@/components/ui/plan-badge';
import type { UserProfile } from '@/types';

export interface ProfileHeaderProps {
  profile: UserProfile;
}

/**
 * ProfileHeader component
 *
 * Displays user profile header with avatar, name, and plan badge
 */
export function ProfileHeader({ profile }: ProfileHeaderProps) {
  // Get user initials for avatar fallback
  // Handle edge case: filter empty strings from extra spaces
  const initials = profile.name
    .split(' ')
    .filter((n) => n.length > 0) // Filter out empty parts
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="from-primary/10 to-secondary/10 bg-gradient-to-r">
      <CardHeader className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {/* Avatar */}
          <Avatar className="size-20">
            {profile.profilePicture && (
              <AvatarImage src={profile.profilePicture} alt={profile.name} />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground font-serif text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <div className="text-center sm:text-left">
            <h1 className="font-serif text-2xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground text-sm">{profile.email}</p>
          </div>
        </div>

        {/* Plan Badge */}
        <PlanBadge plan={profile.plan} />
      </CardHeader>
    </Card>
  );
}
