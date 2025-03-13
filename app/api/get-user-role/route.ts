import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const GET = async (req: NextRequest) => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
      return NextResponse.json(
        { error: "Unauthorized", details: userError.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.user_metadata?.role;

    if (!role) {
      console.error("Role not found for user:", user);
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    console.log("User role:", { role });
    return NextResponse.json({ role });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
