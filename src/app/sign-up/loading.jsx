// components/SkeletonFallback.js
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonFallback() {
  return (
    <div className="mt-5 sm:w-[30rem] w-[18rem] p-4 border rounded-lg shadow-lg bg-white space-y-4 md:space-y-6">
      <Skeleton className="h-10 w-24" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-20 bg-indigo-500" />
    </div>
  );
}
