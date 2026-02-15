import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ResultLoading() {
  return (
    <div className="container max-w-6xl py-8">
      {/* Header skeleton */}
      <div className="mb-8 text-center">
        <Skeleton className="mx-auto mb-2 h-8 w-64" />
        <Skeleton className="mx-auto h-4 w-96" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart skeleton */}
        <Card>
          <CardContent className="p-6">
            <Skeleton className="mx-auto aspect-square w-full max-w-md rounded-full" />
          </CardContent>
        </Card>

        {/* Big Three skeleton */}
        <Card>
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

      {/* Tables skeleton */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
