import { handleAuthSession } from "@/lib/supabase/middleware";  
import { type NextRequest, NextResponse } from "next/server";

export const middleware = async (request: NextRequest) => {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return await handleAuthSession(request);
};

export const config = {
  matcher: ["/", "/(protected)/:path*", "/admin/:path*"],
};
