'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateProfile, useUpdatePassword } from '@/hooks/api/useUser';
import {
  updateProfileSchema,
  updatePasswordSchema,
  type UpdateProfileFormData,
  type UpdatePasswordFormData,
} from '@/lib/validations/profile.schemas';
import type { UserProfile } from '@/types';

export interface AccountTabProps {
  profile: UserProfile;
}

/**
 * AccountTab component
 *
 * Displays forms to update profile info and password
 */
export function AccountTab({ profile }: AccountTabProps) {
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutate: updatePassword, isPending: isUpdatingPassword } = useUpdatePassword();

  // Profile form
  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      birthDate: profile.birthDate || '',
    },
  });

  // Password form
  const passwordForm = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = (data: UpdateProfileFormData) => {
    // Send birthDate as null if empty string, or as the value if provided
    const payload = {
      ...data,
      birthDate: data.birthDate || null,
    };
    updateProfile(payload, {
      onSuccess: () => {
        profileForm.reset({ name: data.name, email: data.email, birthDate: data.birthDate || '' });
      },
    });
  };

  const onPasswordSubmit = (data: UpdatePasswordFormData) => {
    updatePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          passwordForm.reset();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Profile Info Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre
              </label>
              <Input
                id="name"
                {...profileForm.register('name')}
                disabled={isUpdatingProfile}
                aria-invalid={profileForm.formState.errors.name ? 'true' : 'false'}
              />
              {profileForm.formState.errors.name && (
                <p className="text-destructive text-sm">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field (readonly) */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                {...profileForm.register('email')}
                disabled
                readOnly
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-muted-foreground text-xs">El email no puede ser modificado</p>
            </div>

            {/* Birth Date Field */}
            <div className="space-y-2">
              <label htmlFor="birthDate" className="text-sm font-medium">
                Fecha de Nacimiento
              </label>
              <Input
                id="birthDate"
                type="date"
                {...profileForm.register('birthDate')}
                disabled={isUpdatingProfile}
                aria-invalid={profileForm.formState.errors.birthDate ? 'true' : 'false'}
              />
              {profileForm.formState.errors.birthDate && (
                <p className="text-destructive text-sm">
                  {profileForm.formState.errors.birthDate.message}
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                Tu signo zodiacal se calculará automáticamente para personalizar tu horóscopo
              </p>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Form */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Contraseña Actual
              </label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...passwordForm.register('currentPassword')}
                disabled={isUpdatingPassword}
                aria-invalid={passwordForm.formState.errors.currentPassword ? 'true' : 'false'}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-destructive text-sm">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                Nueva Contraseña
              </label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register('newPassword')}
                disabled={isUpdatingPassword}
                aria-invalid={passwordForm.formState.errors.newPassword ? 'true' : 'false'}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-destructive text-sm">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Nueva Contraseña
              </label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register('confirmPassword')}
                disabled={isUpdatingPassword}
                aria-invalid={passwordForm.formState.errors.confirmPassword ? 'true' : 'false'}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-destructive text-sm">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar contraseña'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
