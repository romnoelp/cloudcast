"use client";

import { useUser } from "@/context/user-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const { role, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const roleToDashboard: Record<string, string> = {
      admin: "/dashboard/admin",
      "product-manager": "/dashboard/product-manager",
      employee: "/dashboard/employee",
    };

    const dashboardPath = role ? roleToDashboard[role] || "/dashboard/employee" : "/dashboard/employee";
    router.replace(dashboardPath);
  }, [role, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
