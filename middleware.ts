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
        } = await supabase.auth.getUser();

        if (request.nextUrl.pathname === "/") {
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

            const roleToDashboard: Record<string, string> = {
                admin: "/dashboard/admin",
                "product-manager": "/dashboard/product-manager",
                employee: "/dashboard/employee",
            };

            const targetPath = roleToDashboard[role] || "/dashboard/employee";

            const response = NextResponse.redirect(new URL(targetPath, request.nextUrl));

            response.cookies.set("userRole", role, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 600,
            });

            return response;
        }

        // Check for userRole cookie before calling handleAuthSession
        const userRoleCookie = request.cookies.get("userRole");
        if (!userRoleCookie && request.nextUrl.pathname.startsWith("/dashboard")) {
            return NextResponse.redirect(new URL("/signin", request.nextUrl));
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