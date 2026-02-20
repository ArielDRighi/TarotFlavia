import { Skeleton } from '@/components/ui/skeleton';

export default function BirthChartLoading() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-10 w-64" />
          <Skeleton className="mx-auto h-4 w-96" />
        </div>

        {/* Form skeleton */}
        <div className="mt-8 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
