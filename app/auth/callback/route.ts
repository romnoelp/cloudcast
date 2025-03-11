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
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("❌ Error exchanging code for session:", error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  console.log("✅ Session successfully exchanged! Redirecting to:", next);
  return NextResponse.redirect(`${origin}${next}`);
};
