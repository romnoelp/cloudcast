import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    console.error("❌ No authorization code received.");
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  console.log("🔹 Authorization code received:", code);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("❌ Error exchanging code for session:", error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // Fetch user role
  const { data: userData, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (roleError || !userData?.role) {
    console.error("Error fetching user role:", roleError);
    return NextResponse.redirect(`${origin}/error`);
  }

  const role = userData.role;

  const roleToDashboard: Record<string, string> = {
    admin: "/dashboard/admin",
    "product-manager": "/dashboard/product-manager",
    employee: "/dashboard/employee",
  };

  const targetPath = role ? roleToDashboard[role] || "/dashboard/employee" : "/dashboard/employee";

  const response = NextResponse.redirect(new URL(`${targetPath}`, origin));
  response.cookies.set("userRole", role);

  console.log("✅ Session successfully exchanged! Redirecting to:", targetPath);
  return response;
};