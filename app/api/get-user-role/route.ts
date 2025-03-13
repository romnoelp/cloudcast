import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const GET = async (req: NextRequest) => { 
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = user.user_metadata?.role;

  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }
  console.log("user role: ", {role});
  return NextResponse.json({ role });
};