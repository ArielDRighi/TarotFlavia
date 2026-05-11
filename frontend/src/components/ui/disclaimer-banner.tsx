import { Info } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Alert, AlertDescription } from './alert';

interface DisclaimerBannerProps {
  message: string;
  className?: string;
}

export function DisclaimerBanner({ message, className }: DisclaimerBannerProps) {
  return (
    <Alert variant="info" className={cn(className)} data-testid="disclaimer-banner">
      <Info />
      <AlertDescription>
        <strong>Nota:</strong> {message}
      </AlertDescription>
    </Alert>
  );
}
