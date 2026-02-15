import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function SavedChartLoading() {
  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      {/* Header skeleton */}
      <header className="bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Skeleton className="h-9 w-32" data-testid="skeleton-breadcrumb" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20" data-testid="skeleton-badge" />
            <Skeleton className="h-9 w-20" data-testid="skeleton-pdf-button" />
            <Skeleton className="h-9 w-9" data-testid="skeleton-menu-button" />
          </div>
        </div>
      </header>

      <main className="container max-w-6xl px-4 py-8">
        {/* Title skeleton */}
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto mb-2 h-9 w-64" data-testid="skeleton-title" />
          <Skeleton className="mx-auto h-5 w-48" data-testid="skeleton-date" />
        </div>

        {/* Grid skeleton */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Chart wheel card skeleton */}
          <Card data-testid="skeleton-chart-card">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mx-auto aspect-square w-full max-w-md rounded-full" />
            </CardContent>
          </Card>

          {/* Big Three card skeleton */}
          <Card data-testid="skeleton-bigthree-card">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs skeleton */}
        <div className="mb-8" data-testid="skeleton-tabs">
          <div className="mb-4 flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Card>
            <CardContent className="py-12">
              <Skeleton className="mx-auto h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
