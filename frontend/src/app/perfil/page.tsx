'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileHeader } from '@/components/features/profile/ProfileHeader';
import { AccountTab } from '@/components/features/profile/AccountTab';
import { SubscriptionTab } from '@/components/features/profile/SubscriptionTab';
import { SettingsTab } from '@/components/features/profile/SettingsTab';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useProfile } from '@/hooks/api/useUser';

/**
 * Profile Page
 *
 * Protected page that displays user profile with tabs for:
 * - Account: Edit profile info and password
 * - Subscription: View plan and usage statistics
 * - Settings: Notifications, privacy, and account deletion
 */
export default function PerfilPage() {
  const { isLoading: isAuthLoading } = useRequireAuth();
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  // Show loading while checking auth or fetching profile
  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Profile should always be available after loading
  if (!profile) {
    return (
      <div className="container py-8">
        <p className="text-destructive">Error al cargar perfil</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Profile Header */}
        <ProfileHeader profile={profile} />

        {/* Tabs */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Cuenta</TabsTrigger>
            <TabsTrigger value="subscription">Suscripción</TabsTrigger>
            <TabsTrigger value="settings">Ajustes</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-6">
            <AccountTab profile={profile} />
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <SubscriptionTab profile={profile} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
