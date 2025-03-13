import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const handleAuthSession = async (
  request: NextRequest,
  supabase: ReturnType<typeof createServerClient>
) => {
  const supabaseResponse = NextResponse.next({ request });

  const roleCookie = request.cookies.get("userRole")?.value;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/signin", request.nextUrl));
  }

  if (roleCookie) {
    if (roleCookie === "admin" && request.nextUrl.pathname.startsWith("/dashboard/admin")) {
      return supabaseResponse;
    } else if (roleCookie === "product-manager" && request.nextUrl.pathname.startsWith("/dashboard/product-manager")) {
      return supabaseResponse;
    } else if (roleCookie === "employee" && request.nextUrl.pathname.startsWith("/dashboard/employee")) {
      return supabaseResponse;
    } else {
      return NextResponse.redirect(new URL("/unauthorized", request.nextUrl));
    }
  } else {
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !userData?.role) {
      return NextResponse.redirect(new URL("/error", request.nextUrl));
    }

    const role = userData.role;
    const roleToDashboard: Record<string, string> = {
      admin: "/dashboard/admin",
      "product-manager": "/dashboard/product-manager",
      employee: "/dashboard/employee",
    };

    const targetPath = roleToDashboard[role] || "/dashboard/employee";
    const response = NextResponse.redirect(
      new URL(targetPath, request.nextUrl)
    );
    response.cookies.set("userRole", role);
    return response;
  }
};