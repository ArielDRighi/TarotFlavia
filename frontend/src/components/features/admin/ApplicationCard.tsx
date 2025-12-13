/**
 * ApplicationCard Component
 *
 * Card para mostrar una aplicación de tarotista pendiente
 */

'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
import type { TarotistaApplication } from '@/types/admin-tarotistas.types';

interface ApplicationCardProps {
  application: TarotistaApplication;
  onApprove: (application: TarotistaApplication) => void;
  onReject: (application: TarotistaApplication) => void;
  isLoading?: boolean;
}

export function ApplicationCard({
  application,
  onApprove,
  onReject,
  isLoading = false,
}: ApplicationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{application.nombrePublico}</CardTitle>
            <div className="mt-2 space-y-1">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{application.user?.name}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>{application.user?.email}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Aplicó: {formatDate(application.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Especialidades */}
        {application.especialidades.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold">Especialidades:</p>
            <div className="flex flex-wrap gap-2">
              {application.especialidades.map((especialidad) => (
                <Badge key={especialidad} variant="secondary">
                  {especialidad}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Biografía */}
        <div>
          <p className="mb-1 text-sm font-semibold">Biografía:</p>
          <p className="text-muted-foreground text-sm">{application.biografia}</p>
        </div>

        {/* Motivación */}
        <div>
          <p className="mb-1 text-sm font-semibold">Motivación:</p>
          <p className="text-muted-foreground text-sm">{application.motivacion}</p>
        </div>

        {/* Experiencia */}
        <div>
          <p className="mb-1 text-sm font-semibold">Experiencia:</p>
          <p className="text-muted-foreground text-sm">{application.experiencia}</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          onClick={() => onApprove(application)}
          disabled={isLoading}
          variant="default"
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Aprobar
        </Button>
        <Button
          onClick={() => onReject(application)}
          disabled={isLoading}
          variant="destructive"
          className="flex-1"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Rechazar
        </Button>
      </CardFooter>
    </Card>
  );
}
