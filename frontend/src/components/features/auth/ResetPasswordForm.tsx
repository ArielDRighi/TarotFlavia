'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, KeyRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { apiClient } from '@/lib/api/axios-config';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { toast } from '@/hooks/utils/useToast';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth.schemas';

const EXPIRED_TOKEN_MESSAGE =
  'El enlace expiró o ya fue usado. Los enlaces valen una hora y una sola vez.';
const GENERIC_ERROR_MESSAGE = 'No pudimos restablecer tu contraseña. Intentá de nuevo más tarde.';

interface ResetPasswordFormProps {
  /** Token recibido por email (query param `token`). `null` si el enlace vino sin él. */
  token: string | null;
}

/** Enlace para volver a pedir el mail de recuperación */
function RequestNewLink() {
  return (
    <Link href="/recuperar-password" className="text-primary text-sm hover:underline">
      Solicitar un enlace nuevo
    </Link>
  );
}

/**
 * ResetPasswordForm component
 *
 * Pantalla final de la recuperación de cuenta: toma el token que llegó por email
 * y permite fijar una contraseña nueva.
 */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword: data.newPassword,
      });

      toast.success('Contraseña actualizada. Ya podés iniciar sesión.');
      router.push('/login');
    } catch (error) {
      // El backend responde 400 si el token es inválido, expiró o ya se usó
      const axiosError = error as { response?: { status?: number } };
      const isRejectedToken = axiosError.response?.status === 400;

      setSubmitError(isRejectedToken ? EXPIRED_TOKEN_MESSAGE : GENERIC_ERROR_MESSAGE);
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <Card className="shadow-soft w-full max-w-md rounded-2xl" data-testid="reset-password-form">
        <CardHeader className="text-center">
          <h1 className="text-primary font-serif text-3xl">Enlace inválido</h1>
        </CardHeader>

        <CardContent
          className="text-muted-foreground text-center text-sm"
          data-testid="reset-password-invalid-link"
        >
          <p>
            El enlace no es válido: le falta el código de recuperación. Puede que se haya cortado al
            copiarlo del email.
          </p>
        </CardContent>

        <CardFooter className="justify-center">
          <RequestNewLink />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft w-full max-w-md rounded-2xl" data-testid="reset-password-form">
      <CardHeader className="space-y-2 text-center">
        <KeyRound className="text-secondary mx-auto h-8 w-8" aria-hidden="true" />
        <h1 className="text-primary font-serif text-3xl">Nueva Contraseña</h1>
        <p className="text-muted-foreground text-sm">
          Elegí una contraseña nueva para tu cuenta. Mínimo 8 caracteres, con una mayúscula y un
          número.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {submitError && (
            <div
              className="bg-destructive/10 border-destructive/30 text-destructive space-y-2 rounded-lg border p-4 text-sm"
              role="alert"
              aria-live="polite"
            >
              <p className="font-medium">{submitError}</p>
              {submitError === EXPIRED_TOKEN_MESSAGE && <RequestNewLink />}
            </div>
          )}

          {/* New Password Field */}
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              Nueva contraseña
            </label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              disabled={isSubmitting}
              className="focus:border-primary bg-gray-50"
              {...register('newPassword')}
              aria-invalid={errors.newPassword ? 'true' : 'false'}
            />
            {errors.newPassword && (
              <p className="text-destructive text-sm">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Repetir contraseña
            </label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              disabled={isSubmitting}
              className="focus:border-primary bg-gray-50"
              {...register('confirmPassword')}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="focus-visible:ring-secondary/50 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Restableciendo...
              </>
            ) : (
              'Restablecer contraseña'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <Link href="/login" className="text-muted-foreground hover:text-primary text-sm">
          Volver a iniciar sesión
        </Link>
      </CardFooter>
    </Card>
  );
}
