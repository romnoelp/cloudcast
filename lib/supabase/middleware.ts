import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { roleToLinks } from "@/types/navigation";

export const handleAuthSession = async (
  request: NextRequest,
  supabase: ReturnType<typeof createServerClient>
) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log("Middleware: User or userError - Redirecting to /signin");
    return NextResponse.redirect(new URL("/signin", request.nextUrl));
  }

  const role = request.cookies.get("userRole")?.value;
  const path = request.nextUrl.pathname;

  console.log("Middleware: User Role (from cookie):", role);
  console.log("Middleware: Request Path:", path);
  console.log("Middleware: Raw Path:", path);

  if (!role) {
    console.error("Middleware: User role not found - Redirecting to /error");
    return NextResponse.redirect(new URL("/error", request.nextUrl));
  }

  const allowedLinks = roleToLinks[role as keyof typeof roleToLinks];

  if (!allowedLinks) {
    console.error(
      "Middleware: No allowed links found for role",
      role,
      "- Redirecting to /error"
    );
    return NextResponse.redirect(new URL("/error", request.nextUrl));
  }

  let isAllowed = false;

  for (const link of allowedLinks) {
    if (link.href === path || path.startsWith(link.href + "/")) {
      isAllowed = true;
      break;
    }
  }

  if (!isAllowed) {
    console.log(
      "Middleware: Role",
      role,
      "is NOT allowed to access",
      path,
      "- Redirecting to /unauthorized"
    );
    return NextResponse.redirect(new URL("/unauthorized", request.nextUrl));
  }

  console.log("Middleware: Role", role, "is allowed to access", path);
  return NextResponse.next();
};
