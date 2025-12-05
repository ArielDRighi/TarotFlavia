'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { apiClient } from '@/lib/api/axios-config';
import { toast } from '@/hooks/utils/useToast';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth.schemas';

const COOLDOWN_SECONDS = 60;

/**
 * ForgotPasswordForm component
 *
 * A form for requesting password reset instructions via email.
 * Includes cooldown timer to prevent spam.
 */
export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const onSubmit = useCallback(async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: data.email });
    } catch {
      // Silently ignore errors for security - don't reveal if email exists
    } finally {
      setIsSubmitting(false);
      // Always show success message for security (don't reveal if email exists)
      toast.success('Email enviado. Revisa tu bandeja de entrada');
      // Start cooldown timer
      setCooldownSeconds(COOLDOWN_SECONDS);
    }
  }, []);

  const isButtonDisabled = isSubmitting || cooldownSeconds > 0;

  return (
    <Card className="shadow-soft w-full max-w-md rounded-2xl">
      <CardHeader className="text-center">
        <h1 className="text-primary font-serif text-3xl">Recuperar Contraseña</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Ingresa tu email y te enviaremos instrucciones
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              disabled={isButtonDisabled}
              className="focus:border-primary bg-gray-50"
              {...register('email')}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isButtonDisabled}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : cooldownSeconds > 0 ? (
              `Reenviar en ${cooldownSeconds} segundos`
            ) : (
              'Enviar Instrucciones'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Link href="/login" className="text-primary text-sm hover:underline">
          Volver al inicio de sesión
        </Link>
      </CardFooter>
    </Card>
  );
}
