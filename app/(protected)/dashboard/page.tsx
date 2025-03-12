"use client";

import { useUser } from "@/context/user-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardRedirect = () => {
  const { role, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const roleToDashboard: Record<string, string> = {
        admin: "/dashboard/admin",
        "product-manager": "/dashboard/product-manager",
        employee: "/dashboard/employee",
      };

      router.replace(role ? roleToDashboard[role] || "/dashboard/employee" : "/dashboard/employee");
    }
  }, [role, loading, router]);

  return (
    <div className="flex flex-col p-8 pt-6 space-y-4">
      {/* Dashboard Title Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 rounded-md" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-4">
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <Skeleton key={index} className="h-10 w-32 rounded-md" />
          ))}
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div key={index} className="p-4 rounded-lg border shadow-sm space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
      </div>

      {/* Main Grid Layout Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Overview Skeleton */}
        <div className="col-span-4 p-4 rounded-lg border shadow-sm space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-[300px] w-full" />
        </div>

        {/* Recent Sales Skeleton */}
        <div className="col-span-3 p-4 rounded-lg border shadow-sm space-y-4">
          <Skeleton className="h-6 w-48" />
          {Array(4)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-16 ml-auto" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardRedirect;
