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

    if (request.nextUrl.pathname === "/") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.redirect(new URL("/signin", request.nextUrl));
      }

      // Fetch user role from database
      const { data: userData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError || !userData?.role) {
        console.error("Error fetching user role:", roleError);
        return NextResponse.redirect(new URL("/error", request.nextUrl));
      }

      const role = userData.role;

      const response = NextResponse.redirect(
        new URL("/dashboard", request.nextUrl)
      );
      response.cookies.set("userRole", role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 600,
      });

      return response;
    }

    return await handleAuthSession(request, supabase);
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
