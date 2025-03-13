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

    const response = await handleAuthSession(request, supabase);

    if (request.nextUrl.pathname !== "/") {
      return response;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/signin", request.nextUrl));
    }

    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(
      new URL(
        `/error?message=${encodeURIComponent(String(error))}`,
        request.nextUrl
      )
    );
  }
};

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
