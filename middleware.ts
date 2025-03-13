import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { handleAuthSession } from "./lib/supabase/middleware";

export const middleware = async (request: NextRequest) => {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Supabase auth error:", userError);
    }

    if (request.nextUrl.pathname === "/") {
      return user
        ? NextResponse.redirect(new URL("/dashboard", request.nextUrl))
        : NextResponse.redirect(new URL("/signin", request.nextUrl));
    }

    return await handleAuthSession(request, supabase);
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/error", request.nextUrl));
  }
};

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};