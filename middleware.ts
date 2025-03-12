import { handleAuthSession } from "@/lib/supabase/middleware";  
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const middleware = async (request: NextRequest) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (request.nextUrl.pathname === "/") {
    return user 
      ? NextResponse.redirect(new URL("/dashboard", request.nextUrl)) 
      : NextResponse.redirect(new URL("/signin", request.nextUrl));
  }

  return await handleAuthSession(request);
};

export const config = {
  matcher: ["/", "/(protected)/:path*", "/admin/:path*"],
};
