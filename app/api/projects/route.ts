import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const POST = async (req: NextRequest) => {
  const supabase = await createClient();
  const { name, description, organization_id, created_by } = await req.json();

  if (!name || !organization_id || !created_by) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase
      .from("projects")
      .insert([{ name, description, organization_id, created_by }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Project created successfully" },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
};

export const GET = async (req: NextRequest) => {
  const supabase = await createClient();
  const organizationId = req.nextUrl.searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("organization_id", organizationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
};
