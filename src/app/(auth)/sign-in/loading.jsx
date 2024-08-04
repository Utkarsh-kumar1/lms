// components/SkeletonFallbackSignIn.js
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonFallbackSignIn() {
  return (
    <div className="mt-5 sm:w-[25rem] p-4 border rounded-lg shadow-lg bg-white space-y-4">
      <Skeleton className="h-10 w-24 mb-4" />
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-24 bg-indigo-500" />
    </div>
  );
}
