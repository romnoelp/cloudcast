import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const GET = async (request: Request) => {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        console.error("❌ No authorization code received.");
        return NextResponse.redirect(`${origin}/general-error?error=no_code`);
    }

    console.log("🔹 Authorization code received:", code);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("❌ Error exchanging code for session:", error);
        return NextResponse.redirect(`${origin}/general-error?error=exchange_failed`);
    }

    // Fetch user role and update session metadata
    const { data: userData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

    if (roleError || !userData?.role) {
        console.error("Error fetching user role:", roleError);
        return NextResponse.redirect(`${origin}/general-error?error=role_fetch_failed`);
    }

    const role = userData.role;

    // Update session metadata with the role
    const { error: updateError } = await supabase.auth.updateUser({
        data: { role: role },
    });

    if (updateError) {
        console.error("Error updating user metadata:", updateError);
        return NextResponse.redirect(`${origin}/general-error?error=metadata_update_failed`);
    }

    const roleToDashboard: Record<string, string> = {
        admin: "/dashboard/admin",
        "product-manager": "/dashboard/product-manager",
        employee: "/dashboard/employee",
    };

    const targetPath = roleToDashboard[role] || "/dashboard/employee";

    const response = NextResponse.redirect(new URL(`${targetPath}`, origin));

    response.cookies.set("userRole", role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7
    });

    console.log("✅ Session successfully exchanged! Redirecting to:", targetPath);
    return response;
};