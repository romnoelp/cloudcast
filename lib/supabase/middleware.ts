import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const handleAuthSession = async (request: NextRequest) => { 
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

  if (userError || !user) {
    return NextResponse.redirect(new URL("/signin", request.nextUrl));
  }

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

  if (request.nextUrl.pathname === "/dashboard") {
    return NextResponse.redirect(new URL(roleToDashboard[role] || "/dashboard/employee", request.nextUrl));
  }

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (request.nextUrl.pathname !== roleToDashboard[role]) {
      return NextResponse.redirect(new URL(roleToDashboard[role], request.nextUrl));
    }
  }

  return supabaseResponse;
};
