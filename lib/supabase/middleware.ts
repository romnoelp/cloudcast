import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const handleAuthSession = async (
  request: NextRequest,
  supabase: ReturnType<typeof createServerClient>
) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/signin", request.nextUrl));
  }

  const role = user.user_metadata?.role;
  const path = request.nextUrl.pathname;

  console.log("Middleware: User Role:", role);
  console.log("Middleware: Request Path:", path);
  console.log("Middleware: Raw Path:", path); // Added raw path log

  if (!role) {
    console.error("User role not found in session metadata.");
    return NextResponse.redirect(new URL("/error", request.nextUrl));
  }

  // 1. Strict Equality Check with Logging
  if (role === "admin" && path === "/dashboard/admin") {
    console.log("Middleware: Admin Path Match (Exact)");
    return NextResponse.next();
  } else if (role === "product-manager" && path.startsWith("/dashboard/product-manager/")) {
    console.log("Middleware: Product Manager Path Match (StartsWith)");
    return NextResponse.next();
  } else if (role === "employee" && path.startsWith("/dashboard/employee/")) {
    console.log("Middleware: Employee Path Match (StartsWith)");
    return NextResponse.next();
  } else {
    console.log("Middleware: No Match, Redirecting to /unauthorized");
    return NextResponse.redirect(new URL("/unauthorized", request.nextUrl));
  }
};