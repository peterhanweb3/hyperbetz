import { Skeleton } from "@/components/ui/skeleton";

/**
 * A dedicated skeleton loader that perfectly mimics the structure of the QueryPageLayout.
 * This is used as a fallback for Suspense, providing an excellent loading experience.
 */
export const QueryPageSkeleton = () => {
  return (
    <div className="container mx-auto py-8 flex flex-col gap-8">
      {/* Skeleton for the Filter Sidebar */}

      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-lg" />
        {/* <Skeleton className="h-8 w-1/3" /> */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Skeleton for the Main Content */}

      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="w-full aspect-[4.5/5] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};
