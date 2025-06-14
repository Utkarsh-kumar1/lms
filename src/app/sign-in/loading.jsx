"use client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function ProfileFormSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center dark:bg-gray-800 bg-[url(/bgSignIn.svg)] bg-cover bg-no-repeat bg-center">
      <Card className="h-auto sm:w-[25rem] backdrop-blur-md bg-transparent p-6 space-y-6">
        <CardHeader className="flex items-center space-x-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg bg-indigo-500" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}

