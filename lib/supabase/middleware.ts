import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Supabase auth error:", userError);
    return NextResponse.redirect(new URL("/signin", request.nextUrl));
  }

  const allowedPaths = ["/signin", "/auth"];
  if (
    !user &&
    !allowedPaths.some((path) => request.nextUrl.pathname.startsWith(path))
  ) {
    const url = new URL("/signin", request.nextUrl);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname.startsWith("/signin")) {
    // Fetch user role from Supabase
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError) {
      console.error("Error fetching user role:", roleError);
    }

    const role = userData?.role || "employee";

    // Role-based dashboard paths
    const roleToDashboard: Record<string, string> = {
      admin: "/dashboard/admin",
      "product-manager": "/dashboard/product-manager",
      employee: "/dashboard/employee",
    };

    const dashboardPath = roleToDashboard[role] || "/dashboard/employee";

    return NextResponse.redirect(new URL(dashboardPath, request.nextUrl));
  }

  if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError) {
      console.error("Error fetching user role:", roleError);
    }

    const role = userData?.role || "employee";

    const roleToDashboard: Record<string, string> = {
      admin: "/dashboard/admin",
      "product-manager": "/dashboard/product-manager",
      employee: "/dashboard/employee",
    };
    const dashboardPath = roleToDashboard[role] || "/dashboard/employee";
    if (request.nextUrl.pathname !== dashboardPath) {
      return NextResponse.redirect(new URL(dashboardPath, request.nextUrl));
    }
  }

  return supabaseResponse;
};