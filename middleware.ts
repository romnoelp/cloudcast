import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest } from "next/server";

export const middleware = async (request: NextRequest) => await updateSession(request);

export const config = {
  matcher: ["/", "/protected/:path*", "/admin/:path*"],
};
